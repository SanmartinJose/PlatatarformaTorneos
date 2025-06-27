import { generarFormularioEquipos, obtenerDatosEquipos } from './js/formulario.js';
import { generarLlavesHTML } from './torneo.js'; 
import html2pdf from 'html2pdf.js';

const configForm = document.getElementById('configForm');
const equiposForm = document.getElementById('equiposForm');
const generarLlavesBtn = document.getElementById('generarLlavesBtn');
const exportarPDFBtn = document.getElementById('exportarPDFBtn');
const llavesContainer = document.getElementById('llavesContainer');
const formatoSelect = document.getElementById('formato');
const configSuizo = document.getElementById('configSuizo');
const tablaPosicionesContainer = document.getElementById('tablaPosicionesContainer');

let cantidadEquipos = 0;

formatoSelect.addEventListener('change', () => {
  const formato = formatoSelect.value;
  if (configSuizo) {
    configSuizo.classList.toggle('d-none', formato !== 'suizo');
  }
  if (tablaPosicionesContainer) {
    tablaPosicionesContainer.classList.toggle('d-none', formato !== 'suizo');
  }
});

configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  cantidadEquipos = parseInt(document.getElementById('numEquipos').value);
  if (cantidadEquipos >= 2) {
    generarFormularioEquipos(cantidadEquipos, equiposForm);
    generarLlavesBtn.classList.remove('d-none');
  }
});

generarLlavesBtn.addEventListener('click', () => {
  let equipos = obtenerDatosEquipos();
  equipos = equipos.filter(eq => eq && eq.nombre && eq.capitan); // Filtra vacíos o incompletos
  const formato = formatoSelect.value;

  if (equipos.length < 2) {
    llavesContainer.innerHTML = `<p class="text-danger">Debes ingresar al menos dos equipos completos (nombre y capitán).</p>`;
    exportarPDFBtn.classList.add('d-none');
    return;
  }

  if (formato === 'suizo') {
    const rondas = parseInt(document.getElementById('numRondas').value || '3');
    window.totalRondasSuizas = rondas;
  }

  llavesContainer.innerHTML = generarLlavesHTML(equipos, formato);
  exportarPDFBtn.classList.remove('d-none');
});

exportarPDFBtn.addEventListener('click', () => {
  html2pdf().from(llavesContainer).save('llaves_torneo.pdf');
});
