function generarEliminacionDirecta(equipos) {
  const partidos = [];
  let ronda = 1;
  while (equipos.length > 1) {
    const rondaActual = [];
    for (let i = 0; i < equipos.length; i += 2) {
      rondaActual.push({
        id: `R${ronda}-M${i / 2}`,
        equipo1: equipos[i],
        equipo2: equipos[i + 1] || null,
        ganador: null,
      });
    }
    partidos.push(rondaActual);
    equipos = rondaActual.map(p => null); // Se llenará con ganadores
    ronda++;
  }
  return partidos;
}

module.exports = {
  generarEliminacionDirecta,
};
