let rondaActual = 1;
let equiposEnJuego = [];
let partidosRondaActual = [];
let semifinalistasPerdedores = [];
let finalJugado = false;
let tercerLugarJugado = false;
let finalGanador = null;
let finalPerdedor = null;
let tercerLugarGanador = null;

export function generarRondaEliminacion(equipos) {
  // Siempre filtrar equipos válidos por si acaso
  equipos = equipos.filter(eq => eq && eq.nombre && eq.capitan);
  rondaActual = 1;
  equiposEnJuego = barajarEquipos(equipos.map((eq, i) => ({ ...eq, id: i })));
  semifinalistasPerdedores = [];
  finalJugado = false;
  tercerLugarJugado = false;
  finalGanador = null;
  finalPerdedor = null;
  tercerLugarGanador = null;
  clearContenedor();
  renderRondaEliminacion(equiposEnJuego, rondaActual);
  return document.getElementById("llavesContainer").innerHTML; // Retorna el HTML generado
}

function renderRondaEliminacion(equipos, ronda) {
  partidosRondaActual = [];
  clearContenedor();

  let html = `<h3>Ronda ${ronda}</h3><div class="row">`;

  for (let i = 0; i < equipos.length; i += 2) {
    const eq1 = equipos[i];
    const eq2 = equipos[i + 1] || { nombre: 'Libre', capitan: '-', id: 'libre' };

    partidosRondaActual.push({ equipo1: eq1, equipo2: eq2, ganador: null });

    html += `
      <div class="col-md-6 mb-2">
        <div class="card p-2 text-center" data-id1="${eq1.id}" data-id2="${eq2.id}">
          <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
          <br>vs<br>
          <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small><br>
          <button class="btn btn-sm btn-success mt-2" onclick="seleccionarGanador(${eq1.id}, ${ronda})">${eq1.nombre}</button>
          <button class="btn btn-sm btn-success mt-1" onclick="seleccionarGanador(${eq2.id}, ${ronda})" ${eq2.id === 'libre' ? 'disabled' : ''}>${eq2.nombre}</button>
          <div class="ganador-texto mt-2"></div>
        </div>
      </div>
    `;
  }
  html += `</div>`;
  document.getElementById("llavesContainer").innerHTML = html;
}

function renderFinal(eq1, eq2) {
  partidosRondaActual = [{ equipo1: eq1, equipo2: eq2, ganador: null }];
  clearContenedor();
  document.getElementById("llavesContainer").innerHTML = `
    <h3 class="mt-4 text-center">🏁 Final - Primer Lugar</h3>
    <div class="card text-center p-3" data-id1="${eq1.id}" data-id2="${eq2.id}">
      <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
      <br>vs<br>
      <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small><br>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal(${eq1.id}, ${eq2.id})">${eq1.nombre}</button>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal(${eq2.id}, ${eq1.id})">${eq2.nombre}</button>
      <div class="ganador-texto mt-2"></div>
    </div>
  `;
}

function renderTercerLugar(eq1, eq2) {
  document.getElementById("llavesContainer").innerHTML += `
    <h3 class="mt-4 text-light">🪖 Partido por Tercer Lugar</h3>
    <div class="card text-center p-3">
      <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
      <br>vs<br>
      <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small>
      <br>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar(${eq1.id})">${eq1.nombre} gana</button>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar(${eq2.id})">${eq2.nombre} gana</button>
    </div>
  `;
}

