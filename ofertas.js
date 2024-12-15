/**
 * Este script gestiona la funcionalidad relacionada con las ofertas de empleo vinculadas a empresas.
 * Incluye operaciones para listar, agregar, editar, eliminar y asignar alumnos a ofertas específicas.
 */

// Inicialización de variables globales
const ofertasTabla = document.getElementById('ofertasTabla');
const ofertaForm = document.getElementById('ofertaForm');
const ofertaIdInput = document.getElementById('ofertaId');
const ofertaNombreInput = document.getElementById('ofertaNombre');
const ofertaDescripcionInput = document.getElementById('ofertaDescripcion');
const modalContent = document.getElementById('modalContent');
const btnOferta = document.getElementById('btn-crear-oferta');

// Obtiene el parámetro empresaId de la URL
const params = new URLSearchParams(window.location.search);
const empresaId = params.get("empresaId");


document.addEventListener('DOMContentLoaded', function () {
    /**
     * Configuración inicial para las ofertas.
     */
    const ofertaIdInput = document.getElementById('ofertaId');
    if (!ofertaIdInput) {
      console.error('El elemento ofertaIdInput no existe en el DOM');
      return;
    }
    
    // Botón para abrir el modal de añadir oferta
    document.getElementById('btn-crear-oferta').addEventListener('click', function () {
      ofertaIdInput.value = ''; 
      ofertaNombreInput.value = ''; 
      ofertaDescripcionInput.value = ''; 
    });

    // Eliminación de una oferta
    document.getElementById('confirmEliminarBoton').addEventListener('click', function () {
        if (ofertaIdEliminar) {
            fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${ofertaIdEliminar}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarOfertas(); // Recargar las ofertas después de eliminar
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmEliminarModal'));
                    confirmModal.hide();
                } else {
                    console.error('Error al eliminar la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
        }
    });
  });

    // Mostrar el nombre de la empresa en la cabecera si existe el ID
    if (empresaId) {
        // Filtrar las ofertas relacionadas con la empresa
        fetch(`http://localhost/proyectofinal/php/empresas.php?id=${empresaId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            // Renderiza las ofertas específicas
            if (data.success) {
                // Muestra el nombre de la empresa en la página
                document.getElementById("empresaNombre").innerText = data.empresa.nombre || 'Empresa no encontrada';
                
            } else {
                console.error('Empresa no encontrada:', data.message);
                document.getElementById("empresaNombre").innerText = 'Empresa no encontrada';
            }
        })
        .catch(error => console.error('Error fetching ofertas:', error));
    }

/**
 * Muestra las ofertas en una tabla HTML.
 * @param {Array} ofertas - Lista de ofertas obtenidas.
 */
function mostrarTablaOfertas(ofertas) {
    ofertasTabla.innerHTML = '';
    ofertas.forEach((oferta, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', oferta._id);

        const alumnoAsignado = oferta.alumnoAsignado
            ? `<button class="btn btn-info btn-sm btn-ver-alumnos" data-id="${oferta._id}">
                  Ver Alumno Asignado
              </button>`
            : 'No asignada';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${oferta.nombre}</td>
            <td>${alumnoAsignado}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-ver" data-id="${oferta._id}">Ver</button>
                <button class="btn btn-info btn-sm btn-editar" data-id="${oferta._id}">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar" data-id="${oferta._id}">Eliminar</button>
                <button class="btn btn-asignar btn-sm" data-id="${oferta._id}">Asignar/Desasignar</button>
            </td>
        `;
        ofertasTabla.appendChild(row);
    });
}


/**
 * Carga las ofertas y las muestra en la tabla.
 */
