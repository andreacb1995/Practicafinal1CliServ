<?php

// Configuración y manejo de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Autoload de MongoDB
require '../vendor/autoload.php';

try {
    // Conexión a MongoDB
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1; 
    $notasCollection = $database->notas; // Colección de notas
    $alumnosCollection = $database->alumnos; // Colección de alumnos

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['idAsignatura'])) {

            $idAsignatura = new MongoDB\BSON\ObjectId($_GET['idAsignatura']);
            $notas = $notasCollection->find(['idAsignatura' => $idAsignatura]);
            $notasArray = iterator_to_array($notas);
    
            // Convertir ObjectId a string para enviarlo como respuesta
            foreach ($notasArray as &$nota) {
                $nota['_id'] = (string) $nota['_id'];
                $nota['idAsignatura'] = (string) $nota['idAsignatura'];
                $nota['idAlumno'] = (string) $nota['idAlumno'];

                // Buscar el nombre del alumno en la colección alumnos
                $alumno = $alumnosCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($nota['idAlumno'])]);

                $nota['alumno'] = $alumno ? $alumno['nombre'] : 'Alumno no encontrado';
                $nota['apellidos'] = $alumno ? $alumno['apellidos'] : 'Apellidos no encontrados';

            }
    
            echo json_encode(['success' => true, 'notas' => $notasArray]);
        } else {
            echo json_encode(['success' => false, 'message' => 'idAsignatura no proporcionado']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
