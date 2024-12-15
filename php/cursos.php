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
    $collection = $database->cursos;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
       if (isset($_GET['id'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $curso = $collection->findOne(['_id' => $id]);

            if ($curso) {
                $curso['_id'] = (string) $curso['_id'];
                echo json_encode(['success' => true, 'curso' => $curso]);
            } else {
                echo json_encode(['success' => false, 'message' => 'curso no encontrada']);
            }
        } else {
            // Si no se proporciona el ID, obtener todos los cursos
            try {
                // Obtener todos los cursos de la colección
                $cursos = $collection->find(); // Aquí puedes filtrar o limitar los resultados si es necesario

                // Convertir los resultados a un array
                $cursosArray = iterator_to_array($cursos);

                // Limpiar el ID que MongoDB agrega automáticamente (MongoDB añade un campo _id que es único)
                foreach ($cursosArray as &$curso) {
                    $curso['_id'] = (string) $curso['_id']; // Convertir ObjectId a string para que sea legible en JSON
                }

                // Enviar los datos de todos los cursos en formato JSON
                echo json_encode(['success' => true, 'data' => $cursosArray]);

            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Error al obtener los cursos: ' . $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['nombre'], $data['descripcion'])) {
            $curso = [
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'],
            ];

            $result = $collection->insertOne($curso);
            echo json_encode(['success' => true, 'id' => (string) $result->getInsertedId()]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos insuficientes para crear la curso']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($_GET['id'], $data['nombre'], $data['descripcion'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $collection->updateOne(
                ['_id' => $id],
                ['$set' => ['nombre' => $data['nombre'], 'descripcion' => $data['descripcion']]]
            );

            if ($result->getModifiedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'curso actualizada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se realizaron cambios']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos insuficientes para actualizar la curso']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = new MongoDB\BSON\ObjectId($_GET['id']);
            $result = $collection->deleteOne(['_id' => $id]);

            if ($result->getDeletedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'curso eliminada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'curso no encontrada']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID de curso no proporcionado']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}