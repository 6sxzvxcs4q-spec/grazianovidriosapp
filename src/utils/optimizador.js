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
// Algoritmo de Corte Guillotina 2D Perfecto con Rotación Inteligente
// ===================================================================
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  let todosPaños = [];
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      todosPaños.push({ id: `${p.id}-${i}`, ancho: p.ancho, alto: p.alto });
    }
  });

  // Ordenamos de mayor a menor por área para garantizar que los paños grandes entren primero
  todosPaños.sort((a, b) => (b.ancho * b.alto) - (a.ancho * a.alto));

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    // 1. Intentar meter el paño en los espacios libres de las hojas que ya abrimos
    for (let hoja of hojas) {
      for (let i = 0; i < hoja.espaciosLibres.length; i++) {
        let espacio = hoja.espaciosLibres[i];
        let w = paño.ancho;
        let h = paño.alto;
        let rotado = false;

        let encajaNormal = (w <= espacio.w && h <= espacio.h);
        let encajaRotado = (h <= espacio.w && w <= espacio.h);

        // Si no entra de ninguna forma en este espacio, seguimos buscando
        if (!encajaNormal && !encajaRotado) continue;

        // Si entra de las dos formas, elegimos la orientación que mejor muerda el espacio
        if (encajaRotado && (!encajaNormal || (espacio.w - h < espacio.w - w))) {
          w = paño.alto;
          h = paño.ancho;
          rotado = true;
        }

        // Fijamos el paño en las coordenadas exactas de este espacio libre
        hoja.paños.push({
          ancho: w,
          alto: h,
          x: espacio.x,
          y: espacio.y,
          rotado: rotado
        });

        hoja.areaUsada += (w * h);

        // Partición Guillotina limpia: dividimos el espacio restante en dos rectángulos independientes
        let espaciosNuevos = [];
        // Espacio sobrante a la derecha
        if (espacio.w - w > 0) {
          espaciosNuevos.push({ x: espacio.x + w, y: espacio.y, w: espacio.w - w, h: h });
        }
        // Espacio sobrante abajo
        if (espacio.h - h > 0) {
          espaciosNuevos.push({ x: espacio.x, y: espacio.y + h, w: espacio.w, h: espacio.h - h });
        }

        // Sacamos el espacio viejo que ya ocupamos y metemos los dos nuevos sub-bloques
        hoja.espaciosLibres.splice(i, 1);
        hoja.espaciosLibres.push(...espaciosNuevos);

        acomodado = true;
        break;
      }
      if (acomodado) break;
    }

    // 2. Si no entró en ningún lado, abrimos una hoja limpia de 3600x2500
    if (!acomodado) {
      let w = paño.ancho;
      let h = paño.alto;
      let rotado = false;

      // Si el paño es más alto que ancho y entra girado en la plancha base, lo acostamos
      if (h <= HOJA_ANCHO && w <= HOJA_ALTO && h > w) {
        w = paño.alto;
        h = paño.ancho;
        rotado = true;
      }

      // IMPORTANTE: La hoja arranca con el primer paño clavado en (0,0) y sus dos subdivisiones iniciales correctas
      let nuevaHoja = {
        paños: [{ ancho: w, alto: h, x: 0, y: 0, rotado: rotado }],
        areaUsada: w * h,
        espaciosLibres: []
      };

      if (HOJA_ANCHO - w > 0) nuevaHoja.espaciosLibres.push({ x: w, y: 0, w: HOJA_ANCHO - w, h: h });
      if (HOJA_ALTO - h > 0) nuevaHoja.espaciosLibres.push({ x: 0, y: h, w: w, h: HOJA_ALTO - h }); // <-- CORREGIDO: El ancho de abajo se limita a 'w' para evitar solapamientos virtuales

      hojas.push(nuevaHoja);
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}