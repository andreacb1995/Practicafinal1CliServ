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

// Conexión con MongoDB
try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $database = $client->proyectofinal1;
    $empresasCollection = $database->empresas;
    $ofertasCollection = $database->ofertas;
    $alumnosCollection = $database->alumnos;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Manejo de las rutas y métodos
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;

// Validar las acciones y métodos
try {
    switch ($method) {
        case 'GET':
            if ($action === 'getAlumnosCompatibles' && isset($_GET['empresaId'])) {
                getAlumnosCompatibles($empresasCollection, $alumnosCollection);
            } elseif ($action === 'getAlumnosAsignados' && isset($_GET['ofertaId'])) {
                getAlumnosAsignados($ofertasCollection, $alumnosCollection);
            } else {
                echo json_encode(['success' => false, 'message' => 'Acción no válida o parámetros faltantes.']);
            }
            break;

        case 'POST':
            if ($action === 'asignarAlumno') {
                asignarAlumno($ofertasCollection);
            } else {
                echo json_encode(['success' => false, 'message' => 'Acción POST no válida.']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

// Función para obtener alumnos compatibles
function getAlumnosCompatibles($empresasCollection, $alumnosCollection)
{
    $empresaId = $_GET['empresaId'];
    $empresa = $empresasCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($empresaId)]);

    if ($empresa) {
        $rama = $empresa['rama'];
        $alumnos = $alumnosCollection->find([
            'formacion' => $rama,
            'trabajando' => ['$ne' => 'Sí'] // Excluir a los que están trabajando
        ]);
        $alumnosArray = iterator_to_array($alumnos);

        foreach ($alumnosArray as &$alumno) {
            $alumno['_id'] = (string) $alumno['_id'];
        }

        echo json_encode(['success' => true, 'alumnos' => $alumnosArray]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Empresa no encontrada.']);
    }
}

// Función para obtener alumnos asignados
function getAlumnosAsignados($ofertasCollection, $alumnosCollection)
{
    $ofertaId = trim($_GET['ofertaId']);
    $oferta = $ofertasCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($ofertaId)]);

    if ($oferta) {
        if (!isset($oferta['alumnoAsignado']) || !$oferta['alumnoAsignado']) {
            echo json_encode(['success' => true, 'alumno' => null]);
            return;
        }

        $alumnoId = $oferta['alumnoAsignado'];
        $alumno = $alumnosCollection->findOne(['_id' => $alumnoId]);

        if ($alumno) {
            $alumno['_id'] = (string) $alumno['_id'];
            echo json_encode(['success' => true, 'alumno' => $alumno]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Alumno no encontrado.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Oferta no encontrada.']);
    }
}

// Función para asignar un alumno a una oferta
function asignarAlumno($ofertasCollection)
{
    $data = json_decode(file_get_contents('php://input'), true);
    $ofertaId = $data['ofertaId'];
    $alumnoId = $data['alumno'];

    if ($ofertaId && $alumnoId) {
        $alumnoObjectId = new MongoDB\BSON\ObjectId(trim($alumnoId));

        $result = $ofertasCollection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($ofertaId)],
            ['$set' => ['alumnoAsignado' => $alumnoObjectId]]
        );

        if ($result->getModifiedCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Alumno asignado correctamente.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se realizaron cambios.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Datos insuficientes.']);
    }
}
