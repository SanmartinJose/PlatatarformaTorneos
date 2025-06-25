let rondaActual = 1;
let equiposEnJuego = [];
let ganadoresRonda = [];
let perdedoresRonda = [];
let partidosRondaActual = [];

let tercerLugarGanador = null;
let finalGanador = null;
let finalPerdedor = null;
let enFinal = false;
let partidoTercerLugarJugado = false;

export function generarRondaEliminacion(equipos) {
  rondaActual = 1;
  equiposEnJuego = barajarEquipos(equipos);
  ganadoresRonda = [];
  perdedoresRonda = [];
  partidosRondaActual = [];
  tercerLugarGanador = null;
  finalGanador = null;
  finalPerdedor = null;
  enFinal = false;
  partidoTercerLugarJugado = false;
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
          <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
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
  // Partido final por el primer lugar
  partidosRondaActual = [{ equipo1: eq1.nombre, equipo2: eq2.nombre, ganador: null }]; // reiniciar resultados ronda final

  return `
    <h3 class="mt-4 text-center">🏁 Final - Primer Lugar</h3>
    <div class="card text-center p-3" data-equipo1="${eq1.nombre}" data-equipo2="${eq2.nombre}">
      <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal('${eq1.nombre}')">${eq1.nombre}</button>
      <button class="btn btn-danger mt-2" onclick="seleccionarGanadorFinal('${eq2.nombre}')">${eq2.nombre}</button>
      <div class="ganador-texto mt-2"></div>
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

  const partido = partidosRondaActual.find(p =>
    (p.equipo1 === nombreGanador || p.equipo2 === nombreGanador)
  );

  if (!partido) {
    alert("Partido no encontrado o resultado ya confirmado.");
    return;
  }

  partido.ganador = nombreGanador;

  actualizarGanadoresYPerdedores();

  actualizarUIResultados();

  if (partidosRondaActual.every(p => p.ganador !== null)) {
    mostrarResumenRonda();
  }
};

window.seleccionarGanadorFinal = function(nombreGanador) {
  const partido = partidosRondaActual[0];
  partido.ganador = nombreGanador;

  // Determinar ganador y perdedor
  finalGanador = equiposEnJuego.find(eq => eq.nombre === nombreGanador);
  const perdedorNombre = (partido.equipo1 === nombreGanador) ? partido.equipo2 : partido.equipo1;
  finalPerdedor = equiposEnJuego.find(eq => eq.nombre === perdedorNombre);

  // Actualizar UI
  const card = document.querySelector(`.card[data-equipo1="${partido.equipo1}"][data-equipo2="${partido.equipo2}"]`);
  if (card) {
    const divGanadorTexto = card.querySelector('.ganador-texto');
    divGanadorTexto.innerHTML = `<strong class="text-success">Ganador: ${nombreGanador}</strong>`;
  }

  mostrarResultadosFinal();
};

function actualizarGanadoresYPerdedores() {
  ganadoresRonda = [];
  perdedoresRonda = [];
  partidosRondaActual.forEach(({ equipo1, equipo2, ganador }) => {
    if (!ganador) return;
    const ganadorObj = equiposEnJuego.find(eq => eq.nombre === ganador);
    ganadoresRonda.push(ganadorObj);
    const perdedorNombre = (equipo1 === ganador) ? equipo2 : equipo1;
    if (perdedorNombre !== 'Libre') {
      const perdedorObj = equiposEnJuego.find(eq => eq.nombre === perdedorNombre);
      perdedoresRonda.push(perdedorObj);
    }
  });
}

function actualizarUIResultados() {
  partidosRondaActual.forEach(({ equipo1, equipo2, ganador }) => {
    const card = document.querySelector(`.card[data-equipo1="${equipo1}"][data-equipo2="${equipo2}"]`);
    if (!card) return;
    const divGanadorTexto = card.querySelector('.ganador-texto');
    if (ganador) {
      divGanadorTexto.innerHTML = `<strong class="text-success">Ganador: ${ganador}</strong>`;
    } else {
      divGanadorTexto.innerHTML = '';
    }
  });
}

function mostrarResumenRonda() {
  const llavesContainer = document.getElementById('llavesContainer');
  const resumenExistente = document.getElementById('resumenRonda');
  if (resumenExistente) resumenExistente.remove();

  const listaResultados = partidosRondaActual.map(p =>
    `<li>${p.equipo1} vs ${p.equipo2} → <strong>${p.ganador}</strong></li>`
  ).join('');

  const htmlResumen = `
    <div id="resumenRonda" class="alert alert-warning mt-4">
      <h5>¿Resultados correctos para la Ronda ${rondaActual}?</h5>
      <ul>${listaResultados}</ul>
      <button class="btn btn-success me-2" onclick="confirmarSiguienteRonda()">Aceptar y generar siguiente ronda</button>
      <button class="btn btn-secondary" onclick="cancelarConfirmacion()">Corregir resultados</button>
    </div>
  `;

  llavesContainer.insertAdjacentHTML('beforeend', htmlResumen);
}

window.confirmarSiguienteRonda = function() {
  const llavesContainer = document.getElementById('llavesContainer');
  const resumen = document.getElementById('resumenRonda');
  if (resumen) resumen.remove();

  // Si estamos en la final, no hay siguiente ronda, solo mostrar resultados
  if (enFinal) {
    // Ya se determinó finalGanador y finalPerdedor en seleccionarGanadorFinal
    // Mostrar resultados finales
    mostrarResultadosFinal();
    return;
  }

  // Si quedan 4 equipos y no se ha jugado partido por 3er lugar
  if (equiposEnJuego.length === 4 && !partidoTercerLugarJugado) {
    partidoTercerLugarJugado = true;
    generarTercerCuartoLugar(perdedoresRonda);
    return;
  }

  equiposEnJuego = ganadoresRonda;
  ganadoresRonda = [];
  perdedoresRonda = [];
  rondaActual++;

  if (equiposEnJuego.length === 2) {
    enFinal = true;
    llavesContainer.innerHTML += renderFinal(equiposEnJuego[0], equiposEnJuego[1]);
  } else {
    setTimeout(() => {
      const htmlNuevaRonda = renderRondaEliminacion(equiposEnJuego, rondaActual);
      llavesContainer.innerHTML += htmlNuevaRonda;
    }, 500);
  }
};

window.cancelarConfirmacion = function() {
  alert('Corrige los resultados haciendo clic en el equipo ganador correcto.');
};

function generarTercerCuartoLugar(perdedores) {
  const [eq1, eq2] = perdedores;
  const llavesContainer = document.getElementById('llavesContainer');

  const html = `
    <h3 class="mt-4 text-center">🏅 Partido por Tercer Lugar</h3>
    <div class="card text-center p-3">
      <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq1.nombre}')">${eq1.nombre} gana</button>
      <button class="btn btn-info mt-2" onclick="definirTercerLugar('${eq2.nombre}')">${eq2.nombre} gana</button>
    </div>
  `;
  llavesContainer.innerHTML += html;
}

window.definirTercerLugar = function(nombre) {
  tercerLugarGanador = nombre;

  const llavesContainer = document.getElementById('llavesContainer');

  llavesContainer.innerHTML += `
    <div class="alert alert-info mt-2">🥉 Tercer lugar: <strong>${nombre}</strong></div>
    <button class="btn btn-primary mt-3" onclick="nuevoTorneo()">Nuevo torneo</button>
  `;

  if (finalGanador && finalPerdedor) {
    mostrarResultadosFinal();
  }
};

function mostrarResultadosFinal() {
  const llavesContainer = document.getElementById('llavesContainer');

  llavesContainer.innerHTML += `
    <div class="alert alert-success mt-4 text-center">
      <h4>🏆 Campeón: <strong>${finalGanador.nombre}</strong></h4>
      <h5>🥈 Segundo lugar: <strong>${finalPerdedor.nombre}</strong></h5>
      <h5>🥉 Tercer lugar: <strong>${tercerLugarGanador || 'No definido'}</strong></h5>
      <button class="btn btn-primary mt-3" onclick="nuevoTorneo()">Nuevo torneo</button>
    </div>
  `;
}

function clearContenedor() {
  const cont = document.getElementById('llavesContainer');
  cont.innerHTML = '';
}

window.nuevoTorneo = function() {
  rondaActual = 1;
  equiposEnJuego = [];
  ganadoresRonda = [];
  perdedoresRonda = [];
  partidosRondaActual = [];
  tercerLugarGanador = null;
  finalGanador = null;
  finalPerdedor = null;
  enFinal = false;
  partidoTercerLugarJugado = false;

  clearContenedor();

  alert('¡Torneo reiniciado! Por favor configura un nuevo torneo.');
};