function cargarOfertas() {
    fetch(`http://localhost/proyectofinal/php/ofertas.php?empresaId=${empresaId}`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarTablaOfertas(data.ofertas); // Mostrar las ofertas en la tabla
            } else {
                console.error('Error al cargar las ofertas:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

/**
 * Envío del formulario de ofertas para crear o actualizar.
 */

ofertaForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const ofertaData = {
        empresaId: empresaId,
        nombre: ofertaNombreInput.value.trim(),
        descripcion: ofertaDescripcionInput.value.trim(),
    };

    const id = ofertaIdInput.value.trim(); // Si tiene valor, se actualizará; si no, es una nueva oferta

    if (!ofertaData.nombre || !ofertaData.descripcion) {
        alert("Por favor, completa todos los campos antes de guardar.");
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id
        ? `http://localhost/proyectofinal/php/ofertas.php?id=${id}`
        : 'http://localhost/proyectofinal/php/ofertas.php';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ofertaData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarOfertas(); // Actualizar las ofertas en la tabla
                ofertaForm.reset();  // Restablecer el formulario
                const ofertaModal = bootstrap.Modal.getInstance(document.getElementById('ofertaModal'));
                ofertaModal.hide(); // Cerrar el modal                
            } else {
                console.error('Error al guardar la oferta:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
});


function alumnosCompatiblesModal(ofertaId, alumnos, asignado) {
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
    const ofertaModal = new bootstrap.Modal(modalElement);
    ofertaModal.show();

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
            actualizarAlumnoAsignado(ofertaId, alumnoId, ofertaModal);
    });
}

/**
 * Asigna o desasigna alumnos a una oferta.
 * @param {string} ofertaId - ID de la oferta a modificar.
 * @param {string|null} alumnoId - ID del alumno a asignar, o null para desasignar.
 * @param {Object} ofertaModal - Instancia del modal Bootstrap.
 */
 function actualizarAlumnoAsignado(ofertaId, alumnoId, ofertaModal) {
    fetch('http://localhost/proyectofinal/php/accionesOfertas.php?action=asignarAlumno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ofertaId, alumno: alumnoId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarOfertas(); // Refrescar las ofertas en la tabla
                if (ofertaModal) {
                    ofertaModal.hide();
                }
            } else {
                console.error('Error al actualizar alumnos:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

ofertasTabla.addEventListener('click', function (e) {
    const target = e.target;
    const ofertaId = target.dataset.id;

    if (target.classList.contains('btn-ver')) {
        fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${ofertaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    ofertaIdInput.value = data.oferta._id;
                    ofertaNombreInput.value = data.oferta.nombre;
                    ofertaDescripcionInput.value = data.oferta.descripcion;

                    ofertaNombreInput.setAttribute('readonly', true);
                    ofertaDescripcionInput.setAttribute('readonly', true);

                    document.getElementById('ofertaModalTitulo').innerText = 'Consultar Oferta';
                    const guardarBoton = ofertaForm.querySelector('[type="submit"]');
                    if (guardarBoton) {
                        guardarBoton.style.display = 'none';
                    }
                    const ofertaModal = new bootstrap.Modal(document.getElementById('ofertaModal'));
                    ofertaModal.show();
                } else {
                    console.error('Error al obtener los detalles de la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    if (target.classList.contains('btn-ver-alumnos')) {
        fetch(`http://localhost/proyectofinal/php/accionesOfertas.php?action=getAlumnosAsignados&ofertaId=${ofertaId}`)
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
        fetch(`http://localhost/proyectofinal/php/accionesOfertas.php?action=getAlumnosCompatibles&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(dataCompatibles => {
                if (dataCompatibles.success) {
                    fetch(`http://localhost/proyectofinal/php/accionesOfertas.php?action=getAlumnosAsignados&ofertaId=${ofertaId}`)
                        .then(response => response.json())
                        .then(dataAsignado => {
                            if (dataAsignado.success) {
                                const asignado = dataAsignado.alumno ? dataAsignado.alumno._id : null;
                                alumnosCompatiblesModal(ofertaId, dataCompatibles.alumnos, asignado);
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
        ofertaIdEliminar = target.dataset.id;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmEliminarModal'));
        confirmModal.show();
    } else if (target.classList.contains('btn-editar')) {
        fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${ofertaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    ofertaIdInput.value = data.oferta._id;
                    ofertaNombreInput.value = data.oferta.nombre;
                    ofertaDescripcionInput.value = data.oferta.descripcion;
                    const ofertaModal = new bootstrap.Modal(document.getElementById('ofertaModal'));
                    ofertaModal.show();                
                } else {
                    console.error('Error al obtener la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    document.getElementById('ofertaModal').addEventListener('hidden.bs.modal', function () {
        ofertaIdInput.value = '';
        ofertaNombreInput.value = '';
        ofertaDescripcionInput.value = '';

        ofertaNombreInput.removeAttribute('readonly');
        ofertaDescripcionInput.removeAttribute('readonly');

        document.getElementById('ofertaModalTitulo').innerText = 'Nueva Oferta';
        const guardarBoton = ofertaForm.querySelector('[type="submit"]');
        if (guardarBoton) {
            guardarBoton.style.display = 'block';
        }
    });
});

function alumnosModal(alumnos) {
    const listaAlumnos = document.getElementById('listaAlumnos');
    if (alumnos.length === 0) {
        listaAlumnos.innerHTML = `
            <li class="list-group-item text-muted">No hay alumnos asignados a esta oferta.</li>
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

// Cargar las ofertas al iniciar la página
cargarOfertas();