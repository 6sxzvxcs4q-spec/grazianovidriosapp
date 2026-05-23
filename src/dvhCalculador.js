// Calculador de Componentes de DVH - Graziano Vidrios
export function calcularObraDVH(listaPaños) {
  let totalM2Vidrio = 0; // Suma de todos los m² de vidrio (exterior + interior)
  let totalMetrosPerfil = 0; // Perímetro total de aluminio
  let totalPaños = 0;

  listaPaños.forEach(paño => {
    const anchoM = paño.ancho / 1000;
    const altoM = paño.alto / 1000;
    const areaPaño = anchoM * altoM;
    const perimetroPaño = (anchoM * 2) + (altoM * 2);

    // Cada paño lleva 2 vidrios (exterior e interior)
    totalM2Vidrio += (areaPaño * 2) * paño.cantidad;
    totalMetrosPerfil += perimetroPaño * paño.cantidad;
    totalPaños += paño.cantidad;
  });

  return {
    totalPaños,
    totalM2Vidrio: Number(totalM2Vidrio.toFixed(2)),
    totalMetrosPerfil: Number(totalMetrosPerfil.toFixed(2))
  };
}