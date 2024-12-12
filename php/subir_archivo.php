<?php

// Desactivar la visualización de errores en producción
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");  // Permitir GET, POST, DELETE y OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json'); // Asegúrate de que la respuesta sea JSON

$directorioDestino = __DIR__ . '/descargas/'; // Ruta relativa a la ubicación del archivo PHP


// Verifica si el directorio existe y, si no, créalo
if (!is_dir($directorioDestino)) {
    mkdir($directorioDestino, 0777, true); // Crea el directorio con permisos de escritura
}

// Verifica si se recibieron archivos por POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $archivosSubidos = [];

    // Procesar el archivo 'cv' si existe
    if (isset($_FILES['cv']) && $_FILES['cv']['error'] == 0) {
        $archivoCv = $_FILES['cv'];
        $nombreArchivoCv = basename($archivoCv['name']);
        $rutaDestinoCv = $directorioDestino . $nombreArchivoCv;

        if (move_uploaded_file($archivoCv['tmp_name'], $rutaDestinoCv)) {
            $archivosSubidos[] = ['cv' => "Archivo CV subido correctamente: $nombreArchivoCv"];
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al mover el archivo CV.']);
            exit;
        }
    }

    // Procesar el archivo 'tituloalum' si existe
    if (isset($_FILES['tituloalum']) && $_FILES['tituloalum']['error'] == 0) {
        $archivoTitulo = $_FILES['tituloalum'];
        $nombreArchivoTitulo = basename($archivoTitulo['name']);
        $rutaDestinoTitulo = $directorioDestino . $nombreArchivoTitulo;

        if (move_uploaded_file($archivoTitulo['tmp_name'], $rutaDestinoTitulo)) {
            $archivosSubidos[] = ['tituloalum' => "Archivo Título Alumno subido correctamente: $nombreArchivoTitulo"];
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al mover el archivo Título Alumno.']);
            exit;
        }
    }

    // Procesar el archivo 'tituloalum' si existe
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {
        $archivoTitulo = $_FILES['foto'];
        $nombreArchivoTitulo = basename($archivoTitulo['name']);
        $rutaDestinoTitulo = $directorioDestino . $nombreArchivoTitulo;

        if (move_uploaded_file($archivoTitulo['tmp_name'], $rutaDestinoTitulo)) {
            $archivosSubidos[] = ['foto' => "Archivo foto Alumno subido correctamente: $nombreArchivoTitulo"];
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al mover el archivo foto Alumno.']);
            exit;
        }
    }
    
    // Si ambos archivos se subieron correctamente
    if (count($archivosSubidos) > 0) {
        echo json_encode([
            'status' => 'success', 
            'message' => 'Archivos subidos correctamente.',
            'files' => $archivosSubidos
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se han subido archivos.']);
    }
} else {
    // No se ha enviado ningún archivo
    echo json_encode(['status' => 'error', 'message' => 'No se ha enviado ningún archivo.']);
}

?>