function barajarEquipos(equipos) {
  const array = [...equipos];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.seleccionarGanador = function(idGanador, ronda) {
  if (ronda !== rondaActual) return;
  const partido = partidosRondaActual.find(p => p.equipo1.id === idGanador || p.equipo2.id === idGanador);
  if (!partido) return;
  partido.ganador = idGanador;
  actualizarUIResultados();
  if (partidosRondaActual.every(p => p.ganador !== null)) mostrarResumenRonda();
};

window.seleccionarGanadorFinal = function(idGanador, idPerdedor) {
  finalGanador = equiposEnJuego.find(eq => eq.id === idGanador);
  finalPerdedor = equiposEnJuego.find(eq => eq.id === idPerdedor);
  partidosRondaActual[0].ganador = idGanador;
  finalJugado = true;
  actualizarUIResultados();
  if (semifinalistasPerdedores.length === 2) {
    renderTercerLugar(semifinalistasPerdedores[0], semifinalistasPerdedores[1]);
  } else {
    tercerLugarGanador = null;
    tercerLugarJugado = true;
    mostrarResultadosFinal();
  }
};

window.definirTercerLugar = function(idGanador) {
  const equipo = semifinalistasPerdedores.find(eq => eq.id === idGanador);
  tercerLugarGanador = equipo?.nombre || 'No definido';
  tercerLugarJugado = true;
  mostrarResultadosFinal();
};

function actualizarUIResultados() {
  partidosRondaActual.forEach(({ equipo1, equipo2, ganador }) => {
    const card = document.querySelector(`.card[data-id1="${equipo1.id}"][data-id2="${equipo2.id}"]`);
    if (card) {
      let nombreGanador = ganador
        ? [equipo1, equipo2].find(eq => eq.id === ganador)?.nombre || ''
        : '';
      card.querySelector(".ganador-texto").innerHTML = ganador ? `<strong class="text-success">Ganador: ${nombreGanador}</strong>` : "";
    }
  });
}

function mostrarResumenRonda() {
  const llavesContainer = document.getElementById("llavesContainer");
  const listaResultados = partidosRondaActual.map(p =>
    `<li>${p.equipo1.nombre} vs ${p.equipo2.nombre} → <strong>${
      [p.equipo1, p.equipo2].find(eq => eq.id === p.ganador)?.nombre || ''
    }</strong></li>`
  ).join('');
  const html = `
    <div class="alert alert-warning mt-4" id="resumenRonda">
      <h5>¿Resultados correctos para la Ronda ${rondaActual}?</h5>
      <ul>${listaResultados}</ul>
      <button class="btn btn-success me-2" onclick="confirmarSiguienteRonda()">Aceptar y generar siguiente ronda</button>
      <button class="btn btn-secondary" onclick="cancelarConfirmacion()">Corregir resultados</button>
    </div>
  `;
  llavesContainer.insertAdjacentHTML("beforeend", html);
}

window.confirmarSiguienteRonda = function () {
  document.getElementById("resumenRonda")?.remove();

  const ganadores = partidosRondaActual.map(p => [p.equipo1, p.equipo2].find(eq => eq.id === p.ganador));
  const perdedores = partidosRondaActual.map(p => [p.equipo1, p.equipo2].find(eq => eq.id !== p.ganador && eq.nombre !== 'Libre'))
    .filter(Boolean);

  // SEMIFINAL: Solo si quedan 4 equipos (dos partidos), hay tercer lugar
  if (ganadores.length === 2 && equiposEnJuego.length === 4) {
    semifinalistasPerdedores = perdedores;
    equiposEnJuego = ganadores;
    renderFinal(ganadores[0], ganadores[1]);
    return;
  }

  // FINAL: Solo si quedan 2 equipos, o por "bye"
  if (ganadores.length === 1 || (ganadores.length === 2 && equiposEnJuego.length === 2)) {
    finalGanador = ganadores[0];
    finalPerdedor = perdedores[0] || ganadores[1];
    finalJugado = true;
    if (semifinalistasPerdedores.length === 2) {
      renderTercerLugar(semifinalistasPerdedores[0], semifinalistasPerdedores[1]);
    } else {
      tercerLugarGanador = null;
      tercerLugarJugado = true;
      mostrarResultadosFinal();
    }
    return;
  }

  equiposEnJuego = ganadores;
  rondaActual++;
  renderRondaEliminacion(equiposEnJuego, rondaActual);
};

window.cancelarConfirmacion = function () {
  alert("Corrige los resultados seleccionando al equipo ganador nuevamente.");
};

function mostrarResultadosFinal() {
  if (!finalJugado || (semifinalistasPerdedores.length === 2 && !tercerLugarJugado)) return;

  const llavesContainer = document.getElementById("llavesContainer");
  llavesContainer.innerHTML += `
    <div class="alert alert-success mt-4 text-center">
      <h4>🏆 Campeón: <strong>${finalGanador?.nombre || '?'}</strong></h4>
      <h5>🥈 Segundo lugar: <strong>${finalPerdedor?.nombre || '?'}</strong></h5>
      <h5>🥉 Tercer lugar: <strong>${tercerLugarGanador || 'No definido'}</strong></h5>
      <button class="btn btn-primary mt-3" onclick="nuevoTorneo()">Nuevo torneo</button>
    </div>
  `;
}

function clearContenedor() {
  document.getElementById("llavesContainer").innerHTML = '';
}

window.nuevoTorneo = function () {
  rondaActual = 1;
  equiposEnJuego = [];
  partidosRondaActual = [];
  semifinalistasPerdedores = [];
  finalJugado = false;
  tercerLugarJugado = false;
  finalGanador = null;
  finalPerdedor = null;
  tercerLugarGanador = null;
  clearContenedor();
  alert('¡Torneo reiniciado!');
};
