<?php
// api/fix_password.php
header('Content-Type: text/plain');
require_once 'config/database.php';

try {
    // Set password yang kita inginkan
    $username = 'admin';
    $password = 'admin123'; // kita tetapkan admin123 sebagai password
    
    // Generate hash baru
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Update database
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
    $result = $stmt->execute([$hash, $username]);
    
    if ($result) {
        echo "Password berhasil direset!\n\n";
        echo "Username: admin\n";
        echo "Password: admin123\n";
        echo "New Hash: " . $hash . "\n\n";
        
        // Verifikasi
        $stmt = $pdo->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        echo "Verification test:\n";
        echo "Result: " . (password_verify($password, $user['password']) ? "Valid" : "Invalid") . "\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}