// Optimizador Inteligente Definitivo - Graziano Vidrios (Versión Final Sin Errores)
export function optimizarCortes(piezas, placaAncho, placaAlto) {
  if (piezas.length === 0) return { barrasUsadas: 0, desperdicioTotal: "0% (0.00 m²)", detalles: [] };

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

  lotes.forEach(lote => {
    const cantPorFilaA = Math.floor(placaAncho / lote.ancho);
    const cantPorColA = Math.floor(placaAlto / lote.alto);
    const totalA = cantPorFilaA * cantPorColA;

    const cantPorFilaB = Math.floor(placaAncho / lote.alto);
    const cantPorColB = Math.floor(placaAlto / lote.ancho);
    const totalB = cantPorFilaB * cantPorColB;

    let usarRotado = false;
    if (totalB > totalA) {
      usarRotado = true;
    } else if (totalB === totalA) {
      if ((placaAncho % lote.alto) < (placaAncho % lote.ancho)) usarRotado = true;
    }

    const anchoFinal = usarRotado ? lote.alto : lote.ancho;
    const altoFinal = usarRotado ? lote.ancho : lote.alto;

    // AQUÍ ESTÁ CORREGIDO: Usamos lote.cantidad estrictamente
    for (let i = 0; i < lote.cantidad; i++) {
      let ubicada = false;

      for (let placa of placas) {
        if (acomodarEnPlaca(placa, anchoFinal, altoFinal, usarRotado)) {
          ubicada = true;
          break;
        }
      }

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

  // Cuenta matemática exacta del desperdicio
  const areaPlacaTotal = placas.length * (placaAncho * placaAlto);
  const areaUtilizadaTotal = placas.reduce((acc, p) => {
    return acc + p.piezasUbicadas.reduce((sum, pz) => sum + (pz.ancho * pz.alto), 0);
  }, 0);
  
  const areaDesperdicio = areaPlacaTotal - areaUtilizadaTotal;
  const porcentajeDesperdicio = ((areaDesperdicio / areaPlacaTotal) * 100).toFixed(1);
  const metrosDesperdicio = (areaDesperdicio / 1000000).toFixed(2);

  return {
    barrasUsadas: placas.length,
    desperdicioTotal: `${porcentajeDesperdicio}% (${metrosDesperdicio} m²)`,
    detalles: placas
  };
}

function acomodarEnPlaca(placa, ancho, alto, rotada) {
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