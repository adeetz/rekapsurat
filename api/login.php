<?php
// Handle CORS
header("Access-Control-Allow-Origin: https://doc.gamatekno.co.id");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

require_once 'config/database.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username dan password harus diisi');
    }

    // Sanitize input
    $username = trim($input['username']);
    $password = $input['password'];

    // Check if fields are empty
    if (empty($username) || empty($password)) {
        throw new Exception('Username dan password tidak boleh kosong');
    }

    // Query user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // Verify user and password
    if (!$user || !password_verify($password, $user['password'])) {
        throw new Exception('Username atau password salah');
    }

    // Remove password from response
    unset($user['password']);

    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET 
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?");
    $updateStmt->execute([$user['id']]);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Login berhasil',
        'data' => $user
    ]);

} catch (PDOException $e) {
    // Log database error
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    // Handle other errors
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}