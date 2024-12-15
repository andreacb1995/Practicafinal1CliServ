/**
 * Este script gestiona la funcionalidad relacionada con las practicas de empleo vinculadas a empresas.
 * Incluye operaciones para listar, agregar, editar, eliminar y asignar alumnos a practicas específicas.
 */

// Inicialización de variables globales
const practicasTabla = document.getElementById('practicasTabla');
const practicaForm = document.getElementById('practicaForm');
const practicaIdInput = document.getElementById('practicaId');
const practicaNombreInput = document.getElementById('practicaNombre');
const practicaDescripcionInput = document.getElementById('practicaDescripcion');
const modalContent = document.getElementById('modalContent');
const btnpractica = document.getElementById('btn-crear-practica');

// Obtiene el parámetro empresaId de la URL
const params = new URLSearchParams(window.location.search);
const empresaId = params.get("empresaId");


document.addEventListener('DOMContentLoaded', function () {
    /**
     * Configuración inicial para las practicas.
     */
    const practicaIdInput = document.getElementById('practicaId');
    if (!practicaIdInput) {
      console.error('El elemento practicaIdInput no existe en el DOM');
      return;
    }
    
    // Botón para abrir el modal de añadir practica
    document.getElementById('btn-crear-practica').addEventListener('click', function () {
      practicaIdInput.value = ''; 
      practicaNombreInput.value = ''; 
      practicaDescripcionInput.value = ''; 
    });

    // Eliminación de una practica
    document.getElementById('confirmEliminarBoton').addEventListener('click', function () {
        if (practicaIdEliminar) {
            fetch(`http://localhost/proyectofinal/php/practicas.php?id=${practicaIdEliminar}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarpracticas(); // Recargar las practicas después de eliminar
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmEliminarModal'));
                    confirmModal.hide();
                } else {
                    console.error('Error al eliminar la practica:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
        }
    });
  });

    // Mostrar el nombre de la empresa en la cabecera si existe el ID
    if (empresaId) {
        // Filtrar las practicas relacionadas con la empresa
        fetch(`http://localhost/proyectofinal/php/empresas.php?id=${empresaId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            // Renderiza las practicas específicas
            if (data.success) {
                // Muestra el nombre de la empresa en la página
                document.getElementById("empresaNombre").innerText = data.empresa.nombre || 'Empresa no encontrada';
                
            } else {
                console.error('Empresa no encontrada:', data.message);
                document.getElementById("empresaNombre").innerText = 'Empresa no encontrada';
            }
        })
        .catch(error => console.error('Error fetching practicas:', error));
    }

/**
 * Muestra las practicas en una tabla HTML.
 * @param {Array} practicas - Lista de practicas obtenidas.
 */
function mostrarTablapracticas(practicas) {
    practicasTabla.innerHTML = '';
    practicas.forEach((practica, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', practica._id);

        const alumnoAsignado = practica.alumnoAsignado
            ? `<button class="btn btn-info btn-sm btn-ver-alumnos" data-id="${practica._id}">
                  Ver Alumno Asignado
              </button>`
            : 'No asignada';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${practica.nombre}</td>
            <td>${alumnoAsignado}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-ver" data-id="${practica._id}">Ver</button>
                <button class="btn btn-info btn-sm btn-editar" data-id="${practica._id}">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar" data-id="${practica._id}">Eliminar</button>
                <button class="btn btn-asignar btn-sm" data-id="${practica._id}">Asignar/Desasignar</button>
            </td>
        `;
        practicasTabla.appendChild(row);
    });
}

/**
 * Carga las practicas y las muestra en la tabla.
 */
function cargarpracticas() {
    fetch(`http://localhost/proyectofinal/php/practicas.php?empresaId=${empresaId}`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarTablapracticas(data.practicas); // Mostrar las practicas en la tabla
            } else {
                console.error('Error al cargar las practicas:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

/**
 * Envío del formulario de practicas para crear o actualizar.
 */
practicaForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const practicaData = {
        empresaId: empresaId,
        nombre: practicaNombreInput.value.trim(),
        descripcion: practicaDescripcionInput.value.trim(),
    };

    const id = practicaIdInput.value.trim(); // Si tiene valor, se actualizará; si no, es una nueva practica

    if (!practicaData.nombre || !practicaData.descripcion) {
        alert("Por favor, completa todos los campos antes de guardar.");
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id
        ? `http://localhost/proyectofinal/php/practicas.php?id=${id}`
        : 'http://localhost/proyectofinal/php/practicas.php';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(practicaData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarpracticas(); // Actualizar las practicas en la tabla
                practicaForm.reset();  // Restablecer el formulario
                const practicaModal = bootstrap.Modal.getInstance(document.getElementById('practicaModal'));
                practicaModal.hide(); // Cerrar el modal                
            } else {
                console.error('Error al guardar la practica:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
});


function alumnosCompatiblesModal(practicaId, alumnos, asignado) {
    const modalContent = document.querySelector("#modal .modal-body form ul");
    modalContent.innerHTML = `
        ${alumnos.map(alumno => `
            <li>
                <label>
                    <input type="radio" name="alumno" value="${alumno._id}" 
                           ${asignado === alumno._id ? 'checked' : ''}>
                    ${alumno.nombre} ${alumno.apellidos} (${alumno.formacion.toUpperCase()})
                </label>
            </li>
        `).join('')}
        <li>
            <label>
                <input type="radio" name="alumno" value="" ${!asignado ? 'checked' : ''}>
                No asignada
            </label>
        </li>
    `;

    const modalElement = document.getElementById('modal');
    const practicaModal = new bootstrap.Modal(modalElement);
    practicaModal.show();

    const asignarBoton = document.getElementById('asignarBoton');
    asignarBoton.replaceWith(asignarBoton.cloneNode(true));
    const nuevoAsignarBoton = document.getElementById('asignarBoton');

    nuevoAsignarBoton.addEventListener('click', function () {
        const seleccionadoAlumno = document.querySelector('input[name="alumno"]:checked');
        if (!seleccionadoAlumno) {
            alert("Por favor, selecciona un alumno.");
            return;
        }

        const alumnoId = seleccionadoAlumno.value || null; 
            actualizarAlumnoAsignado(practicaId, alumnoId, practicaModal);
    });
}

/**
 * Asigna o desasigna alumnos a una practica.
 * @param {string} practicaId - ID de la practica a modificar.
 * @param {string|null} alumnoId - ID del alumno a asignar, o null para desasignar.
 * @param {Object} practicaModal - Instancia del modal Bootstrap.
 */
 function actualizarAlumnoAsignado(practicaId, alumnoId, practicaModal) {
    fetch('http://localhost/proyectofinal/php/accionesPracticas.php?action=asignarAlumno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ practicaId, alumno: alumnoId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarpracticas(); // Refrescar las practicas en la tabla
                if (practicaModal) {
                    practicaModal.hide();
                }
            } else {
                console.error('Error al actualizar alumnos:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

practicasTabla.addEventListener('click', function (e) {
    const target = e.target;
    const practicaId = target.dataset.id;

    if (target.classList.contains('btn-ver')) {
        fetch(`http://localhost/proyectofinal/php/practicas.php?id=${practicaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    practicaIdInput.value = data.practica._id;
                    practicaNombreInput.value = data.practica.nombre;
                    practicaDescripcionInput.value = data.practica.descripcion;

                    practicaNombreInput.setAttribute('readonly', true);
                    practicaDescripcionInput.setAttribute('readonly', true);

                    document.getElementById('practicaModalTitulo').innerText = 'Consultar practica';
                    const guardarBoton = practicaForm.querySelector('[type="submit"]');
                    if (guardarBoton) {
                        guardarBoton.style.display = 'none';
                    }
                    const practicaModal = new bootstrap.Modal(document.getElementById('practicaModal'));
                    practicaModal.show();
                } else {
                    console.error('Error al obtener los detalles de la practica:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    if (target.classList.contains('btn-ver-alumnos')) {
        fetch(`http://localhost/proyectofinal/php/accionesPracticas.php?action=getAlumnosAsignados&practicaId=${practicaId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alumnosModal(data.alumno ? [data.alumno] : []); 
            } else {
                console.error('Error al cargar alumnos asignados:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    if (target.classList.contains('btn-asignar')) {
        fetch(`http://localhost/proyectofinal/php/accionesPracticas.php?action=getAlumnosCompatibles&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(dataCompatibles => {
                if (dataCompatibles.success) {
                    console.log(dataCompatibles.alumnos)
                    fetch(`http://localhost/proyectofinal/php/accionesPracticas.php?action=getAlumnosAsignados&practicaId=${practicaId}`)
                        .then(response => response.json())
                        .then(dataAsignado => {
                            console.log(dataAsignado)
                        if (dataAsignado.success) {
                                const asignado = dataAsignado.alumno ? dataAsignado.alumno._id : null;
                                alumnosCompatiblesModal(practicaId, dataCompatibles.alumnos, asignado);
                            } else {
                                console.error('Error al cargar alumno asignado:', dataAsignado.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error en la solicitud fetch:', error);
                        });
                } else {
                    console.error('Error al cargar alumnos compatibles:', dataCompatibles.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }
    
    if (target.classList.contains('btn-eliminar')) {
        practicaIdEliminar = target.dataset.id;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmEliminarModal'));
        confirmModal.show();
    } else if (target.classList.contains('btn-editar')) {
        fetch(`http://localhost/proyectofinal/php/practicas.php?id=${practicaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    practicaIdInput.value = data.practica._id;
                    practicaNombreInput.value = data.practica.nombre;
                    practicaDescripcionInput.value = data.practica.descripcion;
                    const practicaModal = new bootstrap.Modal(document.getElementById('practicaModal'));
                    practicaModal.show();                
                } else {
                    console.error('Error al obtener la practica:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    document.getElementById('practicaModal').addEventListener('hidden.bs.modal', function () {
        practicaIdInput.value = '';
        practicaNombreInput.value = '';
        practicaDescripcionInput.value = '';

        practicaNombreInput.removeAttribute('readonly');
        practicaDescripcionInput.removeAttribute('readonly');

        document.getElementById('practicaModalTitulo').innerText = 'Nueva practica';
        const guardarBoton = practicaForm.querySelector('[type="submit"]');
        if (guardarBoton) {
            guardarBoton.style.display = 'block';
        }
    });
});

function alumnosModal(alumnos) {
    const listaAlumnos = document.getElementById('listaAlumnos');
    if (alumnos.length === 0) {
        listaAlumnos.innerHTML = `
            <li class="list-group-item text-muted">No hay alumnos asignados a esta practica.</li>
        `;
    } else {
        listaAlumnos.innerHTML = alumnos.map(alumno => `
            <li class="list-group-item">
                <strong>${alumno.nombre} ${alumno.apellidos}</strong> (${alumno.email})
            </li>
        `).join('');
    }
    const alumnosModal = new bootstrap.Modal(document.getElementById('alumnosModal'));
    alumnosModal.show();
}

// Cargar las practicas al iniciar la página
cargarpracticas();