<?php

header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true"); // Permitir credenciales (cookies)
header('Content-Type: application/json');

// Si la solicitud es OPTIONS, responder inmediatamente sin procesar más
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Verificar si la cookie existe
if (isset($_COOKIE['cookie_usuario'])) {
    $usuario = $_COOKIE['cookie_usuario'];
    echo json_encode(['message' => 'Sesión válida', 'usuario' => $usuario]);
} else {
    echo json_encode(['message' => 'No hay sesión']);
}

?>
