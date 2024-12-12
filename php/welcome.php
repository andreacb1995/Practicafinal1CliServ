<?php
// welcome.php

// Verificar si la cookie del usuario está establecida
if (isset($_COOKIE['user'])) {
    $username = htmlspecialchars($_COOKIE['user']);
    echo "¡Bienvenido, " . $username . "!";
    echo '<br/><a href="logout.php">Cerrar sesión</a>';
} else {
    // Si no existe la cookie, redirigir al inicio de sesión
    header("Location: login.html");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Bienvenido</title>
</head>
<body>
    <!-- Aquí se muestra el contenido personalizado para el usuario autenticado -->
</body>
</html>
