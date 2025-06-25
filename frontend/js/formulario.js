export function generarFormularioEquipos(num, container) {
  container.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const grupo = document.createElement('div');
    grupo.classList.add('mb-2');
    grupo.innerHTML = `
      <label class="form-label">Equipo ${i}</label>
      <input type="text" class="form-control mb-1" placeholder="Nombre del equipo" required name="equipo${i}">
      <input type="text" class="form-control" placeholder="Nombre del capitán" required name="capitan${i}">
    `;
    container.appendChild(grupo);
  }
}

export function obtenerDatosEquipos() {
  const inputs = document.querySelectorAll('#equiposForm input');
  const equipos = [];
  for (let i = 0; i < inputs.length; i += 2) {
    equipos.push({
      nombre: inputs[i].value,
      capitan: inputs[i + 1].value
    });
  }
  return equipos;
}
