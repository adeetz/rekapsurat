<?php
// api/update_password.php
header('Content-Type: text/plain');
require_once 'config/database.php';

$username = 'admin';
$password = 'admin123';  // Set ke password yang benar
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
    $result = $stmt->execute([$hash, $username]);
    
    if ($result) {
        echo "Password berhasil diupdate!\n";
        echo "Username: " . $username . "\n";
        echo "Password: " . $password . "\n";
        echo "New Hash: " . $hash . "\n";
        
        // Verifikasi
        $checkStmt = $pdo->prepare("SELECT password FROM users WHERE username = ?");
        $checkStmt->execute([$username]);
        $user = $checkStmt->fetch();
        
        echo "\nVerification test:\n";
        echo "admin123: " . (password_verify('admin123', $user['password']) ? "Valid" : "Invalid") . "\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}