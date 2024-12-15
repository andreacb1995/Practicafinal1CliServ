/**
 * Este script gestiona la funcionalidad relacionada con las cursos de empleo vinculadas a empresas.
 * Incluye operaciones para listar, agregar, editar, eliminar y asignar alumnos a cursos específicas.
 */

// Inicialización de variables globales
const cursosTabla = document.getElementById('cursosTabla');
const cursoForm = document.getElementById('cursoForm');
const cursoIdInput = document.getElementById('cursoId');
const cursoNombreInput = document.getElementById('cursoNombre');
const cursoDescripcionInput = document.getElementById('cursoDescripcion');
const modalContent = document.getElementById('modalContent');
const btncurso = document.getElementById('btn-crear-curso');


document.addEventListener('DOMContentLoaded', function () {
    /**
     * Configuración inicial para las cursos.
     */
    const cursoIdInput = document.getElementById('cursoId');
    if (!cursoIdInput) {
      console.error('El elemento cursoIdInput no existe en el DOM');
      return;
    }
    
    // Botón para abrir el modal de añadir curso
    document.getElementById('btn-crear-curso').addEventListener('click', function () {
      cursoIdInput.value = ''; 
      cursoNombreInput.value = ''; 
      cursoDescripcionInput.value = ''; 
    });

    // Eliminación de una curso
    document.getElementById('confirmEliminarBoton').addEventListener('click', function () {
        if (cursoIdEliminar) {
            fetch(`http://localhost/proyectofinal/php/cursos.php?id=${cursoIdEliminar}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarcursos(); // Recargar las cursos después de eliminar
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmEliminarModal'));
                    confirmModal.hide();
                } else {
                    console.error('Error al eliminar la curso:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
        }
    });
  });



/**
 * Muestra las cursos en una tabla HTML.
 * @param {Array} cursos - Lista de cursos obtenidas.
 */
function mostrarTablacursos(cursos) {
    cursosTabla.innerHTML = '';
    cursos.forEach((curso, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', curso._id);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${curso.nombre}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-ver" data-id="${curso._id}">Ver</button>
                <button class="btn btn-info btn-sm btn-editar" data-id="${curso._id}">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar" data-id="${curso._id}">Eliminar</button>
                <button class="btn btn-asignaturas btn-sm" data-id="${curso._id}" onclick="abrirAsignaturas('${curso._id}')">Ver Asignaturas</button>
            </td>

             
        `;
        cursosTabla.appendChild(row);
    });
}


/**
 * Carga las cursos y las muestra en la tabla.
 */
function cargarcursos() {
    fetch(`http://localhost/proyectofinal/php/cursos.php`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarTablacursos(data.data); // Mostrar las cursos en la tabla
            } else {
                console.error('Error al cargar las cursos:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

/**
 * Envío del formulario de cursos para crear o actualizar.
 */

cursoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const cursoData = {
        nombre: cursoNombreInput.value.trim(),
        descripcion: cursoDescripcionInput.value.trim(),
    };

    const id = cursoIdInput.value.trim(); // Si tiene valor, se actualizará; si no, es una nueva curso

    if (!cursoData.nombre || !cursoData.descripcion) {
        alert("Por favor, completa todos los campos antes de guardar.");
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id
        ? `http://localhost/proyectofinal/php/cursos.php?id=${id}`
        : 'http://localhost/proyectofinal/php/cursos.php';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cargarcursos(); // Actualizar las cursos en la tabla
                cursoForm.reset();  // Restablecer el formulario
                const cursoModal = bootstrap.Modal.getInstance(document.getElementById('cursoModal'));
                cursoModal.hide(); // Cerrar el modal                
            } else {
                console.error('Error al guardar la curso:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
});


cursosTabla.addEventListener('click', function (e) {
    const target = e.target;
    const cursoId = target.dataset.id;

    if (target.classList.contains('btn-ver')) {
        fetch(`http://localhost/proyectofinal/php/cursos.php?id=${cursoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(data.curso)
                    cursoIdInput.value = data.curso._id;
                    cursoNombreInput.value = data.curso.nombre;
                    cursoDescripcionInput.value = data.curso.descripcion;

                    cursoNombreInput.setAttribute('readonly', true);
                    cursoDescripcionInput.setAttribute('readonly', true);

                    document.getElementById('cursoModalTitulo').innerText = 'Consultar curso';
                    const guardarBoton = cursoForm.querySelector('[type="submit"]');
                    if (guardarBoton) {
                        guardarBoton.style.display = 'none';
                    }
                    const cursoModal = new bootstrap.Modal(document.getElementById('cursoModal'));
                    cursoModal.show();
                } else {
                    console.error('Error al obtener los detalles del curso:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    if (target.classList.contains('btn-eliminar')) {
        cursoIdEliminar = target.dataset.id;

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmEliminarModal'));
        confirmModal.show();
    } else if (target.classList.contains('btn-editar')) {
        fetch(`http://localhost/proyectofinal/php/cursos.php?id=${cursoId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cursoIdInput.value = data.curso._id;
                    cursoNombreInput.value = data.curso.nombre;
                    cursoDescripcionInput.value = data.curso.descripcion;
                    const cursoModal = new bootstrap.Modal(document.getElementById('cursoModal'));
                    cursoModal.show();                
                } else {
                    console.error('Error al obtener la curso:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }

    document.getElementById('cursoModal').addEventListener('hidden.bs.modal', function () {
        cursoIdInput.value = '';
        cursoNombreInput.value = '';
        cursoDescripcionInput.value = '';

        cursoNombreInput.removeAttribute('readonly');
        cursoDescripcionInput.removeAttribute('readonly');

        document.getElementById('cursoModalTitulo').innerText = 'Nuevo curso';
        const guardarBoton = cursoForm.querySelector('[type="submit"]');
        if (guardarBoton) {
            guardarBoton.style.display = 'block';
        }
    });
});


function abrirAsignaturas(cursoId) {
    if (!cursoId) {
        cursoId = document.getElementById('cursoId').value; // Obtener el ID desde el formulario si no se pasa como argumento
    }

    if (cursoId) {
        // Redirigir a la página de ofertas con el ID como parámetro en la URL
        window.location.href = `asignaturas.html?cursoId=${cursoId}`;
    } else {
        // Mostrar una alerta si no se proporciona un ID válido
        alert("Selecciona un curso válido para gestionar las asignaturas.");
    }
}
// Cargar las cursos al iniciar la página
cargarcursos();