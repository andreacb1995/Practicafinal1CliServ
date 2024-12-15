<?php

// Desactivar la visualización de errores en producción
ini_set('display_errors', 1); // Desactivar los errores visuales
error_reporting(E_ALL); // Mantener el registro de errores

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");  // Permitir GET, POST, DELETE y OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true"); // Permitir credenciales (cookies)
header('Content-Type: application/json');

// Incluir el autoload de Composer (asegúrate de tener MongoDB instalado mediante Composer)
require '../vendor/autoload.php'; // Ajusta la ruta según la ubicación de `alumnos.php`

// Conectar a MongoDB
try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1; // Nombre de tu base de datos
    $collection = $database->empresas; // Nombre de la colección
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Verificar si es una solicitud GET (para obtener una empresa o todas las empresas)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $empresaId = isset($_GET['id']) ? $_GET['id'] : null;
    $accion = isset($_GET['accion']) ? $_GET['accion'] : null;

    if ($empresaId) {
        try {
            $id = new MongoDB\BSON\ObjectId($empresaId);
            $empresa = $collection->findOne(['_id' => $id]);

            if ($empresa) {
                $empresa['_id'] = (string) $empresa['_id'];
                echo json_encode(['success' => true, 'empresa' => $empresa]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Empresa no encontrada']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener la empresa: ' . $e->getMessage()]);
        }
    } else {
        try {
            $filter = [];

            // Filtrar según la acción
            if ($accion === 'fct') {
                $filter = ['fct' => true];
            } elseif ($accion === 'bolsa') {
                $filter = ['bolsa' => true];
            }

            $empresas = $collection->find($filter);
            $empresasArray = iterator_to_array($empresas);

            foreach ($empresasArray as &$empresa) {
                $empresa['_id'] = (string) $empresa['_id'];
            }

            echo json_encode(['success' => true, 'data' => $empresasArray]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener las empresas: ' . $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['nombre']) && isset($data['telefono']) && isset($data['email']) && isset($data['persona_de_contacto'])) {
        $empresa = [
            'nombre' => $data['nombre'],
            'telefono' => $data['telefono'],
            'email' => $data['email'],
            'persona_de_contacto' => $data['persona_de_contacto'],
            'rama' => $data['rama'] ?? '',
            'oferta' => $data['oferta'] ?? '',
            'fct' => $data['fct'] ?? false,
            'bolsa' => $data['bolsa'] ?? false 
        ];

        if (isset($data['_id']) && !empty($data['_id'])) {
            try {
                $id = new MongoDB\BSON\ObjectId($data['_id']);
                $result = $collection->updateOne(['_id' => $id], ['$set' => $empresa]);

                if ($result->getModifiedCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Empresa actualizada correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontró la empresa o no hubo cambios.']);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
            }
        } else {
            try {
                $result = $collection->insertOne($empresa);

                if ($result->getInsertedCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Empresa guardada correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al guardar la empresa.']);
                }
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Error al insertar: ' . $e->getMessage()]);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Faltan datos en el formulario.']);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $empresaId = isset($_GET['id']) ? $_GET['id'] : null;

    if ($empresaId) {
        try {
            $id = new MongoDB\BSON\ObjectId($empresaId);
            $result = $collection->deleteOne(['_id' => $id]);

            if ($result->getDeletedCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Empresa eliminada correctamente.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró la empresa.']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la empresa: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de la empresa no proporcionado']);
    }
}


?>
