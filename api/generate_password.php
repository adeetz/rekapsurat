<?php
// api/generate_password.php
$password = "password123"; // Ganti dengan password yang diinginkan
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Password: " . $password . "\n";
echo "Hash: " . $hash . "\n";
echo "Verification test: " . (password_verify($password, $hash) ? "Valid" : "Invalid");