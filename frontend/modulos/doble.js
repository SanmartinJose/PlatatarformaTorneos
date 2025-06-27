// doble.js - Lógica completa para torneo de doble eliminación con confirmación y tercer lugar

let dobleState = {};
let rondaGanadores = [];
let rondaPerdedores = [];
let finalGanador = null;
let finalSubcampeon = null;
let tercerLugarGanador = null;

export function iniciarDobleEliminacion(equipos) {
  dobleState = {
    upper: barajarEquipos(equipos),
    lower: [],
    rondaUpper: 1,
    rondaLower: 1,
    finalJugada: false,
    granFinal: false,
    campeon: null,
    subcampeon: null,
  };
  rondaGanadores = [];
  rondaPerdedores = [];
  finalGanador = null;
  finalSubcampeon = null;
  tercerLugarGanador = null;
  clearContenedor();
  return renderUpperBracket();
}

function barajarEquipos(equipos) {
  const array = [...equipos];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderUpperBracket() {
  let html = `<h3>Llave de Ganadores - Ronda ${dobleState.rondaUpper}</h3><div class="row">`;
  for (let i = 0; i < dobleState.upper.length; i += 2) {
    const eq1 = dobleState.upper[i];
    const eq2 = dobleState.upper[i + 1] || { nombre: 'Libre', capitan: '-' };
    html += crearCard(eq1, eq2, 'upper');
  }
  html += '</div>';
  return html;
}

function renderLowerBracket() {
  if (dobleState.lower.length === 0) return ''; // Sin partidos en perdedores aún
  let html = `<h3>Llave de Perdedores - Ronda ${dobleState.rondaLower}</h3><div class="row">`;
  for (let i = 0; i < dobleState.lower.length; i += 2) {
    const eq1 = dobleState.lower[i];
    const eq2 = dobleState.lower[i + 1] || { nombre: 'Libre', capitan: '-' };
    html += crearCard(eq1, eq2, 'lower');
  }
  html += '</div>';
  return html;
}

function crearCard(eq1, eq2, tipo) {
  // Evitar duplicar historialResultados: lo manejamos sólo cuando confirmamos ronda
  return `
    <div class="col-md-6 mb-2">
      <div class="card p-2 text-center" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
        <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
        <button class="btn btn-sm btn-${tipo === 'upper' ? 'success' : 'warning'} mt-2" onclick="seleccionarGanadorDoble('${eq1.nombre}', '${tipo}')">${eq1.nombre}</button>
        <button class="btn btn-sm btn-${tipo === 'upper' ? 'success' : 'warning'} mt-1" onclick="seleccionarGanadorDoble('${eq2.nombre}', '${tipo}')" ${eq2.nombre === 'Libre' ? 'disabled' : ''}>${eq2.nombre}</button>
        <div class="ganador-texto mt-2"></div>
      </div>
    </div>
  `;
}

window.seleccionarGanadorDoble = function(nombreGanador, tipo) {
  const lista = tipo === 'upper' ? dobleState.upper : dobleState.lower;
  const ganadores = tipo === 'upper' ? rondaGanadores : rondaPerdedores;

  // Encontrar índice del ganador y perdedor
  const eqGanador = lista.find(eq => eq.nombre === nombreGanador);
  const index = lista.indexOf(eqGanador);
  const eqPerdedor = lista[index ^ 1];

  if (!eqGanador) return;

  // Si ya había un ganador para ese partido, eliminarlo para permitir cambiar
  // Un partido está definido por el par de indices index e index^1
  const idxExistente = ganadores.findIndex(g => {
    const idxG = lista.indexOf(g);
    return idxG === index || idxG === (index ^ 1);
  });
  if (idxExistente !== -1) {
    ganadores.splice(idxExistente, 1);
  }

  ganadores.push(eqGanador);

  actualizarUIResultadosDoble(nombreGanador, eqPerdedor?.nombre);

  const totalPartidos = Math.ceil(lista.length / 2);
  if (ganadores.length === totalPartidos) {
    mostrarConfirmacionDoble(tipo, rondaGanadores, rondaPerdedores);
  }
};

function actualizarUIResultadosDoble(nombreGanador, nombrePerdedor) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const equipo1 = card.getAttribute('data-equipo1');
    const equipo2 = card.getAttribute('data-equipo2');
    if ((equipo1 === nombreGanador && equipo2 === nombrePerdedor) || (equipo2 === nombreGanador && equipo1 === nombrePerdedor)) {
      const div = card.querySelector(".ganador-texto");
      div.innerHTML = `<strong class="text-success">Ganador: ${nombreGanador}</strong>`;
    }
  });
}

function mostrarConfirmacionDoble(tipo, ganadores, perdedores) {
  const contenedor = document.getElementById('llavesContainer');
  // Remover confirmación previa si existe
  const prevConfirm = document.getElementById('confirmacionRonda');
  if (prevConfirm) prevConfirm.remove();

  contenedor.innerHTML += `
    <div class="alert alert-warning mt-3" id="confirmacionRonda">
      <h5>¿Confirmas los resultados de la ronda ${tipo === 'upper' ? dobleState.rondaUpper : dobleState.rondaLower} (${tipo === 'upper' ? 'Llave de Ganadores' : 'Llave de Perdedores'})?</h5>
      <button class="btn btn-success me-2" onclick="confirmarRonda('${tipo}')">Sí</button>
      <button class="btn btn-secondary" onclick="cancelarRonda()">Corregir</button>
    </div>
  `;
}

