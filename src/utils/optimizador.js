// ===================================================================
// Calculador Avanzado Desglosado de DVH - Graziano Vidrios
// ===================================================================
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

// ===================================================================
// Algoritmo de Distribución por Filas a Escala Real (Graziano Vidrios)
// ===================================================================
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  let todosPaños = [];
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      // Rotación Inteligente previa: Evaluamos cuál orientación aprovecha mejor el ancho de la fila
      let w = p.ancho;
      let h = p.alto;
      let rotado = false;

      // Si acostado es más chico o igual que parado, lo dejamos estándar, sino evaluamos optimizarlo
      if (w > h) {
        // Forzar a que la dimensión más grande sea el ancho para que entren más por fila si son chicos
        w = p.ancho;
        h = p.alto;
      }

      todosPaños.push({ id: `${p.id}-${i}`, ancho: w, alto: h, rotado: rotado });
    }
  });

  // Ordenamos de mayor a menor por alto para que las filas se acomoden de forma decreciente impecable
  todosPaños.sort((a, b) => b.alto - a.alto);

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    // Intentar meter en las hojas existentes
    for (let hoja of hojas) {
      // Recorremos las filas de corte creadas en esta hoja
      for (let fila of hoja.filas) {
        // ¿Entra a lo ancho en esta fila y no supera el alto de la hoja?
        if (fila.anchoUsado + paño.ancho <= HOJA_ANCHO && fila.y + paño.alto <= HOJA_ALTO) {
          
          // Verificar si rotándolo al revés (parado) rinde mejor en la fila actual
          let anchoFinal = paño.ancho;
          let altoFinal = paño.alto;
          let rotadoFinal = paño.rotado;

          if (fila.anchoUsado + paño.alto <= HOJA_ANCHO && fila.y + paño.ancho <= HOJA_ALTO && paño.alto < paño.ancho) {
            anchoFinal = paño.alto;
            altoFinal = paño.ancho;
            rotadoFinal = true;
          }

          hoja.paños.push({
            ancho: anchoFinal,
            alto: altoFinal,
            x: fila.anchoUsado,
            y: fila.y,
            rotado: rotadoFinal
          });

          fila.anchoUsado += anchoFinal;
          if (altoFinal > fila.altoMaximo) {
            fila.altoMaximo = altoFinal;
          }
          hoja.areaUsada += (anchoFinal * altoFinal);
          acomodado = true;
          break;
        }
      }

      // Si entra en la hoja pero se llenaron las filas anteriores, probamos crear una nueva fila ARRIBA
      if (!acomodado) {
        let ultimaFila = hoja.filas[hoja.filas.length - 1];
        let nuevoY = ultimaFila.y + ultimaFila.altoMaximo;

        // ¿Tenemos espacio vertical para otra hilera completa?
        if (nuevoY + paño.alto <= HOJA_ALTO && paño.ancho <= HOJA_ANCHO) {
          let nuevaFila = {
            y: nuevoY,
            anchoUsado: paño.ancho,
            altoMaximo: paño.alto
          };
          hoja.filas.push(nuevaFila);
          hoja.paños.push({
            ancho: paño.ancho,
            alto: paño.alto,
            x: 0,
            y: nuevoY,
            rotado: paño.rotado
          });
          hoja.areaUsada += (paño.ancho * paño.alto);
          acomodado = true;
          break;
        }
      }
    }

    // Si no entra en ninguna hoja física, abrimos una plancha nueva en blanco de 3600x2500
    if (!acomodado) {
      let nuevaHoja = {
        areaUsada: paño.ancho * paño.alto,
        filas: [{
          y: 0,
          anchoUsado: paño.ancho,
          altoMaximo: paño.alto
        }],
        paños: [{
          ancho: paño.ancho,
          alto: paño.alto,
          x: 0,
          y: 0,
          rotado: paño.rotado
        }]
      };
      hojas.push(nuevaHoja);
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}