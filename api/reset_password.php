<?php
// api/reset_password.php
header('Content-Type: text/plain');
require_once 'config/database.php';

// Password yang ingin diset
$username = 'admin';
$password = 'password123';

// Generate hash baru
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // Update password di database
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
    $result = $stmt->execute([$hash, $username]);
    
    if ($result) {
        echo "Password berhasil diupdate!\n\n";
        echo "Username: " . $username . "\n";
        echo "Password: " . $password . "\n";
        echo "Hash: " . $hash . "\n";
        
        // Verifikasi password
        $stmt = $pdo->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        echo "\nVerifikasi: " . (password_verify($password, $user['password']) ? "Valid" : "Invalid");
    } else {
        echo "Gagal update password";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}