window.confirmarRonda = function(tipo) {
  const contenedor = document.getElementById('llavesContainer');
  document.getElementById('confirmacionRonda')?.remove();

  if (tipo === 'upper') {
    // Actualizar estados para ronda siguiente
    dobleState.upper = [...rondaGanadores];
    dobleState.lower.push(...rondaPerdedores);
    rondaGanadores = [];
    rondaPerdedores = [];
    dobleState.rondaUpper++;
    contenedor.innerHTML += renderUpperBracket();
    if (dobleState.lower.length > 1) contenedor.innerHTML += renderLowerBracket();
  } else {
    dobleState.lower = [...rondaPerdedores];
    rondaPerdedores = [];
    dobleState.rondaLower++;
    if (dobleState.lower.length === 1 && dobleState.upper.length === 1) {
      renderFinalDoble();
    } else {
      contenedor.innerHTML += renderLowerBracket();
    }
  }
};

window.cancelarRonda = function() {
  // Limpiar ganadores para que se pueda corregir
  rondaGanadores = [];
  rondaPerdedores = [];
  alert("Corrige los resultados seleccionando nuevamente al ganador correcto.");
};

function renderFinalDoble() {
  const eq1 = dobleState.upper[0];
  const eq2 = dobleState.lower[0];
  const contenedor = document.getElementById('llavesContainer');

  contenedor.innerHTML += `
    <h3 class="mt-4 text-center">🏁 Final</h3>
    <div class="card text-center p-3" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
      <strong>${eq1.nombre} (Ganadores)</strong> vs <strong>${eq2.nombre} (Perdedores)</strong><br>
      <button class="btn btn-danger mt-2" onclick="finalDobleGanador('${eq1.nombre}')">${eq1.nombre} gana</button>
      <button class="btn btn-danger mt-2" onclick="finalDobleGanador('${eq2.nombre}')">${eq2.nombre} gana</button>
      <div class="ganador-texto mt-2"></div>
    </div>
  `;

  mostrarTercerLugar();
}

function mostrarTercerLugar() {
  if (dobleState.lower.length >= 2) {
    const eq1 = dobleState.lower[dobleState.lower.length - 1];
    const eq2 = dobleState.lower[dobleState.lower.length - 2];
    const contenedor = document.getElementById('llavesContainer');

    contenedor.innerHTML += `
      <h3 class="mt-4 text-center">🏅 Partido por Tercer Lugar</h3>
      <div class="card text-center p-3" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
        <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
        <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq1.nombre}')">${eq1.nombre} gana</button>
        <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq2.nombre}')">${eq2.nombre} gana</button>
        <div class="ganador-texto mt-2"></div>
      </div>
    `;
  }
}

window.definirTercerLugar = function(nombre) {
  tercerLugarGanador = nombre;
  mostrarResultadosFinalDoble();
};

function mostrarResultadosFinalDoble() {
  const contenedor = document.getElementById('llavesContainer');
  const campeon = dobleState.campeon || 'Pendiente';
  const subcampeon = dobleState.subcampeon || 'Pendiente';

  contenedor.innerHTML += `
    <div class="alert alert-success mt-4 text-center">
      <h4>🏆 Campeón: <strong>${campeon}</strong></h4>
      <h5>🥈 Segundo lugar: <strong>${subcampeon}</strong></h5>
      <h5>🥉 Tercer lugar: <strong>${tercerLugarGanador || 'No definido'}</strong></h5>
      <button class="btn btn-primary mt-3" onclick="nuevoTorneo()">Nuevo torneo</button>
    </div>
  `;
}

window.finalDobleGanador = function(nombreGanador) {
  const eq1 = dobleState.upper[0].nombre;
  const eq2 = dobleState.lower[0].nombre;

  if (nombreGanador === eq2 && !dobleState.granFinal) {
    dobleState.granFinal = true;
    const contenedor = document.getElementById('llavesContainer');
    contenedor.innerHTML += `
      <div class="alert alert-info mt-3">¡${eq2} ganó! Se fuerza una Gran Final 🔁</div>
      <div class="card text-center p-3">
        <strong>${eq1}</strong> vs <strong>${eq2}</strong><br>
        <button class="btn btn-dark mt-2" onclick="granFinal('${eq1}')">${eq1} gana</button>
        <button class="btn btn-dark mt-2" onclick="granFinal('${eq2}')">${eq2} gana</button>
      </div>
    `;
  } else {
    dobleState.campeon = nombreGanador;
    dobleState.subcampeon = nombreGanador === eq1 ? eq2 : eq1;
    mostrarResultadosFinalDoble();
  }
};

window.granFinal = function(nombreGanador) {
  dobleState.campeon = nombreGanador;
  dobleState.subcampeon = nombreGanador === dobleState.upper[0].nombre ? dobleState.lower[0].nombre : dobleState.upper[0].nombre;
  mostrarResultadosFinalDoble();
};

function clearContenedor() {
  document.getElementById("llavesContainer").innerHTML = '';
}

window.nuevoTorneo = function() {
  dobleState = {};
  rondaGanadores = [];
  rondaPerdedores = [];
  finalGanador = null;
  finalSubcampeon = null;
  tercerLugarGanador = null;
  clearContenedor();
  alert('¡Torneo reiniciado!');
};
