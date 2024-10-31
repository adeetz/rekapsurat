<?php
// Handle CORS
header("Access-Control-Allow-Origin: *");  // Ubah sesuai domain yang diizinkan
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// Log untuk debug
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . json_encode(getallheaders()));

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

require_once 'config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("Received input: " . json_encode($input));  // Log input
    
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username dan password harus diisi');
    }

    $username = trim($input['username']);
    $password = $input['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        throw new Exception('Username atau password salah');
    }

    unset($user['password']);

    $updateStmt = $pdo->prepare("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $updateStmt->execute([$user['id']]);

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
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}