<?php
// Matikan header yang mungkin sudah di set di file lain
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');

// Set header CORS yang benar
header("Access-Control-Allow-Origin: https://doc.gamatekno.co.id");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username dan password harus diisi');
    }

    $username = trim($input['username']);
    $password = $input['password'];

    // Get user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        throw new Exception('Username atau password salah');
    }

    // Update timestamp
    $updateStmt = $pdo->prepare("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $updateStmt->execute([$user['id']]);

    // Remove password from response
    unset($user['password']);

    echo json_encode([
        'status' => 'success',
        'message' => 'Login berhasil',
        'data' => $user
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}