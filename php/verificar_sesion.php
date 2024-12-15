<?php
session_start();

// Encabezados CORS
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Verificar la sesión
if (isset($_SESSION['usuario'])) {
    echo json_encode(['success' => true, 'usuario' => $_SESSION['usuario']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Sesión no activa']);
}
?>
