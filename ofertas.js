// Inicialización
const tableBody = document.getElementById('ofertasTableBody');
const ofertaForm = document.getElementById('ofertaForm');
const ofertaIdInput = document.getElementById('ofertaId');
const ofertaNombreInput = document.getElementById('ofertaNombre');
const ofertaDescripcionInput = document.getElementById('ofertaDescripcion');
const btnEliminar = document.getElementById('btnEliminar');
const modalContent = document.getElementById('modalContent');

// Obtén el parámetro empresaId de la URL
const params = new URLSearchParams(window.location.search);
const empresaId = params.get("empresaId");

// Restablecer los inputs de la oferta
ofertaNombreInput.value = ''
ofertaDescripcionInput.value = ''

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

// Función para renderizar la tabla
function renderTable(ofertas) {
    tableBody.innerHTML = '';
    ofertas.forEach((oferta, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${oferta.nombre}</td>
            <td>
                <button class="btn btn-info btn-sm btn-ver-oferta" data-id="${oferta._id}">Ver</button>
                <button class="btn btn-warning btn-sm btn-edit" data-id="${oferta._id}">Editar</button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${oferta._id}">Eliminar</button>
                <button class="btn btn-assign" data-id="${oferta._id}">Asignar</button>
            </td>

        `;
        tableBody.appendChild(row);
    });
}

// Función para cargar las ofertas desde la base de datos
function loadOfertas() {
    fetch(`http://localhost/proyectofinal/php/ofertas.php?empresaId=${empresaId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderTable(data.ofertas);
            } else {
                console.error('Error al cargar las ofertas:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

// Crear o actualizar una oferta
ofertaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log(empresaId);
    


    const ofertaData = {
        empresaId: empresaId,
        nombre: ofertaNombreInput.value,
        descripcion: ofertaDescripcionInput.value,
    };

    const id = ofertaIdInput.value;
    
    if (!id || !ofertaData.nombre || !ofertaData.descripcion) {
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
                loadOfertas();
                ofertaForm.reset();
                $('#ofertaModal').modal('hide');
                btnEliminar.classList.add('d-none');
            } else {
                console.error('Error al guardar la oferta:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
});

// Manejar asignación de alumnos
tableBody.addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('btn-assign')) {
        const ofertaId = target.dataset.id;

        fetch(`http://localhost/proyectofinal/php/empresas.php?action=getAlumnosCompatibles&empresaId=${empresaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderAlumnosCompatiblesModal(ofertaId, data.alumnos);
                } else {
                    console.error('Error al cargar alumnos compatibles:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }
});

// Renderizar el modal de alumnos compatibles
function renderAlumnosCompatiblesModal(ofertaId, alumnos) {
    modalContent.innerHTML = `
        <h5>Asignar alumnos a la oferta</h5>
        <form id="asignarForm">
            <ul>
                ${alumnos.map(alumno => `
                    <li>
                        <label>
                            <input type="checkbox" value="${alumno._id}">
                            ${alumno.nombre} (${alumno.formacion})
                        </label>
                    </li>
                `).join('')}
            </ul>
            <button type="submit" class="btn btn-primary">Asignar</button>
        </form>
    `;
    $('#modal').modal('show');

    document.getElementById('asignarForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const selectedAlumnos = Array.from(this.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.value);

        asignarAlumnos(ofertaId, selectedAlumnos);
    });
}

// Función para asignar alumnos a una oferta
function asignarAlumnos(ofertaId, alumnos) {
    fetch('http://localhost/proyectofinal/php/empresas.php?action=asignarAlumnos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ofertaId, alumnos }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Alumnos asignados correctamente');
                $('#modal').modal('hide');
            } else {
                console.error('Error al asignar alumnos:', data.message);
            }
        })
        .catch(error => console.error('Error al conectar con el servidor:', error));
}

// Manejar eliminación
tableBody.addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('btn-delete')) {
        const id = target.dataset.id;

        fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadOfertas();
                } else {
                    console.error('Error al eliminar la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    } else if (target.classList.contains('btn-edit')) {
        const id = target.dataset.id;

        fetch(`http://localhost/proyectofinal/php/ofertas.php?id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    ofertaIdInput.value = data.oferta._id;
                    ofertaNombreInput.value = data.oferta.nombre;
                    ofertaDescripcionInput.value = data.oferta.descripcion;
                    btnEliminar.classList.remove('d-none');
                    $('#ofertaModal').modal('show');
                } else {
                    console.error('Error al obtener la oferta:', data.message);
                }
            })
            .catch(error => console.error('Error al conectar con el servidor:', error));
    }
});

// Cargar las ofertas al iniciar la página
loadOfertas();