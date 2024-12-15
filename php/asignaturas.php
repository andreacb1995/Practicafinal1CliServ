<?php

// Configuración y manejo de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Autoload de MongoDB
require '../vendor/autoload.php';

try {
    // Conexión a MongoDB
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1; // Nombre de la base de datos
    $cursosCollection = $database->cursos;   // Colección de cursos
    $asignaturasCollection = $database->asignaturas; // Colección de asignaturas
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener asignaturas por cursoId
        if (isset($_GET['cursoId'])) {
            try {
                $cursoId = new MongoDB\BSON\ObjectId($_GET['cursoId']);
                $asignaturas = $asignaturasCollection->find(['cursoId' => $cursoId]);
                $asignaturasArray = iterator_to_array($asignaturas);
        
                // Convertir ObjectId a string para enviarlo como respuesta
                foreach ($asignaturasArray as &$asignatura) {
                    $asignatura['_id'] = (string) $asignatura['_id'];
                    $asignatura['cursoId'] = (string) $asignatura['cursoId'];
                }
        
                echo json_encode(['success' => true, 'asignaturas' => $asignaturasArray]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'cursoId inválido: ' . $e->getMessage()]);
            }
        } elseif (isset($_GET['id'])) {
            // Obtener una asignatura específica por su ID
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $asignatura = $asignaturasCollection->findOne(['_id' => $id]);

            if ($asignatura) {
                $asignatura['_id'] = (string) $asignatura['_id'];
                echo json_encode(['success' => true, 'asignatura' => $asignatura]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Asignatura no encontrada']);
            }
        } else {
            // Si no se proporcionan parámetros, devolver todas las asignaturas
            $asignaturas = $asignaturasCollection->find();
            $asignaturasArray = iterator_to_array($asignaturas);

            foreach ($asignaturasArray as &$asignatura) {
                $asignatura['_id'] = (string) $asignatura['_id'];
            }

            echo json_encode(['success' => true, 'asignaturas' => $asignaturasArray]);
        }
        break;

    case 'POST':
        // Crear una nueva asignatura
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['cursoId'], $data['nombre'])) {
            $asignatura = [
                'cursoId' => $data['cursoId'],
                'nombre' => $data['nombre'],
            ];

            $result = $asignaturasCollection->insertOne($asignatura);
            echo json_encode(['success' => true, 'id' => (string) $result->getInsertedId()]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos insuficientes para crear la asignatura']);
        }
        break;

    case 'PUT':
        // Actualizar una asignatura
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($_GET['id'], $data['nombre'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $asignaturasCollection->updateOne(
                ['_id' => $id],
                ['$set' => ['nombre' => $data['nombre']]]
            );

            if ($result->getModifiedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Asignatura actualizada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se realizaron cambios']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos insuficientes para actualizar la asignatura']);
        }
        break;

    case 'DELETE':
        // Eliminar una asignatura
        if (isset($_GET['id'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $asignaturasCollection->deleteOne(['_id' => $id]);

            if ($result->getDeletedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Asignatura eliminada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Asignatura no encontrada']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID de asignatura no proporcionado']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
