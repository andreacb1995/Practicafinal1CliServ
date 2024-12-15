let alumnosA = []; // Array para almacenar los alumnos obtenidos
let empresasA = []; // Array para almacenar las empresas obtenidos
const urlBase = 'http://localhost/proyectofinal/php';

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
            fetch(`${urlBase}/login.php`, {       
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, clave })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message)
                    if (data.message && data.message.trim().toLowerCase() === "inicio de sesión exitoso".toLowerCase()) {
                        // Recuperar el usuario de la sesión a través de una llamada al servidor
                        fetch(`${urlBase}/sesion.php`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.usuario) {
                                window.location.href = 'index.html';
                            } else {
                                window.location.href = 'login.html';
                            }
                        });
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
    const crearAlumno = document.getElementById('añadirAlumno'); // Botón de añadir cliente
    const crearAlumnoForm = document.getElementById('crearAlumnoForm'); // Formulario
    const crearEmpresaForm = document.getElementById('crearEmpresaForm'); // Formulario
    const addEmpresa = document.getElementById('añadirEmpresa'); // Botón de añadir cliente
    const cerrarModal = document.getElementById('cerrarModal'); // Botón para cerrar el modal
    const confirmEliminarModal = document.getElementById('confirmEliminarModal'); // Modal de confirmación de eliminación
    const cerrarDeleteModal = document.getElementById('cerrarDeleteModal'); // Botón para cerrar el modal de eliminación
    const confirmEliminarButton = document.getElementById('confirmEliminarButton'); // Botón para confirmar eliminación
    const cancelarElimButton = document.getElementById('cancelarElimButton'); // Botón para cancelar eliminación
    const cerrarConfirmModal = document.getElementById('cerrarSuccessModal'); // Botón para cerrar el modal de eliminación
    const ModalElimArchivo = document.getElementById('ModalElimArchivo'); // Modal de confirmación de eliminación
    const ElimArchivoButton = document.getElementById('EliminarArchivoButton'); // Botón para confirmar eliminación
    const cancelElimArchivoBtn = document.getElementById('cancelElimArchivoBtn'); // Botón para cancelar eliminación

    let Editando = false; // Variable para saber si estamos en modo edición
    let alumnoEliminarId = null; // Guardar el id del cliente que se va a eliminar
    let empresaEliminarId = null; // Guardar el id del cliente que se va a eliminar

    if (document.body.classList.contains("alumnos")) {
        obtenerAlumnos();

        const btnGuardar = document.getElementById('btn-guardar');
        // Asegurarse de que los modales estén siempre ocultos al iniciar
        formModal.style.display = 'none';
        confirmEliminarModal.style.display = 'none';
        Editando = false
        // Abrir el modal al hacer clic en el botón de añadir cliente
        crearAlumno.addEventListener('click', (event) => {
            event.stopPropagation();
            Editando = false; // No estamos editando, estamos añadiendo
            crearAlumnoForm.reset(); // Limpiar formulario
            console.log("Nuevo Alumno")
            document.getElementById('formModal').querySelector('h2').textContent = 'Nuevo Alumno'; // Cambiar el título
            btnGuardar.style.display = 'inline-block'; // Mostrar el botón de guardar
            estadoCamposForm(false);
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; 
            document.getElementById('btn-modificar').style.display = 'none';
            abrirModal(formModal);
        });     
            
        // Cerrar el modal al hacer clic en la 'x'
        cerrarModal.addEventListener('click', (event) => {
            event.stopPropagation();
            cerrarModal(formModal);
        });

        crearAlumnoForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();
            const btnclick = event.submitter;
            if (btnclick.id === 'btn-modificar') {
                console.log('Modificar Alumno');
                btnGuardar.style.display = 'inline-block'; // Mostrar el botón de guardar
                document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Alumno'; // Cambiar el título
                btnGuardar.textContent = 'Modificar';
                document.getElementById('btn-modificar').style.display = 'none'; 
                Editando = true; // No estamos editando, estamos añadiendo

                estadoCamposForm(false);
                
                const alumnomodif = alumnosA.find(alumno => alumno._id === document.getElementById('alumnoId').value);
                const subirTitulo = document.getElementById('tituloalum'); // El input para el archivo
                const TituloBtn = document.getElementById('tituloBtn');

                if (alumnomodif.titulo_asociado) {
                    // Mostrar botón para cambiar archivo
                    TituloBtn.style.display = 'inline-block';
                    subirTitulo.disabled = true; // Deshabilitar selección de archivos
                }
                
                const subirArchivo = document.getElementById('cv'); // El input para el archivo
                const cambiarCvBtn = document.getElementById('cambiarCvBtn');

                if (alumnomodif.cv) {
                    // Mostrar botón para cambiar archivo
                    cambiarCvBtn.style.display = 'inline-block';
                    subirArchivo.disabled = true; // Deshabilitar selección de archivos
                }

            } else if (btnclick.id === 'btn-guardar') {        
                
                    const alumnomodif = alumnosA.find(alumno => alumno._id === document.getElementById('alumnoId').value);
                    const archivoCvInput = document.getElementById('cv');
                    const nombreArchivocv = archivoCvInput.value.split('\\').pop() || (alumnomodif ? alumnomodif.cv : '') || '';
                    
                    const archivoTituloInput = document.getElementById('tituloalum');
                    const nombreArchivotitulo = archivoTituloInput.value.split('\\').pop() || (alumnomodif ? alumnomodif.titulo_asociado : '') || '';
                    
                    const archivofotoInput = document.getElementById('foto');
                    const nombreArchivofoto = archivofotoInput.value.split('\\').pop() || (alumnomodif ? alumnomodif.foto : '') || '';

                    const alumnoData = {
                        _id: document.getElementById('alumnoId').value,  // El ID del alumno que se va a modificar
                        nombre: document.getElementById('nombre').value,
                        apellidos: document.getElementById('apellidos').value,
                        telefono: document.getElementById('telefono').value,
                        dni: document.getElementById('dni').value,
                        direccion: document.getElementById('direccion').value,
                        email: document.getElementById('email').value,
                        formacion: document.getElementById('formacion').value,
                        titulo_asociado: nombreArchivotitulo,
                        promocion: document.getElementById('promocion').value,
                        cv: nombreArchivocv , // El nombre del archivo subido
                        trabajando: document.getElementById('trabajando').value,
                        cursando_titulado: document.getElementById('cursando_titulado').value,
                        titula: document.getElementById('titula').value,
                        titulo_que_le_da_acceso: document.getElementById('titulo_que_le_da_acceso').value,
                        foto: nombreArchivofoto
                    }
                    if(Editando){
                        const mensajeSinCambios = document.getElementById('mensajeSinCambios');
                        const archivoCvInput = document.getElementById('cv');
            
                        valoresOriginales = {
                            nombre: alumnomodif.nombre,
                            apellidos: alumnomodif.apellidos,
                            telefono: alumnomodif.telefono,
                            dni: alumnomodif.dni,
                            direccion: alumnomodif.direccion,
                            email: alumnomodif.email,
                            formacion: alumnomodif.formacion,
                            promocion: alumnomodif.promocion,
                            trabajando: alumnomodif.trabajando,
                            cursando_titulado: alumnomodif.cursando_titulado,
                            titula: alumnomodif.titula,
                            titulo_que_le_da_acceso: alumnomodif.titulo_que_le_da_acceso,
                        };
    
                        // Comparar los valores actuales con los nuevos valores
                        let hayCambios = false;
                        for (const key in valoresOriginales) {
                            if (valoresOriginales[key] !== alumnoData[key]) {
                                hayCambios = true;
                                break;
                            }
                        }
    
                        if (archivoCvInput.files.length > 0 || archivoTituloInput.files.length > 0
                            || archivofotoInput.files.length > 0
                        ) {
                            // Si se ha seleccionado un nuevo archivo, hay cambios
                            hayCambios = true;
                        } 
    
                        // Si no hay cambios, mostrar un mensaje y no hacer nada
                        if (!hayCambios) {
                            // Mostrar el mensaje en la pantalla
                            mensajeSinCambios.textContent = 'No se han realizado cambios.';
                            mensajeSinCambios.style.display = 'block';  // Mostrar el mensaje
                            return;
                        } else {
                            // Aquí puedes proceder con la lógica de modificación
                            console.log('Datos modificados correctamente');
                            mensajeSinCambios.style.display = 'none';  // Ocultar el mensaje si hay cambios
                        }
                        
                        const formData = new FormData(this); // Captura todos los datos del formulario, incluyendo el archivo
                        fetch(`${urlBase}/subir_archivo.php`, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('La respuesta del servidor no fue exitosa');
                            }
                            return response.json(); // Parsear la respuesta como JSON
                        })
                        .then(data => {
                            if (data.status === 'success') {
                                console.log(data.message);  // Muestra el mensaje de éxito
                                // Aquí puedes hacer algo con la respuesta, como actualizar la interfaz de usuario.
                            } else {
                                console.error('Error en la subida del archivo:', data.message);
                                // Mostrar el mensaje de error en la UI
                                const errorElement = document.getElementById('error-message');
                                if (errorElement) {
                                    errorElement.textContent = `Error: ${data.message}`;
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Hubo un error al intentar subir el archivo:', error);
                            // Mostrar el mensaje de error en la UI
                            const errorElement = document.getElementById('error-message');
                            if (errorElement) {
                                errorElement.textContent = `Error inesperado: ${error.message}`;
                            }
                        });

                    }
                    fetch(`${urlBase}/alumnos.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(alumnoData)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error del servidor: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                if (Editando) {
                                    mostrarModalExito('Alumno modificado correctamente!');
                                } else {
                                    mostrarModalExito('Alumno añadido correctamente!');
                                }
                                obtenerAlumnos();
                                cerrarModal(document.getElementById('formModal'));
                                crearAlumnoForm.reset();
                            } else {
                                console.error("Error del servidor:", data.message);
                                alert("Error: " + data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert("Ocurrió un error al guardar el alumno.");
                        });
                    
                //}
            }
        });

        document.getElementById('tarjetasAlumnos').addEventListener('click', function (event) {
            const target = event.target;
            const alumnoBtn = target.closest('button[data-id]'); // Encuentra el botón más cercano con data-id
            const mensajeSinCambios = document.getElementById('mensajeSinCambios');
            mensajeSinCambios.textContent = '';

            if (!alumnoBtn) return; // Si no hay botón válido, salir
        
            const alumnoId = alumnoBtn.dataset.id; // Obtén el ID del alumno
            cambiarcv = false

            // Verifica qué botón se clicó y ejecuta la acción correspondiente
            if (alumnoBtn.classList.contains('verAlumno')) {
                obtenerAlumnoPorId(alumnoId, 'ver');
            } else if (alumnoBtn.classList.contains('modificarAlumno')) {
                Editando = true;
                obtenerAlumnoPorId(alumnoId, 'modificar');
            } else if (alumnoBtn.classList.contains('eliminarAlumno')) {
                alumnoEliminarId = alumnoId;
                document.getElementById('confirmEliminarModal').style.display = 'flex';
            }
        });
        
        // Función para eliminar un cliente con confirmación
        confirmEliminarButton.addEventListener('click', () => {
            if (alumnoEliminarId) {
                fetch(`${urlBase}/alumnos.php?id=${alumnoEliminarId}`, {
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
                        confirmEliminarModal.style.display = 'none';
                    } else {
                        alert('Error al eliminar el alumno.');
                    }
                })
            .catch(error => console.error('Error:', error));
            }
        });

        ElimArchivoButton.addEventListener('click', () => {
            const archivocvAlumno = alumnosA.find(alumno => alumno._id === document.getElementById('alumnoId').value);
            if (archivocvAlumno.cv) {
                // Enviar una solicitud al servidor para eliminar el archivo
                fetch(`${urlBase}/eliminar_archivo.php`, {
                    method: 'POST',
                    body: new URLSearchParams({
                        archivo: archivocvAlumno.cv
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        console.log('Archivo eliminado correctamente');
                        ModalElimArchivo.style.display = 'none';

                    } else {
                        console.error('Error al eliminar el archivo:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al intentar eliminar el archivo:', error);
                });
            }
        });
        
        // Cancelar la eliminación
        cancelarElimButton.addEventListener('click', () => {
            confirmEliminarModal.style.display = 'none';
        });

        cerrarDeleteModal.addEventListener('click', () => {
            confirmEliminarModal.style.display = 'none';
        });

        cerrarConfirmModal.addEventListener('click', () => {
            successModal.style.display = 'none';
        });

        cancelElimArchivoBtn.addEventListener('click', () => {
            ModalElimArchivo.style.display = 'none';
        });
        
        // Al hacer clic en el botón "Cambiar CV", restablecer el input para permitir seleccionar un nuevo archivo
        document.getElementById('cambiarCvBtn').addEventListener('click', function() {
            const fileInput = document.getElementById('cv');
            const fileInfoSpan = document.getElementById('archivoCV');
            const linkCv = document.getElementById('linkCv');
            const cambiarCvBtn = document.getElementById('cambiarCvBtn');

            // Restablecer el input de archivo
            fileInput.value = '';  // Limpiar el valor del input
            fileInput.disabled = false; // Asegurarse de que el input no esté deshabilitado

            // Restablecer los estados de la UI
            fileInfoSpan.textContent = '';
            linkCv.innerHTML = ''; // Limpiar el enlace de descarga
            
            cambiarCvBtn.style.display = 'none'; // Ocultar el botón "Cambiar CV"

        });

        // Al hacer clic en el botón "Cambiar Foto", restablecer el input para permitir seleccionar un nuevo archivo
        document.getElementById('tituloBtn').addEventListener('click', function() {
            const fileTitulo = document.getElementById('tituloalum');
            const fileInfoTitulo = document.getElementById('fileTitulo');
            const LinkTitulo = document.getElementById('LinkTitulo');
            const ButtonTitulo = document.getElementById('tituloBtn');

            // Restablecer el input de archivo
            fileTitulo.value = '';  // Limpiar el valor del input
            fileTitulo.disabled = false; // Asegurarse de que el input no esté deshabilitado

            // Restablecer los estados de la UI
            fileInfoTitulo.textContent = '';
            LinkTitulo.innerHTML = ''; // Limpiar el enlace de descarga
            
            ButtonTitulo.style.display = 'none'; // Ocultar el botón "Cambiar CV"

        });

        // Al hacer clic en el botón "Cambiar Titulo", restablecer el input para permitir seleccionar un nuevo archivo
        document.getElementById('fotoBtn').addEventListener('click', function() {
            const fotoInput = document.getElementById('foto');
            const fileFoto = document.getElementById('fileFoto');
            const fotoBtn = document.getElementById('fotoBtn');

            // Restablecer el input de archivo
            fotoInput.value = '';  // Limpiar el valor del input
            fotoInput.disabled = false; // Asegurarse de que el input no esté deshabilitado

            // Restablecer los estados de la UI
            fileFoto.textContent = '';
            
            fotoBtn.style.display = 'none'; // Ocultar el botón "Cambiar CV"

        });
    }

    if (document.body.classList.contains("empresas")) {
        const params = new URLSearchParams(window.location.search);
        const accion = params.get('accion');
        
        const tituloEmpresas = document.getElementById('tituloEmpresas');
        tituloEmpresas.innerText = `Empresas de ${accion.toUpperCase()}`;
        obtenerEmpresas(accion);

        const btnGuardar = document.getElementById('btn-guardar');
        const btnOfertas = document.getElementById('btn-ofertas');

        formModal.style.display = 'none';
        confirmEliminarModal.style.display = 'none';

        Editando = false

        // Abrir el modal al hacer clic en el botón de añadir empresa
        addEmpresa.addEventListener('click', (event) => {
            event.stopPropagation();
            Editando = false; // No estamos editando, estamos añadiendo
            crearEmpresaForm.reset(); // Limpiar formulario
            console.log("Nueva Empresa")
            document.getElementById('formModal').querySelector('h2').textContent = 'Nueva Empresa'; 
            btnGuardar.style.display = 'inline-block'; // Mostrar el botón de guardar
            btnOfertas.style.display = 'none'; // Mostrar el botón de guardar
            estadoCamposForm(false);
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; // Añadir ícono al botón de guardar
            document.getElementById('btn-modificar').style.display = 'none';
            abrirModal(formModal);
        });     
                    
        // Cerrar el modal al hacer clic en la 'x'
        cerrarModal.addEventListener('click', (event) => {
            event.stopPropagation();
            cerrarModal(formModal);
        });
        
        crearEmpresaForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();

            const btnclick = event.submitter;
            if (btnclick.id === 'btn-modificar') {
                console.log('Modificar Empresa');
                btnGuardar.style.display = 'none'; 
                document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Empresa'; // Cambiar el título
                btnGuardar.textContent = 'Modificar';
                document.getElementById('btn-modificar').style.display = 'none'; 
                Editando = true; // No estamos editando, estamos añadiendo

                estadoCamposForm(false);
        
            } else if (btnclick.id === 'btn-guardar') {        
                const mensajeSinCambios = document.getElementById('mensajeSinCambios');
                const empresamodif = empresasA.find(empresa => empresa._id === document.getElementById('empresaId').value);
                const empresaData = {
                    _id: document.getElementById('empresaId').value,  
                    nombre: document.getElementById('nombre').value,
                    telefono: document.getElementById('telefono').value,
                    email: document.getElementById('email').value,
                    persona_de_contacto: document.getElementById('persona_de_contacto').value,
                    rama: document.getElementById('rama').value,
                    fct: document.getElementById('fct').checked,
                    bolsa: document.getElementById('bolsa').checked 
                }
                if(Editando){
                    valoresOriginales = {
                        nombre: empresamodif.nombre,
                        telefono: empresamodif.telefono,
                        email: empresamodif.email,
                        persona_de_contacto: empresamodif.persona_de_contacto,
                        rama: empresamodif.rama,
                        fct: empresamodif.fct,
                        bolsa: empresamodif.bolsa,
                    };
    
                    // Comparar los valores actuales con los nuevos valores
                    let hayCambios = false;
                    for (const key in valoresOriginales) {
                        if (valoresOriginales[key] !== empresaData[key]) {
                            hayCambios = true;
                            break;
                        }
                    }
    
                    // Si no hay cambios, mostrar un mensaje y no hacer nada
                    if (!hayCambios) {
                        // Mostrar el mensaje en la pantalla
                        mensajeSinCambios.textContent = 'No se han realizado cambios.';
                        mensajeSinCambios.style.display = 'block';  // Mostrar el mensaje
                        return;
                    } else {
                        // Aquí puedes proceder con la lógica de modificación
                        console.log('Datos modificados correctamente');
                        mensajeSinCambios.style.display = 'none';  // Ocultar el mensaje si hay cambios
                    }
                }


                fetch(`${urlBase}/empresas.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(empresaData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (Editando){
                            mostrarModalExito('Empresa modificada correctamente!'); 
                        } else{
                            mostrarModalExito('Empresa añadida correctamente!'); 
                        }
                        obtenerEmpresas(accion);
                        cerrarModal(document.getElementById('formModal'));
                        crearEmpresaForm.reset();
                    } else {
                        console.error("Error del servidor:", data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Ocurrió un error al guardar la empresa.");
                });
            }
        });
        
        document.getElementById('tarjetasEmpresas').addEventListener('click', function (event) {
            const target = event.target;
            const empresaButton = target.closest('button[data-id]'); // Encuentra el botón más cercano con data-id
            const mensajeSinCambios = document.getElementById('mensajeSinCambios');
            mensajeSinCambios.textContent = '';

            if (!empresaButton) return; // Si no hay botón válido, salir
        
            const empresaId = empresaButton.dataset.id; // Obtén el ID del alumno

            // Verifica qué botón se clicó y ejecuta la acción correspondiente
            if (empresaButton.classList.contains('verEmpresa')) {
                obtenerEmpresaPorId(empresaId, 'ver');
            } else if (empresaButton.classList.contains('modificarEmpresa')) {
                Editando = true;
                obtenerEmpresaPorId(empresaId, 'modificar');
            } else if (empresaButton.classList.contains('eliminarEmpresa')) {
                empresaEliminarId = empresaId;
                document.getElementById('confirmEliminarModal').style.display = 'flex';
            }
        });
        
        // Función para eliminar un cliente con confirmación
        confirmEliminarButton.addEventListener('click', () => {
            if (empresaEliminarId) {
                fetch(`${urlBase}/empresas.php?id=${empresaEliminarId}`, {
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
                        obtenerEmpresas(accion);
                        confirmEliminarModal.style.display = 'none';
                    } else {
                        alert('Error al eliminar la empresa.');
                    }
                })
            .catch(error => console.error('Error:', error));
            }
        });

        // Cancelar la eliminación
        cancelarElimButton.addEventListener('click', () => {
            confirmEliminarModal.style.display = 'none';
        });

        cerrarDeleteModal.addEventListener('click', () => {
            confirmEliminarModal.style.display = 'none';
        });

        cerrarConfirmModal.addEventListener('click', () => {
            successModal.style.display = 'none';
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
function crearTarjetasAlumnos(alumnos) {
    const cardsContainer = document.getElementById('tarjetasAlumnos');
    cardsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    // Crear una fila de Bootstrap
    const row = document.createElement('div');
    row.classList.add('row'); // Asegurarse de tener la clase 'row' para alinear las columnas

    alumnos.forEach(alumno => {
        // Comprobamos que alumno no sea undefined y tenga la propiedad 'foto'
        const foto = (alumno && alumno.foto) ? alumno.foto : 'alumno.png'; // Asignamos un valor por defecto si no tiene foto

        const card = crearTarjetaAlumno(alumno, foto); // Pasamos foto como parámetro
        
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-2'); // Cada tarjeta estará en una columna de 4 en la cuadrícula de Bootstrap
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
        <img src="http://localhost/proyectofinal/descargas/${foto}" class="card-img-top" alt="Foto de Alumno" onerror="this.onerror=null; this.src='imagenes/alumno.png';">
        <div class="card-body">
            <h5 class="card-title">${alumno.nombre || 'Nombre no disponible'} ${alumno.apellidos || 'Apellidos no disponibles'}</h5>
            <p class="card-text"">Estudiante de ${alumno.formacion.toUpperCase() || 'Formación no disponible'}</p>
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
    fetch(`${urlBase}/alumnos.php`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            alumnosA = data.data;  // Guardar los datos de los alumnos en el array

            crearTarjetasAlumnos(data.data); // Llamar a la función que renderiza las tarjetas de los alumnos
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

        fetch(`${urlBase}/alumnos.php?id=${alumnoId}`, {
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
                document.getElementById('promocion').value = alumno.promocion;
                document.getElementById('trabajando').value = alumno.trabajando;
                document.getElementById('cursando_titulado').value = alumno.cursando_titulado;
                document.getElementById('titula').value = alumno.titula;
                document.getElementById('titulo_que_le_da_acceso').value = alumno.titulo_que_le_da_acceso;
                //document.getElementById('foto').value = alumno.foto;

                const cvAlumno = alumno.cv;     
                const tituloAlumno = alumno.titulo_asociado;                
                const fotoAlumno = alumno.foto;                

                const modalTitulo = document.getElementById('formModal').querySelector('h2');
                const btnGuardar = document.getElementById('btn-guardar');
                const btnModificar = document.getElementById('btn-modificar');

                const tituloBtn = document.getElementById('tituloBtn');
                const tituloalum = document.getElementById('tituloalum');
                const fileTitulo = document.getElementById('fileTitulo');
                const LinkTitulo = document.getElementById('LinkTitulo');

                // Restablecer estado inicial del modal
                LinkTitulo.innerHTML = ''; // Limpia enlaces previos
                tituloBtn.style.display = 'none'; // Ocultar botón para cambiar archivo
                //tituloalum.disabled = false; // Habilitar selección de archivos por defecto
                fileTitulo.textContent = '';

                const cambiarCvBtn = document.getElementById('cambiarCvBtn');
                const subirArchivo = document.getElementById('cv');
                const archivoCV = document.getElementById('archivoCV');
                const linkCv = document.getElementById('linkCv');

                // Restablecer estado inicial del modal
                linkCv.innerHTML = ''; // Limpia enlaces previos
                cambiarCvBtn.style.display = 'none'; // Ocultar botón para cambiar archivo
                subirArchivo.disabled = false; // Habilitar selección de archivos por defecto
                archivoCV.textContent = '';

                const fotoBtn = document.getElementById('fotoBtn');
                const fotoalum = document.getElementById('foto');
                const fileFoto = document.getElementById('fileFoto');

                // Restablecer estado inicial del modal
                fileFoto.innerHTML = ''; // Limpia enlaces previos
                fotoBtn.style.display = 'none'; // Ocultar botón para cambiar archivo
                fotoalum.disabled = false; // Habilitar selección de archivos por defecto
                fileFoto.textContent = '';

                if (tipo === 'ver') {
                    modalTitulo.textContent = 'Alumno'; // Cambiar el título
                    btnGuardar.style.display = 'none'; // Ocultar botón de guardar
                    btnModificar.style.display = 'block'; // Mostrar botón de modificar
                    cambiarCvBtn.disabled = false;
                    tituloBtn.disabled = false;
                    //fotoBtn.disabled = false;

                    // Si hay Titulo, mostrar enlace de descarga
                    if (tituloAlumno) {
                        fileTitulo.textContent = `Archivo seleccionado: ${tituloAlumno}`;
                        const link = document.createElement("a");
                        link.href = `http://localhost/proyectofinal/php/descargas/${tituloAlumno}`; // Ruta completa al archivo
                        link.textContent = "Descargar Título";
                        link.target = "_blank"; // Abrir en nueva pestaña
                        LinkTitulo.appendChild(link);
                    } else {
                        archivoCV.textContent = 'Este alumno no tiene Título.';
                    }

                    // Si hay CV, mostrar enlace de descarga
                    if (cvAlumno) {
                        archivoCV.textContent = `Archivo seleccionado: ${cvAlumno}`;
                        const link = document.createElement("a");
                        link.href = `http://localhost/proyectofinal/php/descargas/${cvAlumno}`; // Ruta completa al archivo
                        link.textContent = "Descargar CV";
                        link.target = "_blank"; // Abrir en nueva pestaña
                        linkCv.appendChild(link);
                    } else {
                        archivoCV.textContent = 'Este alumno no tiene un CV.';
                    }

                    if (fotoAlumno) {
                        fileFoto.textContent = `Archivo seleccionado: ${fotoAlumno}`;
                    } else {
                        fileFoto.textContent = 'Este alumno no tiene un foto.';
                    }

                    estadoCamposForm(true); // Deshabilitar campos para modo "ver"

                    } else if (tipo === 'modificar') {
                        modalTitulo.textContent = 'Modificar Alumno'; // Cambiar el título
                        btnGuardar.style.display = 'inline-block'; // Mostrar botón de guardar
                        btnGuardar.textContent = 'Modificar';
                        btnModificar.style.display = 'none'; // Ocultar botón de modificar

                        estadoCamposForm(false); // Habilitar campos para edición

                        if (tituloAlumno) {
                            fileTitulo.textContent = `Archivo seleccionado: ${tituloAlumno}`;
                            const link = document.createElement("a");
                            link.href = `http://localhost/proyectofinal/php/descargas/${tituloAlumno}`; // Ruta completa al archivo
                            link.textContent = "Descargar Título";
                            link.target = "_blank"; // Abrir en nueva pestaña
                            LinkTitulo.appendChild(link);
                            
                            // Mostrar botón para cambiar archivo
                            tituloBtn.style.display = 'inline-block';
                            tituloalum.disabled = true; // Deshabilitar selección de archivos

                        } else {
                            archivoCV.textContent = 'Este alumno no tiene Título.';
                        }

                        if (cvAlumno) {
                            archivoCV.textContent = `Archivo seleccionado: ${cvAlumno}`;
                            const link = document.createElement("a");
                            link.href = `http://localhost/proyectofinal/php/descargas/${cvAlumno}`; // Ruta completa al archivo
                            link.textContent = "Descargar CV";
                            link.target = "_blank"; // Abrir en nueva pestaña
                            linkCv.appendChild(link);

                            // Mostrar botón para cambiar archivo
                            cambiarCvBtn.style.display = 'inline-block';
                            subirArchivo.disabled = true; // Deshabilitar selección de archivos
                        } else {
                            archivoCV.textContent = 'Este alumno no tiene un CV.';
                        }

                        if (fotoAlumno) {
                            fileFoto.textContent = `Archivo seleccionado: ${fotoAlumno}`;
                            // Mostrar botón para cambiar archivo
                            fotoBtn.style.display = 'inline-block';
                            fotoalum.disabled = true; // Deshabilitar selección de archivos
                        } else {
                            fileFoto.textContent = 'Este alumno no tiene un foto.';
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

// Función para obtener las empresas desde el servidor
function obtenerEmpresas(accion) {
    console.log(`Cargando empresas con acción: ${accion}`);

    fetch(`${urlBase}/empresas.php?accion=${accion}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
      .then(data => {
        if (data.success) {
            empresasA = data.data || []; // Si 'data' no existe, usar un array vacío
            crearTarjetasEmpresas(data.data); // Llamar a la función que renderiza las tarjetas de los alumnos
        } else {
          console.error('Error al obtener las empresas:', data.message);
        }
      })
      .catch(error => {
        console.error('Error de conexión:', error);
    });
}  

// Función para renderizar las cartas de empresas
function crearTarjetasEmpresas(empresas) {
    const cardsContainer = document.getElementById('tarjetasEmpresas');
    cardsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    // Crear una fila de Bootstrap
    const row = document.createElement('div');
    row.classList.add('row'); // Asegurarse de tener la clase 'row' para alinear las columnas

    empresas.forEach(empresa => {
        const card = crearTarjetaEmpresa(empresa); // Pasamos foto como parámetro
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4'); // Cada tarjeta estará en una columna de 4 en la cuadrícula de Bootstrap
        col.appendChild(card);
        row.appendChild(col); // Agregar la columna con la tarjeta a la fila
    });

    cardsContainer.appendChild(row); // Agregar la fila al contenedor principal
}

// Función para crear la tarjeta de cada alumno
function crearTarjetaEmpresa(empresa) {
    if (!empresa) {
        console.error("Empresa no definida:", empresa);
        return; // Si la empresa no está definida, no renderizamos nada.
    }
    
    const card = document.createElement('div');
    card.classList.add('card');
    // Crear los botones de Ver y Modificar
    const verButton         = `<button type="button" class="btn btn-secondary verEmpresa" 
                                data-id="${empresa._id}" title="Ver"><i class="fas fa-eye"></i></button>`;
    const modificarButton   = `<button type="button" class="btn btn-secondary modificarEmpresa" 
                               data-id="${empresa._id}" title="Modificar"><i class="fas fa-edit"></i></button>`;
    const eliminarButton    = `<button type="button" class="btn btn-secondary eliminarEmpresa" 
                               data-id="${empresa._id}" title="Eliminar"><i class="fas fa-trash-alt"></i> </button>`;
    const ofertasButton     = `<button type="button" class="btn btn-secondary" onclick="abrirOfertas('${empresa._id}')" 
                            data-id="${empresa._id}" title="Gestionar ofertas"><i class="fas fa-briefcase"></i> </button>`;

    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${empresa.nombre || 'Nombre no disponible'}</h5>
            <p class="card-text"">Empresa de ${empresa.rama.toUpperCase() || 'Rama no disponible'}</p>
            <div class="btn-group" role="group" >
                ${verButton}
                ${modificarButton}
                ${eliminarButton}
                ${ofertasButton}
            </div>
        </div>
    `;

    return card;
}

// Función para obtener la información de una empresa
function obtenerEmpresaPorId(empresaId, tipo) {
    if (!empresaId) {
            console.error('Error: el empresaId es undefined o vacío');
            return;
        }

        fetch(`http://localhost/proyectofinal/php/empresas.php?id=${empresaId}`, {
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
                const empresa = data.empresa;
                // Llenar los campos del modal con los datos del alumno
                document.getElementById('empresaId').value = empresa._id;
                document.getElementById('nombre').value = empresa.nombre;
                document.getElementById('telefono').value = empresa.telefono;
                document.getElementById('email').value = empresa.email;
                document.getElementById('persona_de_contacto').value = empresa.persona_de_contacto;
                document.getElementById('rama').value = empresa.rama;
                document.getElementById('fct').checked = empresa.fct || false;
                document.getElementById('bolsa').checked = empresa.bolsa || false;

                const modalTitulo = document.getElementById('formModal').querySelector('h2');
                const btnGuardar = document.getElementById('btn-guardar');
                const btnModificar = document.getElementById('btn-modificar');
                const btnOfertas = document.getElementById('btn-ofertas');

                if (tipo === 'ver') {
                    modalTitulo.textContent = 'Empresa'; // Cambiar el título
                    btnGuardar.style.display = 'none'; // Ocultar botón de guardar
                    btnModificar.style.display = 'block'; // Mostrar botón de modificar
                    btnOfertas.style.display = 'block'; // Mostrar botón de modificar
                    estadoCamposForm(true); // Deshabilitar campos para modo "ver"

                    } else if (tipo === 'modificar') {
                        modalTitulo.textContent = 'Modificar Empresa'; // Cambiar el título
                        btnGuardar.style.display = 'inline-block'; // Mostrar botón de guardar
                        btnGuardar.textContent = 'Modificar';
                        btnModificar.style.display = 'none'; // Ocultar botón de modificar
                        btnOfertas.style.display = 'none'; // Mostrar botón de guardar

                        estadoCamposForm(false); // Habilitar campos para edición
                    }

                abrirModal(document.getElementById('formModal'));  // Mostrar el modal
            } else {
                console.error('Error al obtener la información de la empresa');
            }
        })
        .catch(error => {
            console.error('Error al obtener la información de la empresa:', error);
        });
}


function abrirOfertas(empresaId) {
    // Si el ID no se pasa como parámetro, intenta obtenerlo del campo oculto
    if (!empresaId) {
        empresaId = document.getElementById('empresaId').value;
    }

    console.log("ID de la empresa:", empresaId);
    if (empresaId) {
        // Redirigir a ofertas.html con el ID de la empresa como parámetro
        window.location.href = `ofertas.html?empresaId=${empresaId}`;
    } else {
        alert("Selecciona una empresa válida para gestionar las ofertas.");
    }
}


function crearTarjetas(items, contenedorId, crearTarjeta) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = ''; // Limpiar contenedor

    const row = document.createElement('div');
    row.classList.add('row');

    items.forEach(item => {
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4');
        col.appendChild(crearTarjeta(item));
        row.appendChild(col);
    });

    contenedor.appendChild(row);
}
