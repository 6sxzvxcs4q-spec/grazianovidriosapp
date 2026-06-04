// ===================================================================
// Algoritmo Ultra-Optimizador Avanzado (Estrategia MaxRects Completa)
// ===================================================================
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  // 1. Desglosar todas las cantidades individuales
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

  // Intentamos 3 ordenamientos distintos para ver cuál da el mejor resultado global
  const criteriosOrden = [
    (a, b) => (b.ancho * b.alto) - (a.ancho * a.alto), // Por Área Mayor
    (a, b) => b.alto - a.alto || b.ancho - a.ancho,     // Por Alto Mayor
    (a, b) => b.ancho - a.ancho || b.alto - a.alto      // Por Ancho Mayor
  ];

  let mejorConfiguracionHojas = null;
  let menosHojasTotales = Infinity;
  let mejorRendimientoGlobal = 0;

  // Evaluamos cada criterio y nos quedamos con el ganador absoluto
  for (let criterio of criteriosOrden) {
    let pañosCopia = [...todosPaños].sort(criterio);
    let hojasActuales = [];

    pañosCopia.forEach(paño => {
      let acomodado = false;

      // Intentar meter en los espacios de las hojas que ya abrimos
      for (let hoja of hojasActuales) {
        let mejorEspacioIdx = -1;
        let mejorRotado = false;
        let mejorPuntaje = Infinity; // Buscamos minimizar el "Shortside Fit"

        for (let i = 0; i < hoja.espaciosLibres.length; i++) {
          let esp = hoja.espaciosLibres[i];

          // Opción normal
          if (paño.ancho <= esp.w && paño.alto <= esp.h) {
            let puntaje = Math.min(esp.w - paño.ancho, esp.h - paño.alto);
            if (puntaje < mejorPuntaje) {
              mejorPuntaje = puntaje;
              mejorEspacioIdx = i;
              mejorRotado = false;
            }
          }

          // Opción rotada
          if (paño.alto <= esp.w && paño.ancho <= esp.h) {
            let puntaje = Math.min(esp.w - paño.alto, esp.h - paño.ancho);
            if (puntaje < mejorPuntaje) {
              mejorPuntaje = puntaje;
              mejorEspacioIdx = i;
              mejorRotado = true;
            }
          }
        }

        // Si encontramos un lugar idóneo en esta hoja, lo ubicamos
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

          // Estrategia MaxRects: Generar nuevos espacios libres a partir del corte
          let nuevosEspacios = [];
          if (esp.w - wFinal > 0) {
            nuevosEspacios.push({ x: esp.x + wFinal, y: esp.y, w: esp.w - wFinal, h: esp.h });
          }
          if (esp.h - hFinal > 0) {
            nuevosEspacios.push({ x: esp.x, y: esp.y + hFinal, w: esp.w, h: esp.h - hFinal });
          }

          // Reemplazar el espacio usado por los remanentes optimizados
          hoja.espaciosLibres.splice(mejorEspacioIdx, 1, ...nuevosEspacios);

          // Limpiar espacios libres que queden contenidos o duplicados dentro de otros
          hoja.espaciosLibres = filtrarEspaciosRedundantes(hoja.espaciosLibres);

          acomodado = true;
          break;
        }
      }

      // Si no entró en ninguna hoja previa, se abre una nueva plancha de vidrio
      if (!acomodado) {
        let rotarEnNueva = false;
        if (paño.ancho > HOJA_ANCHO || paño.alto > HOJA_ALTO) {
          if (paño.alto <= HOJA_ANCHO && paño.ancho <= HOJA_ALTO) {
            rotarEnNueva = true;
          } else {
            return; // Medida excede el tamaño máximo de la hoja de fábrica
          }
        }

        let wFinal = rotarEnNueva ? paño.alto : paño.ancho;
        let hFinal = rotarEnNueva ? paño.ancho : paño.alto;

        let nuevaHoja = {
          areaUsada: paño.ancho * paño.alto,
          paños: [{ ancho: wFinal, alto: hFinal, x: 0, y: 0, rotado: rotarEnNueva }],
          espaciosLibres: []
        };

        if (HOJA_ANCHO - wFinal > 0) {
          nuevaHoja.espaciosLibres.push({ x: wFinal, y: 0, w: HOJA_ANCHO - wFinal, h: HOJA_ALTO });
        }
        if (HOJA_ALTO - hFinal > 0) {
          nuevaHoja.espaciosLibres.push({ x: 0, y: hFinal, w: HOJA_ANCHO, h: HOJA_ALTO - hFinal });
        }

        hojasActuales.push(nuevaHoja);
      }
    });

    // Calcular rendimiento global de esta corrida
    let rendimientoTotal = hojasActuales.reduce((acc, h) => acc + h.areaUsada, 0) / (hojasActuales.length * AREA_TOTAL_HOJA);

    // Guardamos la corrida que use menos hojas o que tenga mejor promedio
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

// Función auxiliar para eliminar sub-rectángulos redundantes
function filtrarEspaciosRedundantes(espacios) {
  return espacios.filter((e1, idx1) => {
    return !espacios.some((e2, idx2) => {
      if (idx1 === idx2) return false;
      // Verificar si e1 está completamente metido adentro de e2
      return e1.x >= e2.x && e1.y >= e2.y && (e1.x + e1.w) <= (e2.x + e2.w) && (e1.y + e1.h) <= (e2.y + e2.h);
    });
  });
}