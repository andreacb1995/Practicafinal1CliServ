document.addEventListener("DOMContentLoaded", function () {
    // Manejar el formulario de inicio de sesión solo si existe en la página
    const formularioLogin = document.getElementById("formulario-login");
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", function handleLoginFormSubmit(event) {
            event.preventDefault(); // Evitar recargar la página

            const usuario = document.getElementById("usuario").value.trim();
            const clave = document.getElementById("clave").value.trim();
            const mensajeError = document.getElementById("mensaje-error");

            // Ocultar el mensaje de error al hacer el intento de login
            mensajeError.style.display = "none";

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
                        // Si el inicio de sesión es exitoso, redirigir al usuario a la página principal
                        //window.location.href = 'index.html'; // Redirige a la página principal
                        fetch('http://localhost/proyectofinal1/verificar_sesion.php', {
                            method: 'GET',
                            credentials: 'include'  
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log("verificar sesion");
                            if (data.message === 'Sesión válida') {
                                console.log("sesion");

                                // Si la sesión es válida, mostrar un mensaje de bienvenida
                                document.getElementById('bienvenida').textContent = `Bienvenido, ${data.usuario}!`;
                            } //else {
                                // Si no hay sesión, redirigir al login
                                // window.location.href = 'login.html';
                            //}
                        })
                        /*.catch(() => {
                            // Si hay un error en la verificación de la sesión, redirigir al login
                               window.location.href = 'login.html';
                        });*/

                    } else {
                        // Mostrar el mensaje de error si las credenciales son incorrectas
                        mensajeError.style.display = "block";
                        mensajeError.textContent = data.message;
                    }
                })
                .catch(error => {
                    console.error("Error al iniciar sesión:", error);
                    mensajeError.style.display = "block";
                    mensajeError.textContent = "Ocurrió un error al intentar iniciar sesión.";
                });
        });
    }

    const formModal = document.getElementById('formModal'); // Modal del formulario
    const addAlumno = document.getElementById('añadirAlumno'); // Botón de añadir cliente
    const addAlumnoForm = document.getElementById('addAlumnoForm'); // Formulario
    const closeModal = document.getElementById('closeModal'); // Botón para cerrar el modal

    const confirmDeleteModal = document.getElementById('confirmDeleteModal'); // Modal de confirmación de eliminación
    const closeDeleteModal = document.getElementById('closeDeleteModal'); // Botón para cerrar el modal de eliminación
    const confirmDeleteButton = document.getElementById('confirmDeleteButton'); // Botón para confirmar eliminación
    const cancelDeleteButton = document.getElementById('cancelDeleteButton'); // Botón para cancelar eliminación

    let isEditing = false; // Variable para saber si estamos en modo edición
    let editingAlumnoId = null; // Guardar el id del cliente que se está editando
    let alumnoToDeleteId = null; // Guardar el id del cliente que se va a eliminar

    if (document.body.classList.contains("alumnos")) {
        //const submitButton = addAlumnoForm.querySelector('button[type="submit"]'); // Botón de guardar cliente
        const btnGuardar = document.getElementById('btn-guardar');
        // Asegurarse de que los modales estén siempre ocultos al iniciar
        formModal.style.display = 'none';
        confirmDeleteModal.style.display = 'none';
        isEditing = false

        obtenerAlumnos();

        // Abrir el modal al hacer clic en el botón de añadir cliente
        addAlumno.addEventListener('click', (event) => {
            event.stopPropagation();
            isEditing = false; // No estamos editando, estamos añadiendo
            addAlumnoForm.reset(); // Limpiar formulario
            console.log("Nuevo Alumno")
            document.getElementById('formModal').querySelector('h2').textContent = 'Nuevo Alumno'; // Cambiar el título
            btnGuardar.style.display = 'inline-block'; // Mostrar el botón de guardar
            estadoCamposForm(false);
            // Cambiar el título y el botón del modal para "Añadir Cliente"
            //modalTitle.textContent = 'Nuevo Cliente';
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; // Añadir ícono al botón de guardar
            document.getElementById('btn-modificar').style.display = 'none';

            abrirModal(formModal);

        });     
            
        // Cerrar el modal al hacer clic en la 'x'
        closeModal.addEventListener('click', (event) => {
            event.stopPropagation();
            cerrarModal(formModal);
        });


        addAlumnoForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();

            const btnclick = event.submitter;
            if (btnclick.id === 'btn-modificar') {
                console.log('Modificar Alumno');
                btnGuardar.style.display = 'inline-block'; // Mostrar el botón de guardar
                document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Alumno'; // Cambiar el título
                btnGuardar.textContent = 'Modificar';
                document.getElementById('btn-modificar').style.display = 'none'; 
                isEditing = true; // No estamos editando, estamos añadiendo
                estadoCamposForm(false);


            } else if (btnclick.id === 'btn-guardar') {            
                const alumnoData = {
                    _id: document.getElementById('alumnoId').value,  // El ID del alumno que se va a modificar
                    nombre: document.getElementById('nombre').value,
                    apellidos: document.getElementById('apellidos').value,
                    telefono: document.getElementById('telefono').value,
                    dni: document.getElementById('dni').value,
                    direccion: document.getElementById('direccion').value,
                    email: document.getElementById('email').value,
                    formacion: document.getElementById('formacion').value,
                    titulo_asociado: document.getElementById('titulo_asociado').value,
                    promocion: document.getElementById('promocion').value,
                    cv: document.getElementById('cv').value,
                    oferta: document.getElementById('oferta').value,
                    trabajando: document.getElementById('trabajando').value,
                    cursando_titulado: document.getElementById('cursando_titulado').value,
                    titula: document.getElementById('titula').value,
                    titulo_que_le_da_acceso: document.getElementById('titulo_que_le_da_acceso').value,
                    foto: document.getElementById('foto').value
                };
    
                fetch('http://localhost/proyectofinal1/alumnos.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(alumnoData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (isEditing){
                            mostrarModalExito('Alumno modificado correctamente!'); 
                        } else{
                            mostrarModalExito('Alumno añadido correctamente!'); 
                        }
                        obtenerAlumnos();
                        cerrarModal(document.getElementById('formModal'));
                        addAlumnoForm.reset();
                    } else {
                        alert("Error al guardar el alumno.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Ocurrió un error al guardar el alumno.");
                });
            }
        });



        document.getElementById('tarjetasAlumnos').addEventListener('click', function (event) {
            const target = event.target;
            const alumnoButton = target.closest('button[data-id]'); // Encuentra el botón más cercano con data-id
        
            if (!alumnoButton) return; // Si no hay botón válido, salir
        
            const alumnoId = alumnoButton.dataset.id; // Obtén el ID del alumno
        
            // Verifica qué botón se clicó y ejecuta la acción correspondiente
            if (alumnoButton.classList.contains('verAlumno')) {
                console.log('Ver alumno:', alumnoId);
                obtenerAlumnoPorId(alumnoId, 'ver');
            } else if (alumnoButton.classList.contains('modificarAlumno')) {
                console.log('Modificar alumno:', alumnoId);
                isEditing = true;
                obtenerAlumnoPorId(alumnoId, 'modificar');
            } else if (alumnoButton.classList.contains('eliminarAlumno')) {
                console.log('Eliminar alumno:', alumnoId);
                alumnoToDeleteId = alumnoId;
                document.getElementById('confirmDeleteModal').style.display = 'flex';
            }
        });
        

            // Función para eliminar un cliente con confirmación
        confirmDeleteButton.addEventListener('click', () => {
            if (alumnoToDeleteId) {
                fetch(`http://localhost/proyectofinal1/alumnos.php?id=${alumnoToDeleteId}`, {
                    method: 'DELETE', // Enviar una solicitud DELETE
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Opcionalmente, eliminar el alumno de la interfaz sin recargar la página
                        mostrarModalExito('¡Cliente eliminado correctamente!'); // Mostrar el modal de éxito
                        obtenerAlumnos();
                        confirmDeleteModal.style.display = 'none';
                    } else {
                        alert('Error al eliminar el alumno.');
                    }
                })
            .catch(error => console.error('Error:', error));
            }
        });

        // Cancelar la eliminación
        cancelDeleteButton.addEventListener('click', () => {
            confirmDeleteModal.style.display = 'none';
        });

        closeDeleteModal.addEventListener('click', () => {
            confirmDeleteModal.style.display = 'none';
        });

   
    }

    // Evitar cargar el menú en login.html
    if (window.location.pathname !== '/login.html') {
        fetch('menu.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('contenedor-menu').innerHTML = data;
                activarHref(); // Gestión de enlaces activos
            })
            .catch(error => {
                console.error('Error al cargar el menú:', error);
            });
    }

    // Función para gestionar la clase 'active' en los enlaces del menú
    function activarHref() {
        const urlactual = window.location.href;
        const hrefs = document.querySelectorAll('#menu .nav-link');
        hrefs.forEach(link => {
            const href = link.getAttribute('href');
            if (urlactual.includes(href)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});


function abrirModal(modal) {
    // Asegurar que la página principal está en la parte superior antes de desactivar el scroll
    window.scrollTo(0, 0);
  
    // Desactivar el scroll de la ventana principal cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  
    // Mostrar el modal
    modal.style.display = 'flex';
  
    // Buscar el elemento que tiene el scroll interno
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.scrollTop = 0; // Restablecer el scroll del contenido del modal
    } else {
      modal.scrollTop = 0; // En caso de que modalBody no exista, restablecer el scroll del modal
    }
  
    // Ajustar el foco al modal para asegurarse de que se vea en la pantalla
    modal.focus();
}

function cerrarModal(modal) {
    // Ocultar el modal
    modal.style.display = 'none';

    // Reactivar el scroll de la ventana principal cuando se cierra el modal
    document.body.style.overflow = 'auto';
}

// Función para renderizar las cartas de alumnos
function renderAlumnos(alumnos) {
    const cardsContainer = document.getElementById('tarjetasAlumnos');
    cardsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    // Crear una fila de Bootstrap
    const row = document.createElement('div');
    row.classList.add('row'); // Asegurarse de tener la clase 'row' para alinear las columnas

    alumnos.forEach(alumno => {
        // Comprobamos que alumno no sea undefined y tenga la propiedad 'foto'
        const foto = (alumno && alumno.foto) ? alumno.foto : 'imagenes/alumno.png'; // Asignamos un valor por defecto si no tiene foto

        const card = crearTarjetaAlumno(alumno, foto); // Pasamos foto como parámetro
        
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4'); // Cada tarjeta estará en una columna de 4 en la cuadrícula de Bootstrap
        col.appendChild(card);
        row.appendChild(col); // Agregar la columna con la tarjeta a la fila
    });

    cardsContainer.appendChild(row); // Agregar la fila al contenedor principal
}

// Función para crear la tarjeta de cada alumno
function crearTarjetaAlumno(alumno, foto) {
    if (!alumno) {
        console.error("Alumno no definido:", alumno);
        return; // Si el alumno no está definido, no renderizamos nada.
    }
    
    const card = document.createElement('div');
    card.classList.add('card');
    // Crear los botones de Ver y Modificar
    const verButton = `<button type="button" class="btn btn-secondary verAlumno" data-id="${alumno._id}"><i class="fas fa-eye"></i></button>`;
    const modificarButton = `<button type="button" class="btn btn-secondary modificarAlumno" data-id="${alumno._id}"><i class="fas fa-edit"></i></button>`;
    const eliminarButton = `<button type="button" class="btn btn-secondary eliminarAlumno" data-id="${alumno._id}"><i class="fas fa-trash-alt"></i> </button>`;

    card.innerHTML = `
        <img src="${foto}" class="card-img-top" alt="Foto de Alumno" onerror="this.onerror=null; this.src='imagenes/alumno.png';">
        <div class="card-body">
            <h5 class="card-title">${alumno.nombre || 'Nombre no disponible'} ${alumno.apellidos || 'Apellidos no disponibles'}</h5>
            <p class="card-text"">Estudiante de ${alumno.formacion || 'Formación no disponible'}</p>
            <div class="btn-group" role="group" >
                ${verButton}
                ${modificarButton}
                ${eliminarButton}
            </div>
        </div>
    `;

    return card;
}


// Función para obtener los alumnos desde el servidor
function obtenerAlumnos() {
    fetch('http://localhost/proyectofinal1/alumnos.php')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            renderAlumnos(data.data); // Llamar a la función que renderiza las tarjetas de los alumnos
        } else {
          console.error('Error al obtener los alumnos:', data.message);
        }
      })
      .catch(error => {
        console.error('Error de conexión:', error);
    });
}  

