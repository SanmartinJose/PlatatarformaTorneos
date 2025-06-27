import { generarFormularioEquipos, obtenerDatosEquipos } from './js/formulario.js';
import { generarLlavesHTML } from './torneo.js'; // ahora apunta al archivo raíz de lógica de torneos
import html2pdf from 'html2pdf.js';

const configForm = document.getElementById('configForm');
const equiposForm = document.getElementById('equiposForm');
const generarLlavesBtn = document.getElementById('generarLlavesBtn');
const exportarPDFBtn = document.getElementById('exportarPDFBtn');
const llavesContainer = document.getElementById('llavesContainer');
const formatoSelect = document.getElementById('formato');
const configSuizo = document.getElementById('configSuizo');
const tablaPosicionesContainer = document.getElementById('tablaPosicionesContainer'); // ← Asegúrate de que exista

let cantidadEquipos = 0;

// Mostrar campos dinámicos según el formato seleccionado
formatoSelect.addEventListener('change', () => {
  const formato = formatoSelect.value;

  // Mostrar/ocultar input de rondas
  if (configSuizo) {
    configSuizo.classList.toggle('d-none', formato !== 'suizo');
  }

  // Mostrar/ocultar tabla de posiciones
  if (tablaPosicionesContainer) {
    tablaPosicionesContainer.classList.toggle('d-none', formato !== 'suizo');
  }
});

// Generar formulario dinámico según cantidad de equipos
configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  cantidadEquipos = parseInt(document.getElementById('numEquipos').value);
  if (cantidadEquipos >= 2) {
    generarFormularioEquipos(cantidadEquipos, equiposForm);
    generarLlavesBtn.classList.remove('d-none');
  }
});

// Generar las llaves según el formato y equipos
generarLlavesBtn.addEventListener('click', () => {
  const equipos = obtenerDatosEquipos();
  const formato = formatoSelect.value;

  if (formato === 'suizo') {
    const rondas = parseInt(document.getElementById('numRondas').value || '3');
    window.totalRondasSuizas = rondas; // pasa a variable global (usada en suizo.js)
  }

  llavesContainer.innerHTML = generarLlavesHTML(equipos, formato);
  exportarPDFBtn.classList.remove('d-none');
});

// Exportar a PDF
exportarPDFBtn.addEventListener('click', () => {
  html2pdf().from(llavesContainer).save('llaves_torneo.pdf');
});
