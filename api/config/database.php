<?php
// C:\xampp\htdocs\rekapsurat\api\config\database.php

// Enable error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors ke file
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/database-errors.log');

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'db_rekapsurat',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
];

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_PERSISTENT => true,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$db_config['charset']}"
    ];

    // Create PDO instance
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $options);
    
    // Test connection
    $pdo->query('SELECT 1');
    error_log("Database connection established successfully");

} catch(PDOException $e) {
    error_log("Connection failed: " . $e->getMessage());
    throw new PDOException(
        "Connection failed: " . $e->getMessage(), 
        (int)$e->getCode()
    );
}

// Helper Functions
class DatabaseHelper {
    // Sanitize input
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    // Generate JSON response
    public static function sendJsonResponse($status, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'status' => $status,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Validate required fields
    public static function validateRequiredFields($data, $required) {
        $missing = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $missing[] = $field;
            }
        }
        if (!empty($missing)) {
            throw new Exception("Field berikut harus diisi: " . implode(', ', $missing));
        }
        return true;
    }

    // Check if table exists
    public static function tableExists($pdo, $table) {
        try {
            $result = $pdo->query("SHOW TABLES LIKE '$table'");
            return $result->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
}

// Initialize database tables
function initializeTables($pdo) {
    // Create users table
    if (!DatabaseHelper::tableExists($pdo, 'users')) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                email VARCHAR(100),
                role ENUM('admin', 'user') DEFAULT 'user',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                status ENUM('active', 'inactive') DEFAULT 'active',
                KEY idx_username (username),
                KEY idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            
            // Create default admin user
            $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
            $pdo->exec("INSERT INTO users (username, password, name, role, status) 
                       VALUES ('admin', '$hashedPassword', 'Administrator', 'admin', 'active')");
            
            error_log("Users table created successfully with default admin user");
        } catch (PDOException $e) {
            error_log("Error creating users table: " . $e->getMessage());
            throw $e;
        }
    }

    // Create surat table
    if (!DatabaseHelper::tableExists($pdo, 'surat')) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS surat (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nomor_surat VARCHAR(50) NOT NULL,
                perihal TEXT NOT NULL,
                tanggal DATE NOT NULL,
                jenis ENUM('Surat Masuk', 'Surat Keluar') NOT NULL,
                status ENUM('aktif', 'arsip') DEFAULT 'aktif',
                file_path VARCHAR(255),
                keterangan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_by INT,
                updated_by INT,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
                KEY idx_nomor (nomor_surat),
                KEY idx_tanggal (tanggal),
                KEY idx_jenis (jenis),
                KEY idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            
            error_log("Surat table created successfully");
        } catch (PDOException $e) {
            error_log("Error creating surat table: " . $e->getMessage());
            throw $e;
        }
    }
}

// Initialize tables
try {
    initializeTables($pdo);
} catch (Exception $e) {
    error_log("Error initializing tables: " . $e->getMessage());
    throw $e;
}

// Make helper class available globally
global $dbHelper;
$dbHelper = new DatabaseHelper();