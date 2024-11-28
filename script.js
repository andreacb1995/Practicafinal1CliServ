document.getElementById('cerrar-sesion').addEventListener('click', function() {
  alert('Has cerrado sesión correctamente.');
  window.location.href = 'login.html'; // Redirige a la página de login
});


document.addEventListener("DOMContentLoaded", function() {
  
  fetch('menu.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('menu-container').innerHTML = data;
  });
  const mensajeError = document.getElementById("mensaje-error");

  document.getElementById("formulario-login").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar que se recargue la página

    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    
    mensajeError.style.display = "block";

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
        window.location.href = 'index.html';
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