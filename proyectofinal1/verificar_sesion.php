<?php
require 'vendor/autoload.php';

// Configuración de respuesta JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Conectar a la base de datos MongoDB
try {
    $cliente = new MongoDB\Client("mongodb://localhost:27017");
    $db = $cliente->tu_base_de_datos;
    $coleccion = $db->usuarios;
} catch (Exception $e) {
    echo json_encode(['message' => 'Error al conectar con la base de datos: ' . $e->getMessage()]);
    exit;
}

// Verificar si la cookie de sesión está presente
if (!isset($_COOKIE['sesion_usuario'])) {
    echo json_encode(['message' => 'No hay sesión activa']);
    exit;
}

$sessionId = $_COOKIE['sesion_usuario'];

try {
    // Buscar el usuario con el sessionId
    $usuarioEncontrado = $coleccion->findOne(['sessionId' => $sessionId]);

    if ($usuarioEncontrado) {
        // Si la sesión es válida
        echo json_encode(['message' => 'Sesión activa', 'username' => $usuarioEncontrado['username']]);
    } else {
        echo json_encode(['message' => 'Sesión inválida o expirada']);
    }
} catch (Exception $e) {
    echo json_encode(['message' => 'Error al verificar la sesión: ' . $e->getMessage()]);
}
?>
