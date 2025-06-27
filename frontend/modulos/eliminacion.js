let rondaActual = 1;
let equiposEnJuego = [];
let ganadoresRonda = [];
let partidosRondaActual = [];
let finalGanador = null;
let finalPerdedor = null;
let tercerLugarGanador = null;
let semifinalistasPerdedores = [];
let finalJugado = false;
let tercerLugarJugado = false;

export function generarRondaEliminacion(equipos) {
  rondaActual = 1;
  equiposEnJuego = barajarEquipos(equipos);
  ganadoresRonda = [];
  partidosRondaActual = [];
  finalGanador = null;
  finalPerdedor = null;
  tercerLugarGanador = null;
  semifinalistasPerdedores = [];
  finalJugado = false;
  tercerLugarJugado = false;
  clearContenedor();
  return renderRondaEliminacion(equiposEnJuego, rondaActual);
}

function renderRondaEliminacion(equipos, ronda) {
  partidosRondaActual = [];
  let html = `<h3>Ronda ${ronda}</h3><div class="row">`;

  for (let i = 0; i < equipos.length; i += 2) {
    const eq1 = equipos[i];
    const eq2 = equipos[i + 1] || { nombre: 'Libre', capitan: '-' };

    partidosRondaActual.push({ equipo1: eq1.nombre, equipo2: eq2.nombre, ganador: null });

    html += `
      <div class="col-md-6 mb-2">
        <div class="card p-2 text-center" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
          <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
          <br>vs<br>
          <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small><br>
          <button class="btn btn-sm btn-success mt-2" onclick="seleccionarGanador('${eq1.nombre}', ${ronda})">${eq1.nombre}</button>
          <button class="btn btn-sm btn-success mt-1" onclick="seleccionarGanador('${eq2.nombre}', ${ronda})" ${eq2.nombre === 'Libre' ? 'disabled' : ''}>${eq2.nombre}</button>
          <div class="ganador-texto mt-2"></div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

function renderFinal(eq1, eq2) {
  partidosRondaActual = [{ equipo1: eq1.nombre, equipo2: eq2.nombre, ganador: null }];
  return `
    <h3 class="mt-4 text-center">🏁 Final - Primer Lugar</h3>
    <div class="card text-center p-3" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
      <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
      <br>vs<br>
      <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small><br>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal('${eq1.nombre}', '${eq2.nombre}')">${eq1.nombre}</button>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal('${eq2.nombre}', '${eq1.nombre}')">${eq2.nombre}</button>
      <div class="ganador-texto mt-2"></div>
    </div>
  `;
}

function renderTercerLugar(eq1, eq2) {
  return `
    <h3 class="mt-4 text-light">🪖 Partido por Tercer Lugar</h3>
    <div class="card text-center p-3">
      <strong>${eq1.nombre}</strong><br><small>Capitán: ${eq1.capitan}</small>
      <br>vs<br>
      <strong>${eq2.nombre}</strong><br><small>Capitán: ${eq2.capitan}</small>
      <br>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq1.nombre}')">${eq1.nombre} gana</button>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq2.nombre}')">${eq2.nombre} gana</button>
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

window.seleccionarGanador = function(nombreGanador, ronda) {
  if (ronda !== rondaActual) return;
  const partido = partidosRondaActual.find(p => p.equipo1 === nombreGanador || p.equipo2 === nombreGanador);
  if (!partido) return;
  partido.ganador = nombreGanador;
  actualizarUIResultados();
  if (partidosRondaActual.every(p => p.ganador !== null)) mostrarResumenRonda();
};

window.seleccionarGanadorFinal = function(ganador, perdedor) {
  finalGanador = equiposEnJuego.find(eq => eq.nombre === ganador);
  finalPerdedor = equiposEnJuego.find(eq => eq.nombre === perdedor);
  partidosRondaActual[0].ganador = ganador;
  finalJugado = true;
  actualizarUIResultados();
  const [eq1, eq2] = semifinalistasPerdedores;
  document.getElementById("llavesContainer").innerHTML += renderTercerLugar(eq1, eq2);
};

window.definirTercerLugar = function(nombre) {
  tercerLugarGanador = nombre;
  tercerLugarJugado = true;
  mostrarResultadosFinal();
};

function actualizarUIResultados() {
  partidosRondaActual.forEach(({ equipo1, equipo2, ganador }) => {
    const card = document.querySelector(`.card[data-equipo1="${equipo1}"][data-equipo2="${equipo2}"]`);
    if (card) card.querySelector(".ganador-texto").innerHTML = ganador ? `<strong class="text-success">Ganador: ${ganador}</strong>` : "";
  });
}

function mostrarResumenRonda() {
  const llavesContainer = document.getElementById("llavesContainer");
  const listaResultados = partidosRondaActual.map(p => `<li>${p.equipo1} vs ${p.equipo2} → <strong>${p.ganador}</strong></li>`).join('');
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

  const ganadores = partidosRondaActual.map(p => equiposEnJuego.find(eq => eq.nombre === p.ganador));
  const perdedores = partidosRondaActual.map(p => p.equipo1 === p.ganador ? p.equipo2 : p.equipo1)
    .filter(n => n !== 'Libre').map(n => equiposEnJuego.find(eq => eq.nombre === n));

  if (ganadores.length === 2) {
    semifinalistasPerdedores = perdedores;
    equiposEnJuego = ganadores;
    document.getElementById("llavesContainer").innerHTML += renderFinal(ganadores[0], ganadores[1]);
    return;
  }

  equiposEnJuego = ganadores;
  rondaActual++;
  document.getElementById("llavesContainer").innerHTML += renderRondaEliminacion(equiposEnJuego, rondaActual);
};

window.cancelarConfirmacion = function () {
  alert("Corrige los resultados seleccionando al equipo ganador nuevamente.");
};

function mostrarResultadosFinal() {
  if (!finalJugado || !tercerLugarJugado) return;

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
  ganadoresRonda = [];
  partidosRondaActual = [];
  finalGanador = null;
  finalPerdedor = null;
  tercerLugarGanador = null;
  semifinalistasPerdedores = [];
  finalJugado = false;
  tercerLugarJugado = false;
  clearContenedor();
  alert('¡Torneo reiniciado!');
};
