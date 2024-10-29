<?php
// api/surat.php
require_once 'config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
            return ['status' => 'success', 'data' => $stmt->fetchAll()];
        } catch (PDOException $e) {
            throw new Exception("Error fetching data: " . $e->getMessage());
        }
    }
    
    public function createSurat($data) {
        try {
            $sql = "INSERT INTO surat (nomor_surat, perihal, tanggal, jenis, created_by) 
                    VALUES (:nomor_surat, :perihal, :tanggal, :jenis, :created_by)";
            
            $stmt = $this->pdo->prepare($sql);
            $created_by = $data['created_by'] ?? 1; // Default value jika tidak ada
            
            $stmt->execute([
                ':nomor_surat' => $data['nomor_surat'],
                ':perihal' => $data['perihal'],
                ':tanggal' => $data['tanggal'],
                ':jenis' => $data['jenis'],
                ':created_by' => $created_by
            ]);
            
            return [
                'status' => 'success',
                'message' => 'Surat berhasil ditambahkan',
                'id' => $this->pdo->lastInsertId()
            ];
        } catch (PDOException $e) {
            throw new Exception("Error creating surat: " . $e->getMessage());
        }
    }
    
    public function updateSurat($id, $data) {
        try {
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
                throw new Exception("Failed to update surat");
            }
            
            return ['status' => 'success', 'message' => 'Surat berhasil diupdate'];
        } catch (PDOException $e) {
            throw new Exception("Error updating surat: " . $e->getMessage());
        }
    }
    
    public function deleteSurat($id) {
        try {
            $sql = "DELETE FROM surat WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $success = $stmt->execute([':id' => $id]);
            
            if (!$success) {
                throw new Exception("Failed to delete surat");
            }
            
            return ['status' => 'success', 'message' => 'Surat berhasil dihapus'];
        } catch (PDOException $e) {
            throw new Exception("Error deleting surat: " . $e->getMessage());
        }
    }
}

// Inisialisasi API
$suratAPI = new SuratAPI($pdo);

// Mendapatkan request method dan URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriParts = explode('/', $uri);
$id = isset($uriParts[4]) ? (int) $uriParts[4] : null;

// Mendapatkan data input
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            echo json_encode($suratAPI->getAllSurat());
            break;
            
        case 'POST':
            if (!$input) {
                throw new Exception("Invalid input data");
            }
            echo json_encode($suratAPI->createSurat($input));
            break;
            
        case 'PUT':
            if (!$id || !$input) {
                throw new Exception("Invalid input data or ID");
            }
            echo json_encode($suratAPI->updateSurat($id, $input));
            break;
            
        case 'DELETE':
            if (!$id) {
                throw new Exception("Invalid ID");
            }
            echo json_encode($suratAPI->deleteSurat($id));
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}