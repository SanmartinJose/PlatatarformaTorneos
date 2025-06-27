import { generarRondaEliminacion } from './modulos/eliminacion.js';
import { iniciarDobleEliminacion } from './modulos/doble.js';
import { iniciarRondaSuiza } from './modulos/suizo.js';

export function generarLlavesHTML(equipos, formato) {
  // Filtrado de equipos incompletos, obligatorio aquí
  equipos = (equipos || []).filter(eq => eq && eq.nombre && eq.capitan);

  if (equipos.length < 2)
    return `<p class="text-danger">Debes ingresar al menos dos equipos completos.</p>`;

  if (formato === 'eliminacion') {
    return generarRondaEliminacion(equipos);
  } else if (formato === 'doble') {
    return iniciarDobleEliminacion(equipos);
  } else if (formato === 'suizo') {
    return iniciarRondaSuiza(equipos);
  }

  return `<p class="text-danger">Formato aún no implementado: ${formato}</p>`;
}

// Escucha para mostrar el campo de rondas suizas si se selecciona
const selectFormato = document.getElementById('formato');
if (selectFormato) {
  selectFormato.addEventListener('change', () => {
    const configSuizo = document.getElementById('configSuizo');
    if (configSuizo) {
      configSuizo.classList.toggle('d-none', selectFormato.value !== 'suizo');
    }
  });
}

export function obtenerDatosFormulario() {
  const numEquipos = parseInt(document.getElementById('numEquipos')?.value || '0');
  const formato = document.getElementById('formato')?.value;
  const equipos = [];

  for (let i = 1; i <= numEquipos; i++) {
    const nombre = document.getElementById(`equipo${i}`)?.value;
    const capitan = document.getElementById(`capitan${i}`)?.value;
    if (nombre && capitan) {
      equipos.push({ nombre, capitan });
    }
  }
  return { equipos, formato };
}
