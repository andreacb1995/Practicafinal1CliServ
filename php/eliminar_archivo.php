<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true"); // Permitir credenciales (cookies)
header('Content-Type: application/json');

// Ruta al archivo que quieres eliminar
$archivoEliminar = $_POST['archivo']; // Recibimos el nombre del archivo a eliminar

// La ruta donde están almacenados los archivos en el servidor
$directorioDescargas = 'C:/xampp/htdocs/proyectofinal1/descargas/';

// Verificamos si el archivo existe y luego lo eliminamos
if (file_exists($directorioDescargas . $archivoEliminar)) {
    if (unlink($directorioDescargas . $archivoEliminar)) {
        echo json_encode(['status' => 'success', 'message' => 'Archivo eliminado correctamente']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el archivo']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'El archivo no existe']);
}
?>

