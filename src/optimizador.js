// ===================================================================
// Algoritmo MaxRects Definitivo - Graziano Vidrios
// ===================================================================
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  let todosPaños = [];
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      todosPaños.push({
        id: `${p.id}-${i}`,
        ancho: Number(p.ancho),
        alto: Number(p.alto)
      });
    }
  });

  // Evaluamos múltiples criterios de ordenamiento para encontrar el óptimo
  const criteriosOrden = [
    (a, b) => (b.ancho * b.alto) - (a.ancho * a.alto), 
    (a, b) => b.alto - a.alto || b.ancho - a.ancho,     
    (a, b) => b.ancho - a.ancho || b.alto - a.alto      
  ];

  let mejorConfiguracionHojas = null;
  let menosHojasTotales = Infinity;
  let mejorRendimientoGlobal = 0;

  for (let criterio of criteriosOrden) {
    let pañosCopia = [...todosPaños].sort(criterio);
    let hojasActuales = [];

    pañosCopia.forEach(paño => {
      let acomodado = false;

      for (let hoja of hojasActuales) {
        let mejorEspacioIdx = -1;
        let mejorRotado = false;
        let mejorPuntaje = Infinity; 

        for (let i = 0; i < hoja.espaciosLibres.length; i++) {
          let esp = hoja.espaciosLibres[i];

          // Opción A: Normal
          if (paño.ancho <= esp.w && paño.alto <= esp.h) {
            let puntaje = Math.min(esp.w - paño.ancho, esp.h - paño.alto);
            if (puntaje < mejorPuntaje) {
              mejorPuntaje = puntaje;
              mejorEspacioIdx = i;
              mejorRotado = false;
            }
          }

          // Opción B: Rotado
          if (paño.alto <= esp.w && paño.ancho <= esp.h) {
            let puntaje = Math.min(esp.w - paño.alto, esp.h - paño.ancho);
            if (puntaje < mejorPuntaje) {
              mejorPuntaje = puntaje;
              mejorEspacioIdx = i;
              mejorRotado = true;
            }
          }
        }

        if (mejorEspacioIdx !== -1) {
          let esp = hoja.espaciosLibres[mejorEspacioIdx];
          let wFinal = mejorRotado ? paño.alto : paño.ancho;
          let hFinal = mejorRotado ? paño.ancho : paño.alto;

          hoja.paños.push({
            ancho: wFinal,
            alto: hFinal,
            x: esp.x,
            y: esp.y,
            rotado: mejorRotado
          });

          hoja.areaUsada += (paño.ancho * paño.alto);

          // Generación de nuevos rectángulosMaximales libres (Estrategia MaxRects pura)
          let nuevosEspacios = [];
          if (esp.w - wFinal > 0) {
            nuevosEspacios.push({ x: esp.x + wFinal, y: esp.y, w: esp.w - wFinal, h: esp.h });
          }
          if (esp.h - hFinal > 0) {
            nuevosEspacios.push({ x: esp.x, y: esp.y + hFinal, w: esp.w, h: esp.h - hFinal });
          }

          hoja.espaciosLibres.splice(mejorEspacioIdx, 1, ...nuevosEspacios);
          hoja.espaciosLibres = filtrarEspaciosRedundantes(hoja.espaciosLibres);

          acomodado = true;
          break;
        }
      }

      // Si no entra, abrimos una hoja y dejamos TODO el espacio disponible inicializado como un único bloque limpio
      if (!acomodado) {
        let rotarEnNueva = false;
        if (paño.ancho > HOJA_ANCHO || paño.alto > HOJA_ALTO) {
          if (paño.alto <= HOJA_ANCHO && paño.ancho <= HOJA_ALTO) {
            rotarEnNueva = true;
          } else {
            return; 
          }
        }

        let wFinal = rotarEnNueva ? paño.alto : paño.ancho;
        let hFinal = rotarEnNueva ? paño.ancho : paño.alto;

        let nuevaHoja = {
          areaUsada: paño.ancho * paño.alto,
          paños: [{ ancho: wFinal, alto: hFinal, x: 0, y: 0, rotado: rotarEnNueva }],
          // CLAVE: El espacio libre se subdivide a partir de la hoja completa, no con cortes fijos previos
          espaciosLibres: []
        };

        if (HOJA_ANCHO - wFinal > 0) {
          nuevaHoja.espaciosLibres.push({ x: wFinal, y: 0, w: HOJA_ANCHO - wFinal, h: HOJA_ALTO });
        }
        if (HOJA_ALTO - hFinal > 0) {
          nuevaHoja.espaciosLibres.push({ x: 0, y: hFinal, w: wFinal, h: HOJA_ALTO - hFinal });
        }
        if (HOJA_ANCHO - wFinal > 0 && HOJA_ALTO - hFinal > 0) {
          nuevaHoja.espaciosLibres.push({ x: wFinal, y: hFinal, w: HOJA_ANCHO - wFinal, h: HOJA_ALTO - hFinal });
        }

        hojasActuales.push(nuevaHoja);
      }
    });

    let rendimientoTotal = hojasActuales.reduce((acc, h) => acc + h.areaUsada, 0) / (hojasActuales.length * AREA_TOTAL_HOJA);

    if (hojasActuales.length < menosHojasTotales || (hojasActuales.length === menosHojasTotales && rendimientoTotal > mejorRendimientoGlobal)) {
      menosHojasTotales = hojasActuales.length;
      mejorRendimientoGlobal = rendimientoTotal;
      mejorConfiguracionHojas = hojasActuales;
    }
  }

  return mejorConfiguracionHojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}

function filtrarEspaciosRedundantes(espacios) {
  return espacios.filter((e1, idx1) => {
    return !espacios.some((e2, idx2) => {
      if (idx1 === idx2) return false;
      return e1.x >= e2.x && e1.y >= e2.y && (e1.x + e1.w) <= (e2.x + e2.w) && (e1.y + e1.h) <= (e2.y + e2.h);
    });
  });
}