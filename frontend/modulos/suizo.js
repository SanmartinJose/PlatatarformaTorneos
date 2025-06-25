// suizo.js - Lógica para torneo de formato suizo

let suizaEquipos = [];
let suizaHistorial = [];
let rondaSuizaActual = 1;
let TOTAL_RONDAS_SUIZAS = 3;
let resultadosRondaActual = [];

export function iniciarRondaSuiza(equipos) {
  const input = document.getElementById("numRondas");
  TOTAL_RONDAS_SUIZAS = parseInt(input?.value || 3);

  suizaEquipos = equipos.map(e => ({
    ...e,
    puntos: 0,
    oponentes: []
  }));

  suizaHistorial = [];
  rondaSuizaActual = 1;
  resultadosRondaActual = [];

  return renderRondaSuiza();
}

function renderRondaSuiza() {
  let emparejamientos = generarEmparejamientosSuizos();
  let html = `<h3>Ronda Suiza ${rondaSuizaActual} / ${TOTAL_RONDAS_SUIZAS}</h3><div class="row">`;

  emparejamientos.forEach((par, index) => {
    html += `
      <div class="col-md-6 mb-2">
        <div class="card p-2 text-center">
          <strong>${par[0].nombre}</strong> vs <strong>${par[1].nombre}</strong><br>
          <button class="btn btn-sm btn-primary mt-2" onclick="seleccionarGanadorSuizo('${par[0].nombre}', '${par[1].nombre}')">${par[0].nombre}</button>
          <button class="btn btn-sm btn-primary mt-1" onclick="seleccionarGanadorSuizo('${par[1].nombre}', '${par[0].nombre}')">${par[1].nombre}</button>
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

function generarEmparejamientosSuizos() {
  let ordenados = [...suizaEquipos].sort((a, b) => b.puntos - a.puntos);
  const emparejamientos = [];

  while (ordenados.length > 1) {
    const eq1 = ordenados.shift();
    let index = ordenados.findIndex(eq => !eq1.oponentes.includes(eq.nombre));

    if (index === -1) index = 0;

    const eq2 = ordenados.splice(index, 1)[0];
    emparejamientos.push([eq1, eq2]);
  }

  return emparejamientos;
}

window.seleccionarGanadorSuizo = function(nombreGanador, nombrePerdedor) {
  const yaRegistrado = resultadosRondaActual.find(
    r => (r.equipo1 === nombreGanador && r.equipo2 === nombrePerdedor) ||
         (r.equipo1 === nombrePerdedor && r.equipo2 === nombreGanador)
  );

  if (yaRegistrado) {
    if (yaRegistrado.ganador === nombreGanador) return;

    const anteriorGanador = suizaEquipos.find(eq => eq.nombre === yaRegistrado.ganador);
    anteriorGanador.puntos -= 1;

    const nuevoGanador = suizaEquipos.find(eq => eq.nombre === nombreGanador);
    nuevoGanador.puntos += 1;

    yaRegistrado.ganador = nombreGanador;
    actualizarGanadorUI(nombreGanador, nombrePerdedor);
    return;
  }

  const eqGanador = suizaEquipos.find(eq => eq.nombre === nombreGanador);
  const eqPerdedor = suizaEquipos.find(eq => eq.nombre === nombrePerdedor);

  eqGanador.puntos += 1;
  eqGanador.oponentes.push(eqPerdedor.nombre);
  eqPerdedor.oponentes.push(eqGanador.nombre);

  suizaHistorial.push({
    equipo1: eqGanador.nombre,
    equipo2: eqPerdedor.nombre,
    ronda: rondaSuizaActual,
    ganador: eqGanador.nombre
  });

  resultadosRondaActual.push({
    equipo1: eqGanador.nombre,
    equipo2: eqPerdedor.nombre,
    ganador: eqGanador.nombre
  });

  actualizarGanadorUI(nombreGanador, nombrePerdedor);

  const totalPartidos = Math.floor(suizaEquipos.length / 2);
  if (resultadosRondaActual.length === totalPartidos) mostrarResumenRonda();
};

function actualizarGanadorUI(nombreGanador, nombrePerdedor) {
  document.querySelectorAll(`.card:has(button[onclick*="${nombreGanador}"])`).forEach(card => {
    card.querySelectorAll("div.mt-2").forEach(div => div.remove());
    card.innerHTML += `<div class="text-success mt-2"><strong>Ganador: ${nombreGanador}</strong></div>`;
  });

  document.querySelectorAll(`.card:has(button[onclick*="${nombrePerdedor}"])`).forEach(card => {
    if (!card.innerHTML.includes(nombreGanador)) {
      card.querySelectorAll("div.mt-2").forEach(div => div.remove());
    }
  });
}

function mostrarResumenRonda() {
  let html = `<div class="alert alert-warning mt-4">
    <h5>¿Resultados correctos?</h5>
    <ul>
      ${resultadosRondaActual.map(r => `<li>${r.equipo1} vs ${r.equipo2} → Ganador: <strong>${r.ganador}</strong></li>`).join('')}
    </ul>
    <button class="btn btn-success me-2" onclick="confirmarResultados()">Aceptar y generar siguiente ronda</button>
    <button class="btn btn-secondary" onclick="cancelarConfirmacion()">Cancelar</button>
  </div>`;

  document.getElementById('llavesContainer').innerHTML += html;
  renderTablaPosiciones();
}

window.confirmarResultados = function() {
  rondaSuizaActual++;
  resultadosRondaActual = [];

  if (rondaSuizaActual > TOTAL_RONDAS_SUIZAS) {
    mostrarGanadorSuizo();
    return;
  }

  document.getElementById('llavesContainer').innerHTML += renderRondaSuiza();
};

window.cancelarConfirmacion = function() {
  alert("Corrige los resultados manualmente haciendo clic en otro ganador.");
};

function renderTablaPosiciones() {
  const ordenados = [...suizaEquipos].sort((a, b) => b.puntos - a.puntos);
  const html = `
    <h5 class="mt-4">Tabla de Posiciones</h5>
    <table class="table table-striped">
      <thead>
        <tr><th>#</th><th>Equipo</th><th>Puntos</th></tr>
      </thead>
      <tbody>
        ${ordenados.map((eq, i) => `<tr><td>${i + 1}</td><td>${eq.nombre}</td><td>${eq.puntos}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('llavesContainer').innerHTML += html;
}

function mostrarGanadorSuizo() {
  const ordenados = [...suizaEquipos].sort((a, b) => b.puntos - a.puntos);
  const campeon = ordenados[0];
  const subcampeon = ordenados[1];
  const tercero = ordenados[2];

  const html = `
    <div class="mt-4">
      <h4 class="text-success">🏆 Campeón: ${campeon.nombre}</h4>
      <h5 class="text-primary">🥈 Segundo lugar: ${subcampeon?.nombre || '-'}</h5>
      <h6 class="text-secondary">🥉 Tercer lugar: ${tercero?.nombre || '-'}</h6>
    </div>
  `;
  document.getElementById('llavesContainer').innerHTML += html;
}
