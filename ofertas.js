// Inicialización
const ofertasTabla = document.getElementById('ofertasTabla');
const ofertaForm = document.getElementById('ofertaForm');
const ofertaIdInput = document.getElementById('ofertaId');
const ofertaNombreInput = document.getElementById('ofertaNombre');
const ofertaDescripcionInput = document.getElementById('ofertaDescripcion');
const modalContent = document.getElementById('modalContent');
const btnOferta = document.getElementById('btn-crear-oferta');

// Obtén el parámetro empresaId de la URL
const params = new URLSearchParams(window.location.search);
const empresaId = params.get("empresaId");


document.addEventListener('DOMContentLoaded', function () {
    const ofertaIdInput = document.getElementById('ofertaId');
    if (!ofertaIdInput) {
      console.error('El elemento ofertaIdInput no existe en el DOM');
      return;
    }
    
    // Botón para abrir el modal de añadir oferta
    document.getElementById('btn-crear-oferta').addEventListener('click', function () {
      ofertaIdInput.value = ''; // Restablece el ID
      ofertaNombreInput.value = ''; // Restablece el nombre
      ofertaDescripcionInput.value = ''; // Restablece la descripción
    });

    // Manejar la confirmación de eliminación
    document.getElementById('confirmEliminarBoton').addEventListener('click', function () {
        if (ofertaIdEliminar) {
            fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${ofertaIdEliminar}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarOfertas();
                    // Cerrar el modal de confirmación
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

    // Muestra el nombre de la empresa en la cabecera
    if (empresaId) {
        // Filtrar las ofertas relacionadas con la empresa
        fetch(`http://localhost/proyectofinal/php/empresas.php?id=${empresaId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            // Renderiza las ofertas específicas
            if (data.success) {
                // Muestra el nombre de la empresa
                document.getElementById("empresaNombre").innerText = data.empresa.nombre || 'Empresa no encontrada';
                
            } else {
                console.error('Empresa no encontrada:', data.message);
                document.getElementById("empresaNombre").innerText = 'Empresa no encontrada';
            }
        })
        .catch(error => console.error('Error fetching ofertas:', error));
    }

function mostrarTablaOfertas(ofertas) {
    ofertasTabla.innerHTML = '';
    ofertas.forEach((oferta, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', oferta._id);

        const alumnoAsignado = oferta.alumnoAsignado
            ? `<button class="btn btn-info btn-sm btn-ver-alumnos" data-id="${oferta._id}">
                  Ver Alumno Asignado
              </button>`
            : 'No asignado';

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


// Función para cargar las ofertas desde la base de datos
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
                mostrarTablaOfertas(data.ofertas);
            } else {
                console.error('Error al cargar las ofertas:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

ofertaForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const ofertaData = {
        empresaId: empresaId,
        nombre: ofertaNombreInput.value.trim(),
        descripcion: ofertaDescripcionInput.value.trim(),
    };

    const id = ofertaIdInput.value.trim(); // Puede estar vacío para nuevas ofertas

    // Validar campos obligatorios (excepto `id` para nuevas ofertas)
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
                cargarOfertas();
                ofertaForm.reset();
                // Cerrar el modal
                const ofertaModal = bootstrap.Modal.getInstance(document.getElementById('ofertaModal'));
                ofertaModal.hide();                
            } else {
                console.error('Error al guardar la oferta:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
});

function alumnosCompatiblesModal(ofertaId, alumnos, asignado) {
    const modalContent = document.querySelector("#modal .modal-body form ul");
    modalContent.innerHTML = alumnos.map(alumno => `
        <li>
            <label>
                <input type="radio" name="alumno" value="${alumno._id}" 
                       ${asignado === alumno._id ? 'checked' : ''}>
                ${alumno.nombre} ${alumno.apellidos} (${alumno.formacion.toUpperCase()})
            </label>
        </li>
    `).join('');

    // Mostrar el modal con Bootstrap
    const modalElement = document.getElementById('modal');
    const ofertaModal = new bootstrap.Modal(modalElement);
    ofertaModal.show();

    // Configurar botón para asignar
    const asignarBoton = document.getElementById('asignarBoton');
    asignarBoton.replaceWith(asignarBoton.cloneNode(true));
    const nuevoAsignarBoton = document.getElementById('asignarBoton');

    nuevoAsignarBoton.addEventListener('click', function () {
        const seleccionadoAlumno = document.querySelector('input[name="alumno"]:checked');
        if (!seleccionadoAlumno) {
            alert("Por favor, selecciona un alumno.");
            return;
        }

        const alumnoId = seleccionadoAlumno.value;
        actualizarAlumnoAsignado(ofertaId, alumnoId, ofertaModal);
    });
}

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
                console.log("Alumnos actualizados correctamente");
                cargarOfertas();
                // Cerrar el modal después de asignar
                if (ofertaModal) {
                    ofertaModal.hide();
                }
            } else {
                console.error('Error al actualizar alumnos:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}


// Manejar eliminación
ofertasTabla.addEventListener('click', function (e) {
    const target = e.target;
    const ofertaId = target.dataset.id;

    if (target.classList.contains('btn-ver')) {
        // Realizar fetch para obtener los detalles de la oferta
        fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${ofertaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Configurar el modal con los datos de la oferta
                    ofertaIdInput.value = data.oferta._id;
                    ofertaNombreInput.value = data.oferta.nombre;
                    ofertaDescripcionInput.value = data.oferta.descripcion;

                    // Hacer los campos de solo lectura
                    ofertaNombreInput.setAttribute('readonly', true);
                    ofertaDescripcionInput.setAttribute('readonly', true);

                    // Cambiar el título del modal
                    document.getElementById('ofertaModalTitulo').innerText = 'Consultar Oferta';

                    // Ocultar el botón de guardar
                    const guardarBoton = ofertaForm.querySelector('[type="submit"]');
                    if (guardarBoton) {
                        guardarBoton.style.display = 'none';
                    }

                    // Mostrar el modal
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

        // Abrir el modal de confirmación
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
                    // Mostrar el modal de edición
                    const ofertaModal = new bootstrap.Modal(document.getElementById('ofertaModal'));
                    ofertaModal.show();                
                } else {
                    console.error('Error al obtener la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    // Restaurar el modal cuando se cierra para que esté listo para editar o agregar
    document.getElementById('ofertaModal').addEventListener('hidden.bs.modal', function () {
        ofertaIdInput.value = '';
        ofertaNombreInput.value = '';
        ofertaDescripcionInput.value = '';

        ofertaNombreInput.removeAttribute('readonly');
        ofertaDescripcionInput.removeAttribute('readonly');

        // Restaurar el título del modal y mostrar el botón de guardar
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

    // Mostrar el modal
    const alumnosModal = new bootstrap.Modal(document.getElementById('alumnosModal'));
    alumnosModal.show();
}



// Cargar las ofertas al iniciar la página
cargarOfertas();