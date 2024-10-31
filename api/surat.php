<?php
// api/surat.php
require_once 'config/database.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'surat-api-errors.log');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class SuratAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function getAllSurat() {
        try {
            $stmt = $this->pdo->query('SELECT * FROM surat ORDER BY created_at DESC');
            $result = $stmt->fetchAll();
            
            return [
                'status' => 'success',
                'message' => 'Data berhasil diambil',
                'data' => $result
            ];
        } catch (PDOException $e) {
            error_log("Error fetching data: " . $e->getMessage());
            throw new Exception("Gagal mengambil data surat");
        }
    }
    
    public function createSurat($data) {
        try {
            // Validate required fields
            $required = ['nomor_surat', 'perihal', 'tanggal', 'jenis'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Field {$field} harus diisi");
                }
            }

            $sql = "INSERT INTO surat (nomor_surat, perihal, tanggal, jenis, created_by) 
                    VALUES (:nomor_surat, :perihal, :tanggal, :jenis, :created_by)";
            
            $stmt = $this->pdo->prepare($sql);
            $created_by = $data['created_by'] ?? 1; // Default value if not provided
            
            $success = $stmt->execute([
                ':nomor_surat' => $data['nomor_surat'],
                ':perihal' => $data['perihal'],
                ':tanggal' => $data['tanggal'],
                ':jenis' => $data['jenis'],
                ':created_by' => $created_by
            ]);
            
            if (!$success) {
                throw new Exception("Gagal menambahkan surat");
            }
            
            return [
                'status' => 'success',
                'message' => 'Surat berhasil ditambahkan',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            error_log("Error creating surat: " . $e->getMessage());
            throw new Exception("Gagal menambahkan surat: " . $e->getMessage());
        }
    }
    
    public function updateSurat($id, $data) {
        try {
            // Validate ID
            if (!$id || !is_numeric($id)) {
                throw new Exception("ID tidak valid");
            }

            // Check if surat exists
            $checkStmt = $this->pdo->prepare("SELECT id FROM surat WHERE id = ?");
            $checkStmt->execute([$id]);
            if ($checkStmt->rowCount() === 0) {
                throw new Exception("Surat tidak ditemukan");
            }

            $sql = "UPDATE surat 
                    SET nomor_surat = :nomor_surat,
                        perihal = :perihal,
                        tanggal = :tanggal,
                        jenis = :jenis,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";
            
            $stmt = $this->pdo->prepare($sql);
            $success = $stmt->execute([
                ':id' => $id,
                ':nomor_surat' => $data['nomor_surat'],
                ':perihal' => $data['perihal'],
                ':tanggal' => $data['tanggal'],
                ':jenis' => $data['jenis']
            ]);
            
            if (!$success) {
                throw new Exception("Gagal mengupdate surat");
            }
            
            return [
                'status' => 'success',
                'message' => 'Surat berhasil diupdate'
            ];
        } catch (PDOException $e) {
            error_log("Error updating surat: " . $e->getMessage());
            throw new Exception("Gagal mengupdate surat: " . $e->getMessage());
        }
    }
    
    public function deleteSurat($id) {
        try {
            // Validate ID
            if (!$id || !is_numeric($id)) {
                throw new Exception("ID tidak valid");
            }

            // Begin transaction
            $this->pdo->beginTransaction();

            try {
                // Check if surat exists
                $checkStmt = $this->pdo->prepare("SELECT id FROM surat WHERE id = ?");
                if (!$checkStmt->execute([$id])) {
                    throw new Exception("Gagal memeriksa surat");
                }

                if ($checkStmt->rowCount() === 0) {
                    throw new Exception("Surat tidak ditemukan");
                }

                // Delete surat
                $deleteStmt = $this->pdo->prepare("DELETE FROM surat WHERE id = ?");
                if (!$deleteStmt->execute([$id])) {
                    throw new Exception("Gagal menghapus surat");
                }

                if ($deleteStmt->rowCount() === 0) {
                    throw new Exception("Surat gagal dihapus");
                }

                // Commit transaction
                $this->pdo->commit();

                return [
                    'status' => 'success',
                    'message' => 'Surat berhasil dihapus'
                ];

            } catch (Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        } catch (PDOException $e) {
            error_log("Database error in deleteSurat: " . $e->getMessage());
            throw new Exception("Gagal menghapus surat: " . $e->getMessage());
        }
    }
}

// Initialize API
$suratAPI = new SuratAPI($pdo);

try {
    // Get request method and query parameters
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    // Get request body for POST/PUT
    $input = null;
    if (in_array($method, ['POST', 'PUT'])) {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON data");
        }
    }

    // Log incoming request
    error_log("Incoming {$method} request - ID: " . ($id ?? 'none') . 
             ", Input: " . ($input ? json_encode($input) : 'none'));

    $response = null;
    
    switch ($method) {
        case 'GET':
            $response = $suratAPI->getAllSurat();
            break;
            
        case 'POST':
            if (!$input) {
                throw new Exception("Data input tidak valid");
            }
            $response = $suratAPI->createSurat($input);
            break;
            
        case 'PUT':
            if (!$id || !$input) {
                throw new Exception("ID atau data input tidak valid");
            }
            $response = $suratAPI->updateSurat($id, $input);
            break;
            
        case 'DELETE':
            if (!$id) {
                throw new Exception("ID tidak ditemukan dalam request");
            }
            $response = $suratAPI->deleteSurat($id);
            break;
            
        default:
            throw new Exception("Method tidak diizinkan", 405);
    }
    
    // Send success response
    if ($response) {
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    // Log error
    error_log("API Error ({$method}): " . $e->getMessage());
    
    // Set appropriate status code
    $statusCode = $e->getCode() ?: 500;
    http_response_code($statusCode);
    
    // Send error response
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}