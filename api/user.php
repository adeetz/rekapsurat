<?php
// api/user.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug log
    error_log("Request Method: " . $method);
    error_log("Input data: " . print_r($input, true));

    switch ($method) {
        case 'GET':
            $stmt = $pdo->query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
            echo json_encode([
                'status' => 'success',
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ]);
            break;

        case 'POST':
            if (!isset($input['username']) || !isset($input['password'])) {
                throw new Exception("Username dan password harus diisi");
            }

            // Check if username already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$input['username']]);
            if ($stmt->fetch()) {
                throw new Exception("Username sudah digunakan");
            }

            // Insert new user
            $sql = "INSERT INTO users (username, password, role) VALUES (:username, :password, :role)";
            $stmt = $pdo->prepare($sql);
            
            $result = $stmt->execute([
                ':username' => $input['username'],
                ':password' => password_hash($input['password'], PASSWORD_DEFAULT),
                ':role' => $input['role'] ?? 'user'
            ]);

            if ($result) {
                $userId = $pdo->lastInsertId();
                echo json_encode([
                    'status' => 'success',
                    'message' => 'User berhasil ditambahkan',
                    'data' => [
                        'id' => $userId,
                        'username' => $input['username'],
                        'role' => $input['role'] ?? 'user'
                    ]
                ]);
            } else {
                throw new Exception("Gagal menambahkan user");
            }
            break;

        case 'PUT':
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $uriParts = explode('/', $uri);
            $id = isset($uriParts[4]) ? (int) $uriParts[4] : null;

            if (!$id) {
                throw new Exception("ID tidak valid");
            }

            $updates = [];
            $params = [':id' => $id];

            if (isset($input['username'])) {
                // Check if new username already exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
                $stmt->execute([$input['username'], $id]);
                if ($stmt->fetch()) {
                    throw new Exception("Username sudah digunakan");
                }
                $updates[] = "username = :username";
                $params[':username'] = $input['username'];
            }

            if (!empty($input['password'])) {
                $updates[] = "password = :password";
                $params[':password'] = password_hash($input['password'], PASSWORD_DEFAULT);
            }

            if (isset($input['role'])) {
                $updates[] = "role = :role";
                $params[':role'] = $input['role'];
            }

            if (empty($updates)) {
                throw new Exception("Tidak ada data yang diupdate");
            }

            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute($params)) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'User berhasil diupdate'
                ]);
            } else {
                throw new Exception("Gagal mengupdate user");
            }
            break;

            case 'DELETE':
                // Ambil ID dari query parameter GET
                $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
                error_log("Delete request for ID: " . $id); // Debug log
    
                if (!$id) {
                    throw new Exception("ID tidak valid");
                }
    
                // Begin transaction
                $pdo->beginTransaction();
    
                try {
                    // Check if user exists
                    $checkStmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
                    $checkStmt->execute([$id]);
                    $user = $checkStmt->fetch();
    
                    if (!$user) {
                        throw new Exception("User tidak ditemukan");
                    }
    
                    // Check if last admin
                    if ($user['role'] === 'admin') {
                        $adminCount = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
                        if ($adminCount <= 1) {
                            throw new Exception("Tidak dapat menghapus admin terakhir");
                        }
                    }
    
                    // Delete user
                    $deleteStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
                    $success = $deleteStmt->execute([$id]);
    
                    if (!$success) {
                        throw new Exception("Gagal menghapus user");
                    }
    
                    // Check if deletion was successful
                    if ($deleteStmt->rowCount() === 0) {
                        throw new Exception("User tidak berhasil dihapus");
                    }
    
                    // Commit transaction
                    $pdo->commit();
                    
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'User berhasil dihapus'
                    ]);
    
                } catch (Exception $e) {
                    // Rollback jika terjadi error
                    $pdo->rollBack();
                    throw $e;
                }
                break;
            
        default:
            throw new Exception("Method tidak diizinkan");
    }
} catch (Exception $e) {
    error_log("Error in user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}