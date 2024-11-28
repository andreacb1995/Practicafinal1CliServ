document.addEventListener("DOMContentLoaded", function() {

  document.getElementById("formulario-login").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar que se recargue la página
    mensajeError.style.display = "none"
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const mensajeError = document.getElementById("mensaje-error");
    
    mensajeError.style.display = "block !important";
    console.log( mensajeError.style.display);
    //console.log(usuario);
    //console.log(clave);

    // Enviar datos al backend
    fetch('http://localhost/proyectofinal1/login.php', {       
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario, clave })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message && data.message.trim().toLowerCase() === "inicio de sesión exitoso".toLowerCase()) {
        // redirigir al usuario a la página de bienvenida
        window.location.href = 'bienvenido.html';
      } else {
        mensajeError.textContent = data.message;
        mensajeError.style.display = "block";
      }
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
      mensajeError.textContent = "Ocurrió un error al intentar iniciar sesión.";
      mensajeError.style.display = "block";
    });

  });
});