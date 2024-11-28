<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'vendor/autoload.php'; 

// Conectar a la base de datos MongoDB
try {
    $cliente = new MongoDB\Client("mongodb://localhost:27017");
    $db = $cliente->proyectofinal1; 
    $coleccion = $db->usuarios;       
} catch (Exception $e) {
    echo json_encode(['message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
    exit;
}

// Leer los datos enviados desde el JavaScript
$input = json_decode(file_get_contents("php://input"), true);

// Comprobar si se recibieron los datos esperados
if (!isset($input['usuario']) || !isset($input['clave'])) {
    echo json_encode(['message' => 'Datos incompletos']);
    exit;
}

// Filtrar y almacenar los datos de entrada
$usuario = trim($input['usuario']);
$clave = trim($input['clave']);

if (empty($usuario) || empty($clave)) {
    echo json_encode(['message' => 'Por favor, complete todos los campos']);
    exit;
}

try {
    // Buscar el documento que tenga el nombre de usuario especificado
    $usuarioEncontrado = $coleccion->findOne(['usuario' => $usuario]);

    // Verificar si se encontró el usuario
    if ($usuarioEncontrado) {
        // Verificar la contraseña (asumimos que está encriptada con password_hash)
        if (password_verify($clave, $usuarioEncontrado['clave'])) {
            // Generar una cookie de sesión (por ejemplo, usando un ID único)
            $sessionId = bin2hex(random_bytes(16)); // Genera un ID único de sesión
            setcookie('sesion_usuario', $sessionId, time() + (86400 * 7), "/"); // Expira en 7 días
            
            // Guardar la sesión en la base de datos (por simplicidad, se guarda junto con el usuario)
            $coleccion->updateOne(
                ['_id' => $usuarioEncontrado['_id']],
                ['$set' => ['sessionId' => $sessionId]]
            );

            echo json_encode(['message' => 'Inicio de sesión exitoso']);
        } else {
            echo json_encode(['message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['message' => 'Usuario no encontrado']);
    }
} catch (Exception $e) {
    echo json_encode(['message' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
}

?>
