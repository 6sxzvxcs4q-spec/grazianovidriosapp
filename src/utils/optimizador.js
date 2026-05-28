// Algoritmo de Distribución por Filas Continuas (Mesa de Corte - Graziano Vidrios)
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  let todosPaños = [];
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      let w = Number(p.ancho);
      let h = Number(p.alto);
      // Orientación base: siempre acostados para estandarizar la entrada de la grilla
      if (w < h) {
        let aux = w;
        w = h;
        h = aux;
      }
      todosPaños.push({ id: `${p.id}-${i}`, ancho: w, alto: h, rotado: false });
    }
  });

  // Ordenamos de mayor a menor altura para que las hileras aprovechen el vidrio a lo ancho
  todosPaños.sort((a, b) => b.alto - a.alto);

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    for (let hoja of hojas) {
      // 1. Intentar meter en alguna fila ya creada de esta hoja
      for (let fila of hoja.filas) {
        if (fila.anchoUsado + paño.ancho <= HOJA_ANCHO && fila.y + paño.alto <= HOJA_ALTO) {
          hoja.paños.push({
            ancho: paño.ancho,
            alto: paño.alto,
            x: fila.anchoUsado,
            y: fila.y,
            rotado: false
          });
          fila.anchoUsado += paño.ancho;
          if (paño.alto > fila.altoMaximo) fila.altoMaximo = paño.alto;
          hoja.areaUsada += (paño.ancho * paño.alto);
          acomodado = true;
          break;
        }
      }

      // 2. Si no entró en las filas de esta hoja, probar crear una fila nueva arriba
      if (!acomodado) {
        let ultimaFila = hoja.filas[hoja.filas.length - 1];
        let nuevoY = ultimaFila.y + ultimaFila.altoMaximo;

        if (nuevoY + paño.alto <= HOJA_ALTO && paño.ancho <= HOJA_ANCHO) {
          hoja.filas.push({
            y: nuevoY,
            anchoUsado: paño.ancho,
            altoMaximo: paño.alto
          });
          hoja.paños.push({
            ancho: paño.ancho,
            alto: paño.alto,
            x: 0,
            y: nuevoY,
            rotado: false
          });
          hoja.areaUsada += (paño.ancho * paño.alto);
          acomodado = true;
          break;
        }
      }
    }

    // 3. Si no entró de ninguna forma, abrimos otra plancha de 3600x2500
    if (!acomodado) {
      hojas.push({
        areaUsada: paño.ancho * paño.alto,
        filas: [{ y: 0, anchoUsado: paño.ancho, altoMaximo: paño.alto }],
        paños: [{ ancho: paño.ancho, alto: paño.alto, x: 0, y: 0, rotado: false }]
      });
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}

// Calculador de DVH
export function calcularObraDVH(listaPaños, precioVidrioExt, precioVidrioInt, precioCamaraML, porcentajeDesperdicio = 15) {
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

    totalM2VidrioExt += (areaPaño * paño.cantidad);
    totalM2VidrioInt += (areaPaño * paño.cantidad);
    totalMetrosPerfil += (perimetroPaño * paño.cantidad);
    totalPaños += paño.cantidad;

    const costoVidrioExt = areaPaño * Number(precioVidrioExt);
    const costoVidrioInt = areaPaño * Number(precioVidrioInt);
    const costoCamara = perimetroPaño * Number(precioCamaraML);
    
    costoSubtotalInsumos += (costoVidrioExt + costoVidrioInt + costoCamara) * paño.cantidad;
  });

  const factorDesperdicio = 1 + (Number(porcentajeDesperdicio) / 100);
  const costoConDesperdicio = costoSubtotalInsumos * factorDesperdicio;

  return {
    totalPaños,
    totalM2VidrioExt: Number(totalM2VidrioExt.toFixed(2)),
    totalM2VidrioInt: Number(totalM2VidrioInt.toFixed(2)),
    totalMetrosPerfil: Number(totalMetrosPerfil.toFixed(2)),
    costoSubtotalInsumos: Number(costoSubtotalInsumos.toFixed(2)),
    costoConDesperdicio: Number(costoConDesperdicio.toFixed(2))
  };
}