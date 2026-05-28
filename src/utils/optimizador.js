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
// Algoritmo de Corte Guillotina Avanzado - Graziano Vidrios
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

  // Ordenamos de mayor a menor por el lado más largo para estructurar las filas del taller
  todosPaños.sort((a, b) => Math.max(b.ancho, b.alto) - Math.max(a.ancho, a.alto));

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    // 1. Intentar ubicar en las hojas que ya están abiertas
    for (let hoja of hojas) {
      // Ordenamos los espacios libres: priorizamos los que están más abajo y a la izquierda
      hoja.espaciosLibres.sort((a, b) => a.y - b.y || a.x - b.x);

      for (let i = 0; i < hoja.espaciosLibres.length; i++) {
        let espacio = hoja.espaciosLibres[i];
        let w = paño.ancho;
        let h = paño.alto;
        let rotado = false;

        let encajaNormal = (w <= espacio.w && h <= espacio.h);
        let encajaRotado = (h <= espacio.w && w <= espacio.h);

        if (!encajaNormal && !encajaRotado) continue;

        // Decidir si conviene rotar para maximizar el remanente de la fila
        if (encajaRotado && (!encajaNormal || (espacio.w - h < espacio.w - w))) {
          w = paño.alto;
          h = paño.ancho;
          rotado = true;
        }

        // Registrar ubicación física del corte
        hoja.paños.push({ ancho: w, alto: h, x: espacio.x, y: espacio.y, rotado });
        hoja.areaUsada += (w * h);

        // Generar las nuevas subdivisiones maximizadas
        let espaciosNuevos = [];
        // Opción A: Corte remanente a la derecha
        if (espacio.w - w > 0) {
          espaciosNuevos.push({ x: espacio.x + w, y: espacio.y, w: espacio.w - w, h: espacio.h });
        }
        // Opción B: Corte remanente hacia abajo (abarca todo el ancho del bloque disponible)
        if (espacio.h - h > 0) {
          espaciosNuevos.push({ x: espacio.x, y: espacio.y + h, w: espacio.w, h: espacio.h - h });
        }

        // Eliminar el espacio usado y añadir los nuevos
        hoja.espaciosLibres.splice(i, 1);
        hoja.espaciosLibres.push(...espaciosNuevos);

        // Limpieza de espacios redundantes o contenidos dentro de otros (Bucle de Consolidación)
        hoja.espaciosLibres = hoja.espaciosLibres.filter((e1, idx1) => {
          return !hoja.espaciosLibres.some((e2, idx2) => {
            if (idx1 === idx2) return false;
            return e1.x >= e2.x && e1.y >= e2.y && 
                   (e1.x + e1.w) <= (e2.x + e2.w) && 
                   (e1.y + e1.h) <= (e2.y + e2.h);
          });
        });

        acomodado = true;
        break;
      }
      if (acomodado) break;
    }

    // 2. Si no entró en ninguna hoja, abrimos una nueva plancha estándar de 3600x2500
    if (!acomodado) {
      let w = paño.ancho;
      let h = paño.alto;
      let rotado = false;

      if (h <= HOJA_ANCHO && w <= HOJA_ALTO && h > w) {
        w = paño.alto;
        h = paño.ancho;
        rotado = true;
      }

      let nuevaHoja = {
        paños: [{ ancho: w, alto: h, x: 0, y: 0, rotado }],
        areaUsada: w * h,
        // La hoja arranca dividiéndose de forma limpia abarcando todo el remanente físico real
        espaciosLibres: [
          { x: w, y: 0, w: HOJA_ANCHO - w, h: HOJA_ALTO }, // Todo el bloque de la derecha
          { x: 0, y: h, w: HOJA_ANCHO, h: HOJA_ALTO - h }  // Todo el bloque de abajo
        ]
      };

      hojas.push(nuevaHoja);
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}