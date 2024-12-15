const url = 'http://localhost/proyectofinal/php';

document.addEventListener('DOMContentLoaded', () => {
  const contenido = document.getElementById('contenido');
  const breadcrumb = document.getElementById('breadcrumb');

  // Obtiene el parámetro cursoId de la URL
  const params = new URLSearchParams(window.location.search);
  const cursoId = params.get("cursoId");
  mostrarAsignaturas(cursoId);

  /**
   * Realiza una solicitud HTTP utilizando fetch.
   * @param {string} url - La URL a la que se enviará la solicitud.
   * @param {Object} opciones - Opciones adicionales para la solicitud fetch (opcional).
   * @returns {Object|null} - Los datos de la respuesta JSON o null si ocurre un error.
   */
  async function obtenerDatos(url, opciones  = {}) {
    try {
      const respuesta  = await fetch(url, opciones );
      const data = await respuesta .json();
      if (!data.success) throw new Error(data.message || 'Error desconocido');
      return data;
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      return null;
    }
  }

  /**
   * Obtiene el nombre de un curso a partir de su ID.
   * @param {string} cursoId - El ID del curso.
   * @returns {string} - El nombre del curso o un valor genérico si no se encuentra.
   */
  async function obtenerNombreCurso(cursoId) {
    const data = await obtenerDatos(`${url}/cursos.php?id=${cursoId}`);
    return data ? data.curso.nombre : 'Curso'; // Devuelve "Curso" si no se encuentra el nombre
  }

  /**
   * Muestra la lista de asignaturas para un curso específico.
   * @param {string} cursoId - El ID del curso cuyas asignaturas se mostrarán.
   */
  async function mostrarAsignaturas(cursoId) {
    const nombreCurso = await obtenerNombreCurso(cursoId); // Obtener el nombre del curso
    const data = await obtenerDatos(`${url}/asignaturas.php?cursoId=${cursoId}`);
    if (!data) return console.error('No se encontraron asignaturas');

    // Actualizar el breadcrumb
    breadcrumb.innerHTML = `
      <li class="breadcrumb-item"><a href="#" id="inicioBreadcrumb">Inicio</a></li>
      <li class="breadcrumb-item active" aria-current="page">Asignaturas</li>
    `;

    // Mostrar la lista de asignaturas
    contenido.innerHTML = `
      <h3>Asignaturas del Curso: ${nombreCurso}</h3>
      <ul class="list-group">
        ${data.asignaturas.map(asignatura => `
          <li class="list-group-item">
            <a href="#" class="asignatura-link" data-id="${asignatura._id}">${asignatura.nombre}</a>
          </li>
        `).join('')}
      </ul>
    `;

    // Clics en el breadcrumb para volver al inicio
    document.getElementById('inicioBreadcrumb')?.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarAsignaturas(cursoId); // Volver a mostrar asignaturas
    });

    // Clics en cada asignatura para mostrar notas
    document.querySelectorAll('.asignatura-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarNotas(link.dataset.id);
      });
    });
  }

  /**
   * Muestra las notas de una asignatura específica.
   * @param {string} idAsignatura - El ID de la asignatura cuyas notas se mostrarán.
   */
  async function mostrarNotas(idAsignatura) {
    const data = await obtenerDatos(`${url}/notas.php?idAsignatura=${idAsignatura}`);
    if (!data) return console.error('No se encontraron notas');

    // Actualizar el breadcrumb
    breadcrumb.innerHTML = `
      <li class="breadcrumb-item"><a href="#" id="inicioBreadcrumb">Inicio</a></li>
      <li class="breadcrumb-item"><a href="#" id="asignaturasBreadcrumb">Asignaturas</a></li>
      <li class="breadcrumb-item active" aria-current="page">Notas</li>
    `;

    // Mostrar la tabla de notas 
    contenido.innerHTML = `
      <h3>Notas de la Asignatura</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          ${data.notas.map(nota => `
            <tr>
              <td>${nota.alumno} ${nota.apellidos}</td>
              <td>${nota.nota}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Navegación en el breadcrumb
    document.getElementById('inicioBreadcrumb')?.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarAsignaturas(cursoId); // Vuelve a mostrar asignaturas del curso
    });

    document.getElementById('asignaturasBreadcrumb')?.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarAsignaturas(cursoId); // Vuelve a mostrar asignaturas del curso
    });
  }

});


