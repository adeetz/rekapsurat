<?php
// api/check_password.php
header('Content-Type: text/plain');
require_once 'config/database.php';

// Test kedua password
$passwords = [
    'password123' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin123' => password_hash('admin123', PASSWORD_DEFAULT)
];

foreach ($passwords as $password => $hash) {
    echo "Testing password: " . $password . "\n";
    echo "Hash: " . $hash . "\n";
    echo "Verification: " . (password_verify($password, $hash) ? "Valid" : "Invalid") . "\n\n";
}

// Cek password di database
$stmt = $pdo->prepare("SELECT username, password FROM users WHERE username = 'admin'");
$stmt->execute();
$user = $stmt->fetch();

if ($user) {
    echo "Current database password for admin:\n";
    echo "Hash in database: " . $user['password'] . "\n";
    echo "Test with password123: " . (password_verify('password123', $user['password']) ? "Valid" : "Invalid") . "\n";
    echo "Test with admin123: " . (password_verify('admin123', $user['password']) ? "Valid" : "Invalid") . "\n";
}