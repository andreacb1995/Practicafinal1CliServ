document.addEventListener("DOMContentLoaded", function() {
  // Función para manejar el envío del formulario de inicio de sesión
  function handleLoginFormSubmit(event) {
      event.preventDefault(); // Evitar que se recargue la página

      const usuario = document.getElementById("usuario").value.trim();
      const clave = document.getElementById("clave").value.trim();
      const mensajeError = document.getElementById("mensaje-error");

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
              // Redirigir al usuario a la página de bienvenida
              window.location.href = 'index.html';
          } else {
              mensajeError.textContent = data.message;
          }
      })
      .catch(error => {
          console.error("Error al iniciar sesión:", error);
          mensajeError.textContent = "Ocurrió un error al intentar iniciar sesión.";
      });
  }

  // Agregar evento submit al formulario de inicio de sesión
  const formularioLogin = document.getElementById("formulario-login");
  if (formularioLogin) {
      formularioLogin.addEventListener("submit", handleLoginFormSubmit);
  } else {
      console.error("No se encontró el formulario de inicio de sesión.");
  }

  // Cargar el menú desde 'menu.html'
  fetch('menu.html')
      .then(response => response.text())
      .then(data => {
          document.getElementById('contenedor-menu').innerHTML = data;
          // Llamar a la función para gestionar el menú después de cargarlo
          setActiveLink(); 
      })
      .catch(error => {
          console.error('Error al cargar el menú:', error);
      });

  // Función para gestionar la clase 'active' en los enlaces del menú
  function setActiveLink() {
      const currentUrl = window.location.href;
      const links = document.querySelectorAll('#menu .nav-link');
      links.forEach(link => {
          const href = link.getAttribute('href');
          if (currentUrl.includes(href)) {
              link.classList.add('active');
          } else {
              link.classList.remove('active');
          }
      });
  }

});
