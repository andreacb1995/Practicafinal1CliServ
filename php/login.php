<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true"); // Permitir credenciales (cookies)
header('Content-Type: application/json');

// Si la solicitud es OPTIONS, responder inmediatamente sin procesar más
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require '../vendor/autoload.php'; // Ajusta la ruta según la ubicación de `alumnos.php`

// Conectar a la base de datos MongoDB
try {
    $cliente = new MongoDB\Client("mongodb://localhost:27017");
    $db = $cliente->proyectofinal1; 
    $coleccion = $db->usuarios;       
} catch (Exception $e) {
    echo json_encode(['message' => 'Error al conectar con la base de datos']);
    exit;
}


$input = json_decode(file_get_contents("php://input"), true);
$usuario = trim($input['usuario']);
$clave = trim($input['clave']);
$usuarioEncontrado = $coleccion->findOne(['usuario' => $usuario]);

if ($usuarioEncontrado && password_verify($clave, $usuarioEncontrado['clave'])) {
    $_SESSION['usuario'] = $usuario;
    echo json_encode(['message' => 'Inicio de sesión exitoso', 'usuario' => $usuario]);


} else {
    echo json_encode(['message' => 'Usuario o contraseña incorrectos']);
}

?>
