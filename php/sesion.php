<?php
session_start();

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (isset($_SESSION['usuario'])) {
    echo json_encode(['usuario' => $_SESSION['usuario']]);
} else {
    echo json_encode(['usuario' => null]);
}
?>
