// ===================================================================
// Algoritmo de Corte Avanzado - Graziano Vidrios (Fix Espacios)
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

  // Evaluamos ordenando por área, por alto y por ancho
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

          // Opción A: Sin Rotar
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

          // Generar los nuevos espacios libres expandidos
          let espOriginal = hoja.espaciosLibres.splice(mejorEspacioIdx, 1)[0];
          
          // Dividimos el espacio restante de manera que conserve la línea de corte a la derecha
          if (espOriginal.w - wFinal > 0) {
            hoja.espaciosLibres.push({
              x: espOriginal.x + wFinal,
              y: espOriginal.y,
              w: espOriginal.w - wFinal,
              h: espOriginal.h
            });
          }
          if (espOriginal.h - hFinal > 0) {
            hoja.espaciosLibres.push({
              x: espOriginal.x,
              y: espOriginal.y + hFinal,
              w: wFinal,
              h: espOriginal.h - hFinal
            });
          }

          hoja.espaciosLibres = filtrarEspaciosRedundantes(hoja.espaciosLibres);
          acomodado = true;
          break;
        }
      }

      if (!acomodado) {
        // Inicialización de hoja nueva limpia con espacio de corte total disponible
        let nuevaHoja = {
          areaUsada: paño.ancho * paño.alto,
          paños: [{ ancho: paño.ancho, alto: paño.alto, x: 0, y: 0, rotado: false }],
          espaciosLibres: [
            { x: paño.ancho, y: 0, w: HOJA_ANCHO - paño.ancho, h: HOJA_ALTO },
            { x: 0, y: paño.alto, w: HOJA_ANCHO, h: HOJA_ALTO - paño.alto }
          ]
        };
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