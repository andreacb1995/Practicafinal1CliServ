<?php

// Configuración y manejo de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require '../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1;
    $empresasCollection = $database->empresas;
    $alumnosCollection = $database->alumnos;
    $ofertasCollection = $database->ofertas;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($method) {
    case 'GET':
        if ($action === 'getAlumnosCompatibles' && isset($_GET['empresaId'])) {
            $empresaId = $_GET['empresaId'];
            $empresa = $empresasCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($empresaId)]);

            if ($empresa) {
                $rama = $empresa['rama'];
                $alumnos = $alumnosCollection->find(['formacion' => $rama]);
                $alumnosArray = iterator_to_array($alumnos);

                foreach ($alumnosArray as &$alumno) {
                    $alumno['_id'] = (string) $alumno['_id'];
                }

                echo json_encode(['success' => true, 'alumnos' => $alumnosArray]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Empresa no encontrada']);
            }
        } elseif (isset($_GET['id'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $oferta = $ofertasCollection->findOne(['_id' => $id]);

            if ($oferta) {
                $oferta['_id'] = (string) $oferta['_id'];
                echo json_encode(['success' => true, 'oferta' => $oferta]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Oferta no encontrada']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Faltan parámetros']);
        }
        break;

    case 'POST':
        if ($action === 'asignarAlumnos') {
            $data = json_decode(file_get_contents('php://input'), true);
            $ofertaId = $data['ofertaId'];
            $alumnosAsignados = $data['alumnos'];

            if ($ofertaId && $alumnosAsignados) {
                $result = $ofertasCollection->updateOne(
                    ['_id' => new MongoDB\BSON\ObjectId($ofertaId)],
                    ['$set' => ['alumnosAsignados' => $alumnosAsignados]]
                );

                if ($result->getModifiedCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Alumnos asignados correctamente']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se realizaron cambios']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Datos insuficientes']);
            }
        } else {
            $data = json_decode(file_get_contents("php://input"), true);

            if (isset($data['empresaId'], $data['nombre'], $data['descripcion'])) {
                $oferta = [
                    'empresaId' => $data['empresaId'],
                    'nombre' => $data['nombre'],
                    'descripcion' => $data['descripcion'],
                ];

                $result = $ofertasCollection->insertOne($oferta);
                echo json_encode(['success' => true, 'id' => (string) $result->getInsertedId()]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Datos insuficientes para crear la oferta']);
            }
        }
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);

        if (isset($_GET['id'], $data['nombre'], $data['descripcion'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $ofertasCollection->updateOne(
                ['_id' => $id],
                ['$set' => ['nombre' => $data['nombre'], 'descripcion' => $data['descripcion']]]
            );

            if ($result->getModifiedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Oferta actualizada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se realizaron cambios']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos insuficientes para actualizar la oferta']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $ofertasCollection->deleteOne(['_id' => $id]);

            if ($result->getDeletedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Oferta eliminada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Oferta no encontrada']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID de oferta no proporcionado']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
