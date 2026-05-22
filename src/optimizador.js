// Optimizador Inteligente con Evaluación de Orientación Óptima por Lotes
export function optimizarCortes(piezas, placaAncho, placaAlto) {
  if (piezas.length === 0) return { barrasUsadas: 0, desperdicioTotal: "0 m²", detalles: [] };

  // 1. Agrupar piezas que tengan las mismas medidas para tratarlas como un lote
  const lotes = [];
  piezas.forEach(pieza => {
    const loteExistente = lotes.find(l => 
      (l.ancho === pieza.ancho && l.alto === pieza.alto) || 
      (l.ancho === pieza.alto && l.alto === pieza.ancho)
    );
    if (loteExistente) {
      loteExistente.cantidad++;
    } else {
      lotes.push({ ancho: pieza.ancho, alto: pieza.alto, cantidad: 1 });
    }
  });

  const placas = [];

  // Desempaquetar los lotes decidiendo la mejor orientación para cada uno
  lotes.forEach(lote => {
    // Probar Orientación A (Normal)
    const cantPorFilaA = Math.floor(placaAncho / lote.ancho);
    const cantPorColA = Math.floor(placaAlto / lote.alto);
    const totalOrientacionA = cantPorFilaA * cantPorColA;

    // Probar Orientación B (Rotada)
    const cantPorFilaB = Math.floor(placaAncho / lote.alto);
    const cantPorColB = Math.floor(placaAlto / lote.ancho);
    const totalOrientacionB = cantPorFilaB * cantPorColB;

    // Elegimos la orientación que meta más piezas o que aproveche mejor el ancho
    let usarRotado = false;
    if (totalOrientacionB > totalOrientacionA) {
      usarRotado = true;
    } else if (totalOrientacionB === totalOrientacionA) {
      // Si entra la misma cantidad, preferimos la que deje menos retazo en el ancho principal
      const residuoA = placaAncho % lote.ancho;
      const residuoB = placaAncho % lote.alto;
      if (residuoB < residuoA) usarRotado = true;
    }

    const anchoFinal = usarRotado ? lote.alto : lote.ancho;
    const altoFinal = usarRotado ? lote.ancho : lote.alto;

    // Generar la lista de piezas ya orientadas de la forma más eficiente
    for (let i = 0; i < lote.cantidad; i++) {
      let ubicada = false;

      // Intentar ubicar en placas existentes
      for (let placa of placas) {
        if (acomodarEnPlaca(placa, anchoFinal, altoFinal, usarRotado)) {
          ubicada = true;
          break;
        }
      }

      // Si no entra, abrir placa nueva
      if (!ubicada) {
        const nuevaPlaca = {
          ancho: placaAncho,
          alto: placaAlto,
          piezasUbicadas: [],
          franjas: []
        };
        acomodarEnPlaca(nuevaPlaca, anchoFinal, altoFinal, usarRotado);
        placas.push(nuevaPlaca);
      }
    }
  });

  const desperdicioTotal = placas.reduce((acc, p) => {
    const areaPlaca = p.ancho * p.alto;
    const areaUtilizada = p.piezasUbicadas.reduce((sum, pz) => sum + (pz.ancho * pz.alto), 0);
    return acc + (areaPlaca - areaUtilizada);
  }, 0);

  return {
    barrasUsadas: placas.length,
    desperidcioTotal: (desperidcioTotal / 1000000).toFixed(2) + " m²",
    detalles: placas
  };
}

function acomodarEnPlaca(placa, ancho, alto, rotada) {
  // Buscar en franjas existentes de la placa
  for (let franja of placa.franjas) {
    if (alto <= franja.alto && (franja.xActual + ancho) <= placa.ancho) {
      placa.piezasUbicadas.push({
        ancho: ancho,
        alto: alto,
        x: franja.xActual,
        y: franja.y,
        rotada: rotada
      });
      franja.xActual += ancho;
      return true;
    }
  }

  // Si no cupo en ninguna franja, crear una nueva franja arriba de la última
  const ySiguiente = placa.franjas.length > 0 
    ? placa.franjas[placa.franjas.length - 1].y + placa.franjas[placa.franjas.length - 1].alto
    : 0;

  if (ySiguiente + alto <= placa.alto && ancho <= placa.ancho) {
    placa.franjas.push({ y: ySiguiente, alto: alto, xActual: ancho });
    placa.piezasUbicadas.push({
      ancho: ancho,
      alto: alto,
      x: 0,
      y: ySiguiente,
      rotada: rotada
    });
    return true;
  }

  return false;
}