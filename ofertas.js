document.addEventListener('DOMContentLoaded', function () {
  const ofertas = [];
  const tableBody = document.getElementById('ofertasTableBody');
  const ofertaForm = document.getElementById('ofertaForm');
  const ofertaIdInput = document.getElementById('ofertaId');
  const ofertaNombreInput = document.getElementById('ofertaNombre');
  const ofertaDescripcionInput = document.getElementById('ofertaDescripcion');
  const btnEliminar = document.getElementById('btnEliminar');

  // Recupera el parámetro 'empresa' de la URL
  const params = new URLSearchParams(window.location.search);
  const empresaNombre = params.get("empresaNombre");

  // Muestra el nombre de la empresa en la cabecera
  if (empresaNombre) {
      document.getElementById("empresaNombre").innerText = empresaNombre;
  }
  // Renderizar la tabla
  function renderTable() {
      tableBody.innerHTML = '';
      ofertas.forEach((oferta, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${oferta.nombre}</td>
              <td>
                  <button class="btn btn-sm btn-warning btn-edit" data-index="${index}">Editar</button>
                  <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Eliminar</button>
              </td>
          `;
          tableBody.appendChild(row);
      });
  }

  // Editar una oferta
  function editOferta(index) {
      const oferta = ofertas[index];
      ofertaIdInput.value = index;
      ofertaNombreInput.value = oferta.nombre;
      ofertaDescripcionInput.value = oferta.descripcion;
      btnEliminar.classList.remove('d-none');
      $('#ofertaModal').modal('show');
  }

  // Eliminar una oferta
  function deleteOferta(index) {
      ofertas.splice(index, 1);
      renderTable();
  }

  // Escuchar eventos en la tabla (delegación de eventos)
  tableBody.addEventListener('click', function (e) {
      const target = e.target;
      const index = target.dataset.index;
      if (target.classList.contains('btn-edit')) {
          editOferta(index);
      } else if (target.classList.contains('btn-delete')) {
          deleteOferta(index);
      }
  });

  // Manejar envío del formulario
  ofertaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const index = ofertaIdInput.value;
      const nombre = ofertaNombreInput.value;
      const descripcion = ofertaDescripcionInput.value;

      if (index) {
          // Actualizar oferta existente
          ofertas[index] = { nombre, descripcion };
      } else {
          // Agregar nueva oferta
          ofertas.push({ nombre, descripcion });
      }

      renderTable();
      $('#ofertaModal').modal('hide');
      ofertaForm.reset();
      btnEliminar.classList.add('d-none');
  });

  // Manejar eliminación
  btnEliminar.addEventListener('click', function () {
      const index = ofertaIdInput.value;
      if (index) {
          deleteOferta(index);
      }
      $('#ofertaModal').modal('hide');
      ofertaForm.reset();
      btnEliminar.classList.add('d-none');
  });

  // Render inicial
  renderTable();
});
