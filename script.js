/**
 * Este script gestiona la funcionalidad de la página para la administración de alumnos y empresas.
 * Permite realizar operaciones como añadir, modificar y eliminar alumnos y empresas,
 * así como gestionar su información y asociar archivos relacionados.
 */

let alumnosA = []; // Array para almacenar los alumnos obtenidos
let empresasA = []; // Array para almacenar las empresas obtenidos
const urlBase = 'http://localhost/proyectofinal/php';


document.addEventListener("DOMContentLoaded", function () {
    /**
     * Este bloque se ejecuta cuando la página ha cargado completamente.
     * Contiene la lógica principal para manejar formularios y eventos.
     */

    const formularioLogin = document.getElementById("formulario-login");

    if (formularioLogin) {
        formularioLogin.addEventListener("submit", function handleLoginFormSubmit(event) {
             /**
             * Inicio de sesión del usuario.
             * @param {Event} event - Evento de envío del formulario.
             */
            event.preventDefault(); // Evitar recargar la página

            const usuario = document.getElementById("usuario").value.trim();
            const clave = document.getElementById("clave").value.trim();
            const mensajeError = document.getElementById("mensaje-error");

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
                        localStorage.setItem("usuario", data.usuario);
                        window.location.href = 'index.html';

                    } else {
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

    if (window.location.pathname == '/index.html') {
        const usuario = localStorage.getItem("usuario");
        if (usuario) {
            // Actualiza los elementos de bienvenida con el nombre del usuario
            document.getElementById("sesion-usuario").textContent = usuario;
        } else {
            // Si no hay un usuario en el localStorage, redirigir al login
            window.location.href = 'login.html';
        }
       
    }

    // Variables globales utilizadas para modales y formularios
    const formModal = document.getElementById('formModal'); 
    const crearAlumno = document.getElementById('añadirAlumno'); 
    const crearAlumnoForm = document.getElementById('crearAlumnoForm'); 
    const crearEmpresaForm = document.getElementById('crearEmpresaForm'); 
    const addEmpresa = document.getElementById('añadirEmpresa'); 
    const cerrarModalVentana = document.getElementById('cerrarModal'); 
    const confirmEliminarModal = document.getElementById('confirmEliminarModal'); 
    const cerrarDeleteModal = document.getElementById('cerrarDeleteModal'); 
    const confirmEliminarButton = document.getElementById('confirmEliminarButton');
    const cancelarElimButton = document.getElementById('cancelarElimButton'); 
    const cerrarConfirmModal = document.getElementById('cerrarSuccessModal'); 
    const ModalElimArchivo = document.getElementById('ModalElimArchivo');
    const ElimArchivoButton = document.getElementById('EliminarArchivoButton'); 
    const cancelElimArchivoBtn = document.getElementById('cancelElimArchivoBtn'); 

    let Editando = false; 
    let alumnoEliminarId = null; 
    let empresaEliminarId = null; 

    /**
     * Lógica al cargar la página si estamos en la sección "alumnos".
     */
    if (document.body.classList.contains("alumnos")) {
        obtenerAlumnos();
        const btnGuardar = document.getElementById('btn-guardar');
        formModal.style.display = 'none';
        confirmEliminarModal.style.display = 'none';
        Editando = false

        crearAlumno.addEventListener('click', (event) => {
            /**
             * Abre el modal para crear un nuevo alumno.
             * @param {Event} event - Evento de clic en el botón para añadir alumno.
             */
            event.stopPropagation();
            Editando = false; 
            crearAlumnoForm.reset(); 
            console.log("Nuevo Alumno")
            document.getElementById('formModal').querySelector('h2').textContent = 'Nuevo Alumno'; 
            btnGuardar.style.display = 'inline-block'; 
            estadoCamposForm(false);
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; 
            document.getElementById('btn-modificar').style.display = 'none';
            abrirModal(formModal);
        });     
            
        cerrarModalVentana.addEventListener('click', (event) => {
             /**
             * Cierra el modal actual.
             * @param {Event} event - Evento de clic en el botón para cerrar el modal.
             */
            event.stopPropagation();
            cerrarModal(formModal);
        });

        crearAlumnoForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();
            const btnclick = event.submitter;
            if (btnclick.id === 'btn-modificar') {
                console.log('Modificar Alumno');
                btnGuardar.style.display = 'inline-block'; 
                document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Alumno'; // Cambiar el título
                btnGuardar.textContent = 'Modificar';
                document.getElementById('btn-modificar').style.display = 'none'; 
                Editando = true; 

                estadoCamposForm(false);
                
                const alumnomodif = alumnosA.find(alumno => alumno._id === document.getElementById('alumnoId').value);
                const subirTitulo = document.getElementById('tituloalum'); 
                const TituloBtn = document.getElementById('tituloBtn');

                if (alumnomodif.titulo_asociado) {
                    TituloBtn.style.display = 'inline-block';
                    subirTitulo.disabled = true; 
                }
                
                const subirArchivo = document.getElementById('cv'); 
                const cambiarCvBtn = document.getElementById('cambiarCvBtn');

                if (alumnomodif.cv) {
                    cambiarCvBtn.style.display = 'inline-block';
                    subirArchivo.disabled = true; 
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
                        _id: document.getElementById('alumnoId').value, 
                        nombre: document.getElementById('nombre').value,
                        apellidos: document.getElementById('apellidos').value,
                        telefono: document.getElementById('telefono').value,
                        dni: document.getElementById('dni').value,
                        direccion: document.getElementById('direccion').value,
                        email: document.getElementById('email').value,
                        formacion: document.getElementById('formacion').value,
                        titulo_asociado: nombreArchivotitulo,
                        promocion: document.getElementById('promocion').value,
                        cv: nombreArchivocv ,
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
                            hayCambios = true;
                        } 
    
                        if (!hayCambios) {
                            mensajeSinCambios.textContent = 'No se han realizado cambios.';
                            mensajeSinCambios.style.display = 'block';  
                            return;
                        } else {
                            console.log('Datos modificados correctamente');
                            mensajeSinCambios.style.display = 'none';
                        }
                        
                        const formData = new FormData(this);
                        fetch(`${urlBase}/subir_archivo.php`, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('La respuesta del servidor no fue exitosa');
                            }
                            return response.json(); 
                        })
                        .then(data => {
                            if (data.status === 'success') {
                                console.log(data.message);  
                            } else {
                                console.error('Error en la subida del archivo:', data.message);
                                const errorElement = document.getElementById('error-message');
                                if (errorElement) {
                                    errorElement.textContent = `Error: ${data.message}`;
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Hubo un error al intentar subir el archivo:', error);
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
                                obtenerAlumnos(); // Actualizar la lista de alumnos
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
            }
        });

        document.getElementById('tarjetasAlumnos').addEventListener('click', function (event) {
            const target = event.target;
            const alumnoBtn = target.closest('button[data-id]'); 
            const mensajeSinCambios = document.getElementById('mensajeSinCambios');
            mensajeSinCambios.textContent = '';

            if (!alumnoBtn) return;
        
            const alumnoId = alumnoBtn.dataset.id; 
            cambiarcv = false

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
        
        confirmEliminarButton.addEventListener('click', () => {
            if (alumnoEliminarId) {
                fetch(`${urlBase}/alumnos.php?id=${alumnoEliminarId}`, {
                    method: 'DELETE', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        mostrarModalExito('¡Cliente eliminado correctamente!'); 
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
        
        document.getElementById('cambiarCvBtn').addEventListener('click', function() {
            const fileInput = document.getElementById('cv');
            const fileInfoSpan = document.getElementById('archivoCV');
            const linkCv = document.getElementById('linkCv');
            const cambiarCvBtn = document.getElementById('cambiarCvBtn');

            fileInput.value = '';  
            fileInput.disabled = false; 
            fileInfoSpan.textContent = '';
            linkCv.innerHTML = ''; 
            cambiarCvBtn.style.display = 'none'; 
        });

        document.getElementById('tituloBtn').addEventListener('click', function() {
            const fileTitulo = document.getElementById('tituloalum');
            const fileInfoTitulo = document.getElementById('fileTitulo');
            const LinkTitulo = document.getElementById('LinkTitulo');
            const ButtonTitulo = document.getElementById('tituloBtn');

            fileTitulo.value = '';  
            fileTitulo.disabled = false; 
            fileInfoTitulo.textContent = '';
            LinkTitulo.innerHTML = ''; 
            ButtonTitulo.style.display = 'none'; 
        });

        document.getElementById('fotoBtn').addEventListener('click', function() {
            const fotoInput = document.getElementById('foto');
            const fileFoto = document.getElementById('fileFoto');
            const fotoBtn = document.getElementById('fotoBtn');

            fotoInput.value = ''; 
            fotoInput.disabled = false; 
            fileFoto.textContent = '';
            fotoBtn.style.display = 'none'; 
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

        addEmpresa.addEventListener('click', (event) => {
            event.stopPropagation();
            Editando = false; 
            crearEmpresaForm.reset(); 
            console.log("Nueva Empresa")
            document.getElementById('formModal').querySelector('h2').textContent = 'Nueva Empresa'; 
            btnGuardar.style.display = 'inline-block'; 
            btnOfertas.style.display = 'none'; 
            estadoCamposForm(false);
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; 
            document.getElementById('btn-modificar').style.display = 'none';
            abrirModal(formModal);
        });     
                    
        cerrarModalVentana.addEventListener('click', (event) => {
            event.stopPropagation();
            cerrarModal(formModal);
        });
        
        crearEmpresaForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();

            const btnclick = event.submitter;
            if (btnclick.id === 'btn-modificar') {
                console.log('Modificar Empresa');
                btnGuardar.style.display = 'inline-block'; 
                document.getElementById('formModal').querySelector('h2').textContent = 'Modificar Empresa'; // Cambiar el título
                btnGuardar.textContent = 'Modificar';
                document.getElementById('btn-modificar').style.display = 'none'; 
                Editando = true; 
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
    
                    let hayCambios = false;
                    for (const key in valoresOriginales) {
                        if (valoresOriginales[key] !== empresaData[key]) {
                            hayCambios = true;
                            break;
                        }
                    }
                    if (!hayCambios) {
                        mensajeSinCambios.textContent = 'No se han realizado cambios.';
                        mensajeSinCambios.style.display = 'block';  // Mostrar el mensaje
                        return;
                    } else {
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
            const empresaButton = target.closest('button[data-id]'); 
            const mensajeSinCambios = document.getElementById('mensajeSinCambios');
            mensajeSinCambios.textContent = '';

            if (!empresaButton) return; 
        
            const empresaId = empresaButton.dataset.id; 

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
        
        confirmEliminarButton.addEventListener('click', () => {
            if (empresaEliminarId) {
                fetch(`${urlBase}/empresas.php?id=${empresaEliminarId}`, {
                    method: 'DELETE', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        mostrarModalExito('¡Cliente eliminado correctamente!'); 
                        obtenerEmpresas(accion);
                        confirmEliminarModal.style.display = 'none';
                    } else {
                        alert('Error al eliminar la empresa.');
                    }
                })
            .catch(error => console.error('Error:', error));
            }
        });

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

    if (window.location.pathname !== '/login.html') {
        /**
         * Carga el menú desde un archivo externo si la página actual no es login.html.
         */
        fetch('menu.html')
            .then(response => response.text()) // Obtener el contenido del archivo menu.html como texto
            .then(data => {
                document.getElementById('contenedor-menu').innerHTML = data; // Insertar el contenido en el contenedor del menú
                activarHref();  // Llamar a la función para activar el enlace correspondiente
            })
            .catch(error => {
                console.error('Error al cargar el menú:', error);
            });
    }
    
    if (window.location.pathname == '/index.html') {

        // Verificar sesión en el servidor
        fetch(`${urlBase}/verificar_sesion.php`, { 
            method: 'GET',
            credentials: 'include' // Asegura que se envíen cookies de sesión
        })
        .then(response => response.json())
        .then(data => {
            if (data.usuario) {
                // Si la sesión está activa, mostrar el nombre del usuario
                document.getElementById("bienvenido").textContent = data.usuario;
            } 
        })
        .catch(error => {
            console.error("Error al verificar la sesión:", error);
        });

        const botonCerrarSesion = document.getElementById("cerrar-sesion");

        botonCerrarSesion.addEventListener("click", function (event) {
            event.preventDefault(); // Evitar la acción predeterminada del enlace
    
            // Llamar al endpoint de cierre de sesión del servidor
            fetch(`${urlBase}/logout.php`, { 
                method: 'POST',
                credentials: 'include' // Asegura que se envíen cookies de sesión
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Eliminar usuario del localStorage
                    localStorage.removeItem("usuario");
    
                    // Redirigir al login
                    window.location.href = 'login.html';
                } else {
                    console.error("Error al cerrar sesión:", data.message);
                }
            })
            .catch(error => console.error("Error al cerrar sesión:", error));
        });
    }

    /**
     * Activa el enlace correspondiente en el menú basado en la URL actual.
     */
    function activarHref() {
        const urlactual = window.location.href; // Obtener la URL actual
        const hrefs = document.querySelectorAll('#menu .nav-link'); // Seleccionar todos los enlaces del menú
        hrefs.forEach(link => {
            const href = link.getAttribute('href');  // Obtener el atributo href de cada enlace
            if (urlactual.includes(href)) {
                // Si la URL actual incluye el href, agregar la clase 'active'
                link.classList.add('active');
            } else {
                // Si no, remover la clase 'active'
                link.classList.remove('active');
            }
        });
    }
});

/**
 * Función para abrir un modal.
 * @param {HTMLElement} modal - Elemento modal a abrir.
 */
function abrirModal(modal) {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.scrollTop = 0; 
    } else {
      modal.scrollTop = 0; 
    }
    modal.focus();
}

/**
 * Función para cerrar un modal.
 * @param {HTMLElement} modal - Elemento modal a cerrar.
 */
function cerrarModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Crear las tarjetas para mostrar a los alumnos.
 * @param {Array} alumnos - Array de objetos con datos de los alumnos.
 */
function crearTarjetasAlumnos(alumnos) {
    const cardsContainer = document.getElementById('tarjetasAlumnos');
    cardsContainer.innerHTML = ''; 

    const row = document.createElement('div');
    row.classList.add('row'); 

    alumnos.forEach(alumno => {
        const foto = (alumno && alumno.foto) ? alumno.foto : 'alumno.png'; 
        const card = crearTarjetaAlumno(alumno, foto); 
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-2'); 
        col.appendChild(card);
        row.appendChild(col); 
    });
    cardsContainer.appendChild(row); 
}

/**
 * Crear una tarjeta para un alumno específico.
 * @param {Object} alumno - Datos del alumno.
 * @returns {HTMLElement} - Elemento HTML de la tarjeta del alumno.
 */
function crearTarjetaAlumno(alumno, foto) {
    if (!alumno) {
        console.error("Alumno no definido:", alumno);
        return; 
    }
    const card = document.createElement('div');
    card.classList.add('card');
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

/**
 * Función para obtener los datos de los alumnos.
 */
function obtenerAlumnos() {
    fetch(`${urlBase}/alumnos.php`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            alumnosA = data.data;  

            crearTarjetasAlumnos(data.data); 
        } else {
          console.error('Error al obtener los alumnos:', data.message);
        }
      })
      .catch(error => {
        console.error('Error de conexión:', error);
    });
}  

/**
 * Obtener los datos de un alumno específico.
 * @param {string} alumnoId - ID del alumno a buscar.
 * @param {string} tipo - Tipo de acción (ver o modificar).
 */
function obtenerAlumnoPorId(alumnoId, tipo) {
    if (!alumnoId) {
            console.error('Error: el alumnoId es undefined o vacío');
            return;
        }

        fetch(`${urlBase}/alumnos.php?id=${alumnoId}`, {
            method: 'GET'
        })
        .then(response => {
            // Verificar si la respuesta es exitosa.
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Llenar los campos del formulario/modal con los datos del alumno.
                const alumno = data.alumno;
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

                // Restablecer estados iniciales de los campos relacionados con archivos.
                LinkTitulo.innerHTML = ''; 
                tituloBtn.style.display = 'none'; 
                fileTitulo.textContent = '';

                const cambiarCvBtn = document.getElementById('cambiarCvBtn');
                const subirArchivo = document.getElementById('cv');
                const archivoCV = document.getElementById('archivoCV');
                const linkCv = document.getElementById('linkCv');

                linkCv.innerHTML = ''; 
                cambiarCvBtn.style.display = 'none'; 
                subirArchivo.disabled = false; 
                archivoCV.textContent = '';

                const fotoBtn = document.getElementById('fotoBtn');
                const fotoalum = document.getElementById('foto');
                const fileFoto = document.getElementById('fileFoto');

                fileFoto.innerHTML = ''; 
                fotoBtn.style.display = 'none'; 
                fotoalum.disabled = false; 
                fileFoto.textContent = '';

                if (tipo === 'ver') {
                    // Configurar el modal para vista de "ver".
                    modalTitulo.textContent = 'Alumno'; 
                    btnGuardar.style.display = 'none'; 
                    btnModificar.style.display = 'block'; 
                    cambiarCvBtn.disabled = false;
                    tituloBtn.disabled = false;

                    if (tituloAlumno) {
                        fileTitulo.textContent = `Archivo seleccionado: ${tituloAlumno}`;
                        const link = document.createElement("a");
                        link.href = `http://localhost/proyectofinal/php/descargas/${tituloAlumno}`;
                        link.textContent = "Descargar Título";
                        link.target = "_blank"; 
                        LinkTitulo.appendChild(link);
                    } else {
                        archivoCV.textContent = 'Este alumno no tiene Título.';
                    }

                    if (cvAlumno) {
                        archivoCV.textContent = `Archivo seleccionado: ${cvAlumno}`;
                        const link = document.createElement("a");
                        link.href = `http://localhost/proyectofinal/php/descargas/${cvAlumno}`; 
                        link.textContent = "Descargar CV";
                        link.target = "_blank"; 
                        linkCv.appendChild(link);
                    } else {
                        archivoCV.textContent = 'Este alumno no tiene un CV.';
                    }

                    if (fotoAlumno) {
                        fileFoto.textContent = `Archivo seleccionado: ${fotoAlumno}`;
                    } else {
                        fileFoto.textContent = 'Este alumno no tiene un foto.';
                    }

                    estadoCamposForm(true); 

                    } else if (tipo === 'modificar') {
                        // Configurar el modal para vista de "modificar".
                        modalTitulo.textContent = 'Modificar Alumno'; 
                        btnGuardar.style.display = 'inline-block'; 
                        btnGuardar.textContent = 'Modificar';
                        btnModificar.style.display = 'none'; 

                        estadoCamposForm(false); 

                        if (tituloAlumno) {
                            fileTitulo.textContent = `Archivo seleccionado: ${tituloAlumno}`;
                            const link = document.createElement("a");
                            link.href = `http://localhost/proyectofinal/php/descargas/${tituloAlumno}`; 
                            link.textContent = "Descargar Título";
                            link.target = "_blank"; 
                            LinkTitulo.appendChild(link);
                            
                            tituloBtn.style.display = 'inline-block';
                            tituloalum.disabled = true; 

                        } else {
                            archivoCV.textContent = 'Este alumno no tiene Título.';
                        }

                        if (cvAlumno) {
                            archivoCV.textContent = `Archivo seleccionado: ${cvAlumno}`;
                            const link = document.createElement("a");
                            link.href = `http://localhost/proyectofinal/php/descargas/${cvAlumno}`; 
                            link.textContent = "Descargar CV";
                            link.target = "_blank"; 
                            linkCv.appendChild(link);

                            cambiarCvBtn.style.display = 'inline-block';
                            subirArchivo.disabled = true;
                        } else {
                            archivoCV.textContent = 'Este alumno no tiene un CV.';
                        }

                        if (fotoAlumno) {
                            fileFoto.textContent = `Archivo seleccionado: ${fotoAlumno}`;
                            fotoBtn.style.display = 'inline-block';
                            fotoalum.disabled = true; 
                        } else {
                            fileFoto.textContent = 'Este alumno no tiene un foto.';
                        }
                }
                abrirModal(document.getElementById('formModal'));  
            } else {
                console.error('Error al obtener la información del alumno');
            }
        })
        .catch(error => {
            console.error('Error al obtener la información del alumno:', error);
        });
}

/**
 * Muestra un modal de éxito con un mensaje proporcionado.
 * @param {string} mensaje - Mensaje a mostrar en el modal de éxito.
 */
function mostrarModalExito(mensaje) {
    const successModal = document.getElementById('successModal');
    const successModalMessage = document.getElementById('successModalMessage');
    successModalMessage.textContent = mensaje; // Establecer el mensaje en el modal
    successModal.style.display = 'flex'; // Mostrar el modal
  
    setTimeout(() => {
      successModal.style.display = 'none';// Ocultar el modal después de 3 segundos
    }, 3000);
}

/**
 * Habilita o deshabilita los campos del formulario según el estado proporcionado.
 * @param {boolean} estado - Si es true, deshabilita los campos; si es false, los habilita.
 */
  function estadoCamposForm(estado) {
  const formFields = document.querySelectorAll('.form-field'); // Seleccionar los campos del formulario
  formFields.forEach(field => {
      field.disabled = estado; // Establecer el estado de los campos
  });
}
/**
 * Función para obtener los datos de las empresas.
 */
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
            empresasA = data.data || []; 
            crearTarjetasEmpresas(data.data); 
        } else {
          console.error('Error al obtener las empresas:', data.message);
        }
      })
      .catch(error => {
        console.error('Error de conexión:', error);
    });
}  
/**
 * Crear las tarjetas para mostrar a las empresas.
 * @param {Array} empresas - Array de objetos con datos de las empresas.
 */
function crearTarjetasEmpresas(empresas) {
    const cardsContainer = document.getElementById('tarjetasEmpresas');
    cardsContainer.innerHTML = ''; 

    const row = document.createElement('div');
    row.classList.add('row'); 
    empresas.forEach(empresa => {
        const card = crearTarjetaEmpresa(empresa); 
        const col = document.createElement('div');
        col.classList.add('col-md-4', 'mb-4'); 
        col.appendChild(card);
        row.appendChild(col); 
    });
    cardsContainer.appendChild(row); 
}

/**
 * Crear una tarjeta para una empresa específica.
 * @param {Object} empresa - Datos de la empresa.
 * @returns {HTMLElement} - Elemento HTML de la tarjeta de la empresa.
 */
function crearTarjetaEmpresa(empresa) {
    if (!empresa) {
        console.error("Empresa no definida:", empresa);
        return; 
    }
    
    const card = document.createElement('div');
    card.classList.add('card');
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
/**
 * Obtener los datos de una empresa específica.
 * @param {string} empresaId - ID de la empresa a buscar.
 * @param {string} tipo - Tipo de acción (ver o modificar).
 */
function obtenerEmpresaPorId(empresaId, tipo) {
    if (!empresaId) {
            console.error('Error: el empresaId es undefined o vacío');
            return;
    }

    fetch(`http://localhost/proyectofinal/php/empresas.php?id=${empresaId}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const empresa = data.empresa;
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
                modalTitulo.textContent = 'Empresa'; 
                btnGuardar.style.display = 'none'; 
                btnModificar.style.display = 'block'; 
                btnOfertas.style.display = 'block'; 
                estadoCamposForm(true); 

                } else if (tipo === 'modificar') {
                    modalTitulo.textContent = 'Modificar Empresa'; 
                    btnGuardar.style.display = 'inline-block'; 
                    btnGuardar.textContent = 'Modificar';
                    btnModificar.style.display = 'none'; 
                    btnOfertas.style.display = 'none'; 
                    estadoCamposForm(false); 
                }

            abrirModal(document.getElementById('formModal'));  
        } else {
            console.error('Error al obtener la información de la empresa');
        }
    })
    .catch(error => {
        console.error('Error al obtener la información de la empresa:', error);
    });
}

/**
 * Redirige a la página de ofertas con el ID de la empresa como parámetro.
 * @param {string} empresaId - ID de la empresa para gestionar ofertas. Si no se proporciona, se obtiene del campo oculto en el formulario.
 */
function abrirOfertas(empresaId) {
    if (!empresaId) {
        empresaId = document.getElementById('empresaId').value; // Obtener el ID desde el formulario si no se pasa como argumento
    }

    if (empresaId) {
        // Redirigir a la página de ofertas con el ID como parámetro en la URL
        window.location.href = `ofertas.html?empresaId=${empresaId}`;
    } else {
        // Mostrar una alerta si no se proporciona un ID válido
        alert("Selecciona una empresa válida para gestionar las ofertas.");
    }
}

