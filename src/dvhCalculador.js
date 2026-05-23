// Calculador Avanzado Desglosado de DVH - Graziano Vidrios
export function calcularObraDVH(listaPaños, precioVidrioExt, precioVidrioInt, precioCamaraML) {
  let totalM2VidrioExt = 0;
  let totalM2VidrioInt = 0;
  let totalMetrosPerfil = 0;
  let totalPaños = 0;
  let costoSubtotalInsumos = 0;

  listaPaños.forEach(paño => {
    const anchoM = paño.ancho / 1000;
    const altoM = paño.alto / 1000;
    const areaPaño = anchoM * altoM;
    const perimetroPaño = (anchoM * 2) + (altoM * 2);

    // Acumuladores físicos
    totalM2VidrioExt += areaPaño * paño.cantidad;
    totalM2VidrioInt += areaPaño * paño.cantidad;
    totalMetrosPerfil += perimetroPaño * paño.cantidad;
    totalPaños += paño.cantidad;

    // Cálculo de costo base de este paño específico
    const costoVidrioExt = areaPaño * Number(precioVidrioExt);
    const costoVidrioInt = areaPaño * Number(precioVidrioInt);
    const costoCamara = perimetroPaño * Number(precioCamaraML);
    
    costoSubtotalInsumos += (costoVidrioExt + costoVidrioInt + costoCamara) * paño.cantidad;
  });

  // Aplicamos el 15% de desperdicio fijo solicitado sobre el costo de los materiales
  const factorDesperdicio = 1.15;
  const costoConDesperdicio = costoSubtotalInsumos * factorDesperdicio;

  return {
    totalPaños,
    totalM2VidrioExt: Number(totalM2VidrioExt.toFixed(2)),
    totalM2VidrioInt: Number(totalM2VidrioInt.toFixed(2)),
    totalMetrosPerfil: Number(totalMetrosPerfil.toFixed(2)),
    costoSubtotalInsumos,
    costoConDesperdicio
  };
}