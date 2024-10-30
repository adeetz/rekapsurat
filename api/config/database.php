<?php
// C:\xampp\htdocs\rekapsurat\api\config\database.php

// Enable error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors ke file
ini_set('log_errors', 1);
ini_set('error_log', 'database-errors.log');

// Database configuration
$host = 'localhost';
$db   = 'dbrekapsurat';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

try {
   $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
   
   $options = [
       PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
       PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
       PDO::ATTR_EMULATE_PREPARES => false,
       PDO::ATTR_PERSISTENT => true,
       PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
   ];

   // Buat koneksi PDO
   $pdo = new PDO($dsn, $user, $pass, $options);
   
   // Test koneksi
   $pdo->query('SELECT 1');
   
   // Log sukses
   error_log("Database connection established successfully");

} catch(PDOException $e) {
   // Log error
   error_log("Connection failed: " . $e->getMessage());
   
   // Throw exception dengan detail error
   throw new PDOException(
       "Connection failed: " . $e->getMessage(), 
       (int)$e->getCode()
   );
}

// Function untuk sanitize input
function sanitizeInput($data) {
   return htmlspecialchars(strip_tags(trim($data)));
}

// Function untuk generate response JSON
function sendJsonResponse($status, $message, $data = null) {
   header('Content-Type: application/json');
   echo json_encode([
       'status' => $status,
       'message' => $message,
       'data' => $data
   ]);
   exit();
}

// Function untuk validasi input
function validateRequiredFields($data, $required) {
   foreach ($required as $field) {
       if (!isset($data[$field]) || empty(trim($data[$field]))) {
           throw new Exception("Field '$field' is required");
       }
   }
}

// Function untuk check if table exists
function tableExists($pdo, $table) {
   try {
       $result = $pdo->query("SELECT 1 FROM $table LIMIT 1");
   } catch (Exception $e) {
       return false;
   }
   return $result !== false;
}

// Check if users table exists, if not create it
if (!tableExists($pdo, 'users')) {
   try {
       $pdo->exec("CREATE TABLE IF NOT EXISTS users (
           id INT AUTO_INCREMENT PRIMARY KEY,
           username VARCHAR(50) NOT NULL UNIQUE,
           password VARCHAR(255) NOT NULL,
           name VARCHAR(100),
           email VARCHAR(100),
           role VARCHAR(20) DEFAULT 'user',
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
       
       // Create default admin user if table was just created
       $adminExists = $pdo->query("SELECT 1 FROM users WHERE username = 'admin' LIMIT 1");
       if (!$adminExists->fetch()) {
           $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
           $pdo->exec("INSERT INTO users (username, password, name, role) 
                      VALUES ('admin', '$hashedPassword', 'Administrator', 'admin')");
       }
       
       error_log("Users table created successfully with default admin user");
   } catch (PDOException $e) {
       error_log("Error creating users table: " . $e->getMessage());
       throw $e;
   }
}

// Check if surat table exists, if not create it
if (!tableExists($pdo, 'surat')) {
   try {
       $pdo->exec("CREATE TABLE IF NOT EXISTS surat (
           id INT AUTO_INCREMENT PRIMARY KEY,
           nomor_surat VARCHAR(50) NOT NULL,
           perihal TEXT NOT NULL,
           tanggal DATE NOT NULL,
           jenis ENUM('Surat Masuk', 'Surat Keluar') NOT NULL,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
           created_by INT,
           FOREIGN KEY (created_by) REFERENCES users(id)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
       
       error_log("Surat table created successfully");
   } catch (PDOException $e) {
       error_log("Error creating surat table: " . $e->getMessage());
       throw $e;
   }
}