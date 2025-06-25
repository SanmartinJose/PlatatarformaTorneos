// doble.js - Módulo para lógica de eliminación doble

let dobleState = {};
let rondaGanadores = [], rondaPerdedores = [];

export function iniciarDobleEliminacion(equipos) {
  dobleState = {
    upper: barajarEquipos(equipos),
    lower: [],
    rondaUpper: 1,
    rondaLower: 1,
  };
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
  return `
    <div class="col-md-6 mb-2">
      <div class="card p-2 text-center">
        <strong>${eq1.nombre}</strong> vs <strong>${eq2.nombre}</strong><br>
        <button class="btn btn-sm btn-${tipo === 'upper' ? 'success' : 'warning'} mt-2" onclick="seleccionarGanadorDoble('${eq1.nombre}', '${tipo}')">${eq1.nombre}</button>
        <button class="btn btn-sm btn-${tipo === 'upper' ? 'success' : 'warning'} mt-1" onclick="seleccionarGanadorDoble('${eq2.nombre}', '${tipo}')" ${eq2.nombre === 'Libre' ? 'disabled' : ''}>${eq2.nombre}</button>
      </div>
    </div>
  `;
}

window.seleccionarGanadorDoble = function (nombreGanador, tipo) {
  const lista = tipo === 'upper' ? dobleState.upper : dobleState.lower;
  const ganadores = tipo === 'upper' ? rondaGanadores : rondaPerdedores;
  const perdedores = [];

  const eqGanador = lista.find(eq => eq.nombre === nombreGanador);
  const index = lista.indexOf(eqGanador);
  const eqPerdedor = lista[index ^ 1];

  if (!eqGanador || ganadores.some(eq => eq.nombre === eqGanador.nombre)) return;

  ganadores.push(eqGanador);
  if (eqPerdedor && eqPerdedor.nombre !== 'Libre') perdedores.push(eqPerdedor);

  resaltarGanadorUI(nombreGanador, eqPerdedor.nombre);

  const totalPartidos = Math.ceil(lista.length / 2);
  if (ganadores.length === totalPartidos) {
    if (tipo === 'upper') {
      dobleState.upper = rondaGanadores;
      dobleState.lower.push(...perdedores);
      rondaGanadores = [];
      dobleState.rondaUpper++;
      setTimeout(() => document.getElementById('llavesContainer').innerHTML += renderUpperBracket(), 1000);

      if (perdedores.length > 0 && dobleState.rondaLower === 1) {
        setTimeout(() => document.getElementById('llavesContainer').innerHTML += renderLowerBracket(), 1000);
      }

    } else {
      dobleState.lower = rondaPerdedores;
      rondaPerdedores = [];
      dobleState.rondaLower++;

      if (dobleState.lower.length === 1 && dobleState.upper.length === 1) {
        renderFinal();
      } else {
        setTimeout(() => document.getElementById('llavesContainer').innerHTML += renderLowerBracket(), 1000);
      }
    }
  }
};

function renderFinal() {
  const eq1 = dobleState.upper[0];
  const eq2 = dobleState.lower[0];

  const html = `
    <h3 class="mt-4 text-center">🏁 Final</h3>
    <div class="card text-center p-3">
      <strong>${eq1.nombre} (Ganadores)</strong> vs <strong>${eq2.nombre} (Perdedores)</strong><br>
      <button class="btn btn-danger mt-2" onclick="finalDobleGanador('${eq1.nombre}')">${eq1.nombre} gana</button>
      <button class="btn btn-danger mt-2" onclick="finalDobleGanador('${eq2.nombre}')">${eq2.nombre} gana</button>
    </div>
  `;
  document.getElementById('llavesContainer').innerHTML += html;
}

window.finalDobleGanador = function(nombreGanador) {
  const eq1 = dobleState.upper[0].nombre;
  const eq2 = dobleState.lower[0].nombre;

  if (nombreGanador === eq2) {
    document.getElementById('llavesContainer').innerHTML += `
      <div class="alert alert-info mt-3">¡${eq2} ganó! Se fuerza una Gran Final 🔁</div>
      <div class="card text-center p-3">
        <strong>${eq1}</strong> vs <strong>${eq2}</strong><br>
        <button class="btn btn-dark mt-2" onclick="granFinal('${eq1}')">${eq1} gana</button>
        <button class="btn btn-dark mt-2" onclick="granFinal('${eq2}')">${eq2} gana</button>
      </div>
    `;
  } else {
    document.getElementById('llavesContainer').innerHTML += `<h4 class="text-success mt-4">🏆 Campeón: ${nombreGanador}</h4>`;
  }
};

window.granFinal = function(nombreGanador) {
  document.getElementById('llavesContainer').innerHTML += `<h4 class="text-success mt-4">🏆 Campeón: ${nombreGanador}</h4>`;
};
