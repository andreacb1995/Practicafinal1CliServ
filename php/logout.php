<?php

// Eliminar la cookie estableciendo su tiempo de expiración en el pasado
setcookie("cookie_usuario", "", time() - 3600, "/");

// Redirigir al usuario al formulario de inicio de sesión
header("Location: login.html");
exit();
?>