// Función para obtener la información de un alumno
function obtenerAlumnoPorId(alumnoId, tipo) {
        if (!alumnoId) {
            console.error('Error: el alumnoId es undefined o vacío');
            return;
        }

        fetch(`http://localhost/proyectofinal1/alumnos.php?id=${alumnoId}`, {
            method: 'GET'
        })
        .then(response => {
            // Verifica si la respuesta es exitosa (status 200)
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const alumno = data.alumno;
                // Llenar los campos del modal con los datos del alumno
                document.getElementById('alumnoId').value = alumno._id;
                document.getElementById('nombre').value = alumno.nombre;
                document.getElementById('apellidos').value = alumno.apellidos;
                document.getElementById('telefono').value = alumno.telefono;
                document.getElementById('dni').value = alumno.dni;
                document.getElementById('direccion').value = alumno.direccion;
                document.getElementById('email').value = alumno.email;
                document.getElementById('formacion').value = alumno.formacion;
                document.getElementById('titulo_asociado').value = alumno.titulo_asociado;
                document.getElementById('promocion').value = alumno.promocion;
                document.getElementById('oferta').value = alumno.oferta;
                document.getElementById('trabajando').value = alumno.trabajando;
                document.getElementById('cursando_titulado').value = alumno.cursando_titulado;
                document.getElementById('titula').value = alumno.titula;
                document.getElementById('titulo_que_le_da_acceso').value = alumno.titulo_que_le_da_acceso;
                document.getElementById('foto').value = alumno.foto;

                const cvAlumno = alumno.cv;
                const fileSelected = document.getElementById("fileSelected");
                const inputCv = document.getElementById("cv");
                const changeCvButton = document.getElementById('changeCvButton');

                //inputCv.disabled = true;

                // Si deseas habilitar el campo de archivo en algún momento (por ejemplo, con un botón)
                /*if (changeCvButton) {
                    changeCvButton.addEventListener('click', function() {
                        // Habilitar el campo de archivo
                        cvField.disabled = false;
                    });
                }

                if (cvAlumno) {
                    // Mostrar el botón para cambiar el archivo
                    changeCvButton.style.display = 'inline-block';
                    // Hacer que el campo de archivo esté deshabilitado
                    //inputCv.disabled = true;

                    fileSelected.textContent = `Archivo seleccionado: ${cvAlumno}`;
                    const link = document.createElement("a");
                    link.href = `uploads/${cvAlumno}`; // Cambiar ruta según la ubicación del archivo
                    link.textContent = "Descargar CV";
                    link.target = "_blank"; // Abrir en una nueva pestaña
                    downloadLinkContainer.appendChild(link);
                } else {
                  const noFileText = document.createElement("p");
                  downloadLinkContainer.appendChild(noFileText);
                  fileSelected.textContent = ``;
                  changeCvButton.style.display = 'none';
                }*/
                

                //const submitButton = document.querySelector('#addAlumnoForm button[type="submit"]');
                if (tipo === 'ver') {
                    // Solo habilitar la opción de ver, no modificar
                    document.getElementById('formModal').querySelector('h2').textContent = 'Alumno'; // Cambiar el título
                    document.getElementById('btn-guardar').style.display = 'none';
                    document.getElementById('btn-modificar').style.display = 'block';

                    if (cvAlumno) {
                        //inputCv.disabled = true;
    
                        fileSelected.textContent = `Archivo seleccionado: ${cvAlumno}`;
                        const link = document.createElement("a");
                        link.href = `uploads/${cvAlumno}`; // Cambiar ruta según la ubicación del archivo
                        link.textContent = "Descargar CV";
                        link.target = "_blank"; // Abrir en una nueva pestaña
                        downloadLinkContainer.appendChild(link);
                    } 
                    
                    estadoCamposForm(true);

                } else if (tipo === 'modificar') {
                    document.getElementById('btn-guardar').style.display = 'inline-block'; // Mostrar el botón de guardar
                    document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Alumno'; // Cambiar el título
                    document.getElementById('btn-guardar').textContent = 'Modificar';
                    document.getElementById('btn-modificar').style.display = 'none';

                    estadoCamposForm(false);
                    if (cvAlumno) {
                        // Mostrar el botón para cambiar el archivo
                        changeCvButton.style.display = 'inline-block';
                        // Hacer que el campo de archivo esté deshabilitado
                        //inputCv.disabled = true;
    
                        fileSelected.textContent = `Archivo seleccionado: ${cvAlumno}`;
                        const link = document.createElement("a");
                        link.href = `uploads/${cvAlumno}`; // Cambiar ruta según la ubicación del archivo
                        link.target = "_blank"; // Abrir en una nueva pestaña
                        downloadLinkContainer.appendChild(link);
                    } else {
                      const noFileText = document.createElement("p");
                      downloadLinkContainer.appendChild(noFileText);
                      fileSelected.textContent = ``;
                      changeCvButton.style.display = 'none';
                    }
                }

                abrirModal(document.getElementById('formModal'));  // Mostrar el modal
            } else {
                console.error('Error al obtener la información del alumno');
            }
        })
        .catch(error => {
            console.error('Error al obtener la información del alumno:', error);
        });
}

function mostrarModalExito(mensaje) {
    const successModal = document.getElementById('successModal');
    const successModalMessage = document.getElementById('successModalMessage');
    successModalMessage.textContent = mensaje; // Establecer el mensaje dinámico
    successModal.style.display = 'flex'; // Mostrar el modal
  
    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
      successModal.style.display = 'none';
    }, 3000);
  }

  function estadoCamposForm(estado) {
  const formFields = document.querySelectorAll('.form-field');
  formFields.forEach(field => {
      field.disabled = estado;
  });
}