<?php
// logout.php

// Eliminar la cookie estableciendo su tiempo de expiración en el pasado
setcookie("user", "", time() - 3600, "/");

// Redirigir al usuario al formulario de inicio de sesión
header("Location: login.html");
exit();
?>
