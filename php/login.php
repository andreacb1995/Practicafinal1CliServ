<?php

session_start();

// Configurar la cookie de sesión manualmente
$session_id = session_id();
setcookie('PHPSESSID', $session_id, [
    'path' => '/',
    'domain' => 'localhost', // Cambia esto si usas un dominio diferente
    'secure' => false,       // Cambiar a true si usas HTTPS
    'httponly' => true,
    'samesite' => 'None'
]);

// Encabezados CORS
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');


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

if (!isset($input['usuario']) || !isset($input['clave'])) {
    echo json_encode(['message' => 'Faltan datos para iniciar sesión']);
    exit;
}

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
