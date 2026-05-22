// Optimizador Inteligente - Graziano Vidrios (Prioridad Manipulación Manual de Retazos)
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
    // Forzamos la orientación para que las piezas se acomoden optimizando el Alto (manipulación de 2500)
    const cantPorColA = Math.floor(placaAlto / lote.alto);
    const cantPorFilaA = Math.floor(placaAncho / lote.ancho);
    const totalA = cantPorColA * cantPorFilaA;

    const cantPorColB = Math.floor(placaAlto / lote.ancho);
    const cantPorFilaB = Math.floor(placaAncho / lote.alto);
    const totalB = cantPorColB * cantPorFilaB;

    let usarRotado = false;
    if (totalB > totalA) {
      usarRotado = true;
    } else if (totalB === totalA) {
      // Si entra lo mismo, preferimos la que use mejor la altura de 2500
      if ((placaAlto % lote.ancho) < (placaAlto % lote.alto)) usarRotado = true;
    }

    const anchoFinal = usarRotado ? lote.alto : lote.ancho;
    const altoFinal = usarRotado ? lote.ancho : lote.alto;

    for (let i = 0; i < lote.cantidad; i++) {
      let ubicada = false;

      for (let placa of placas) {
        if (acomodarEnPlacaVertical(placa, anchoFinal, altoFinal, usarRotado)) {
          ubicada = true;
          break;
        }
      }

      if (!ubicada) {
        const nuevaPlaca = {
          ancho: placaAncho,
          alto: placaAlto,
          piezasUbicadas: [],
          columnas: [] // Cambiamos franjas horizontales por columnas verticales
        };
        acomodarEnPlacaVertical(nuevaPlaca, anchoFinal, altoFinal, usarRotado);
        placas.push(nuevaPlaca);
      }
    }
  });

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

function acomodarEnPlacaVertical(placa, ancho, alto, rotada) {
  // Buscar en columnas verticales existentes
  for (let col of placa.columnas) {
    if (ancho <= col.ancho && (col.yActual + alto) <= placa.alto) {
      placa.piezasUbicadas.push({
        ancho: ancho,
        alto: alto,
        x: col.x,
        y: col.yActual,
        rotada: rotada
      });
      col.yActual += alto;
      return true;
    }
  }

  // Crear una nueva columna hacia la derecha si no entra en las anteriores
  const xSiguiente = placa.columnas.length > 0 
    ? placa.columnas[placa.columnas.length - 1].x + placa.columnas[placa.columnas.length - 1].ancho
    : 0;

  if (xSiguiente + ancho <= placa.ancho && alto <= placa.alto) {
    placa.columnas.push({ x: xSiguiente, ancho: ancho, yActual: alto });
    placa.piezasUbicadas.push({
      ancho: ancho,
      alto: alto,
      x: xSiguiente,
      y: 0,
      rotada: rotada
    });
    return true;
  }

  return false;
}