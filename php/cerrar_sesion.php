<?php
session_start();
session_unset(); // Eliminar todas las variables de sesión
session_destroy(); // Destruir la sesión

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

echo json_encode([
    "success" => true,
    "message" => "Sesión cerrada correctamente."
]);
?>
