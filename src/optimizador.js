// ===================================================================
// Algoritmo de Optimización Avanzado (Espacios Libres + Rotación Dinámica)
// ===================================================================
export function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  // 1. Desglosar cantidades individuales
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

  // 2. Ordenar por área (de mayor a menor) suele dar mejor empaquetado global
  todosPaños.sort((a, b) => (b.ancho * b.alto) - (a.ancho * a.alto));

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    // Intentar meter en hojas existentes
    for (let hoja of hojas) {
      let mejorEspacioIdx = -1;
      let mejorRotado = false;
      let minDesperdicioPuntaje = Infinity; // Criterio: Best-Shortside Fit

      // Buscar en los espacios libres de esta hoja
      for (let i = 0; i < hoja.espaciosLibres.length; i++) {
        let esp = hoja.espaciosLibres[i];

        // Opción A: Sin rotar
        if (paño.ancho <= esp.w && paño.alto <= esp.h) {
          let remanenteAncho = esp.w - paño.ancho;
          let remanenteAlto = esp.h - paño.alto;
          let puntaje = Math.min(remanenteAncho, remanenteAlto);
          if (puntaje < minDesperdicioPuntaje) {
            minDesperdicioPuntaje = puntaje;
            mejorEspacioIdx = i;
            mejorRotado = false;
          }
        }

        // Opción B: Rotado 90 grados
        if (paño.alto <= esp.w && paño.ancho <= esp.h) {
          let remanenteAncho = esp.w - paño.alto;
          let remanenteAlto = esp.h - paño.ancho;
          let puntaje = Math.min(remanenteAncho, remanenteAlto);
          if (puntaje < minDesperdicioPuntaje) {
            minDesperdicioPuntaje = puntaje;
            mejorEspacioIdx = i;
            mejorRotado = true;
          }
        }
      }

      // Si encontramos un espacio libre apto en esta hoja
      if (mejorEspacioIdx !== -1) {
        let esp = hoja.espaciosLibres.splice(mejorEspacioIdx, 1)[0];
        let wFinal = mejorRotado ? paño.alto : paño.ancho;
        let hFinal = mejorRotado ? paño.ancho : paño.alto;

        // Registrar el corte del paño
        hoja.paños.push({
          ancho: wFinal,
          alto: hFinal,
          x: esp.x,
          y: esp.y,
          rotado: mejorRotado
        });

        hoja.areaUsada += (paño.ancho * paño.alto);

        // Subdividir el espacio sobrante (Corte tipo Guillotina)
        // Decidimos por dónde cortar el remanente basado en cuál eje desperdicia menos
        if (esp.w - wFinal > esp.h - hFinal) {
          // Espacio remanente a la derecha es mayor, cortamos vertical primero
          if (esp.w - wFinal > 0) {
            hoja.espaciosLibres.push({ x: esp.x + wFinal, y: esp.y, w: esp.w - wFinal, h: hFinal });
          }
          if (esp.h - hFinal > 0) {
            hoja.espaciosLibres.push({ x: esp.x, y: esp.y + hFinal, w: esp.w, h: esp.h - hFinal });
          }
        } else {
          // Espacio remanente arriba es mayor, cortamos horizontal primero
          if (esp.h - hFinal > 0) {
            hoja.espaciosLibres.push({ x: esp.x, y: esp.y + hFinal, w: wFinal, h: esp.h - hFinal });
          }
          if (esp.w - wFinal > 0) {
            hoja.espaciosLibres.push({ x: esp.x + wFinal, y: esp.y, w: esp.w - wFinal, h: esp.h });
          }
        }

        acomodado = true;
        break;
      }
    }

    // Si ninguna hoja tenía espacio, creamos una hoja nueva
    if (!acomodado) {
      // Por defecto evaluamos si entra mejor normal o rotado en la hoja vacía
      let rotarEnNuevaHoja = false;
      if (paño.ancho > HOJA_ANCHO || paño.alto > HOJA_ALTO) {
        // Si no entra normal, probamos rotado
        if (paño.alto <= HOJA_ANCHO && paño.ancho <= HOJA_ALTO) {
          rotarEnNuevaHoja = true;
        } else {
          console.warn(`El paño ${paño.id} excede las dimensiones de la hoja estándar.`);
          return; // No entra de ninguna forma
        }
      }

      let wFinal = rotarEnNuevaHoja ? paño.alto : paño.ancho;
      let hFinal = rotarEnNuevaHoja ? paño.ancho : paño.alto;

      let nuevaHoja = {
        areaUsada: paño.ancho * paño.alto,
        paños: [{
          ancho: wFinal,
          alto: hFinal,
          x: 0,
          y: 0,
          rotado: rotarEnNuevaHoja
        }],
        // Inicializamos los dos primeros sub-espacios libres que genera este primer corte
        espaciosLibres: []
      };

      if (HOJA_ANCHO - wFinal > 0) {
        nuevaHoja.espaciosLibres.push({ x: wFinal, y: 0, w: HOJA_ANCHO - wFinal, h: hFinal });
      }
      if (HOJA_ALTO - hFinal > 0) {
        nuevaHoja.espaciosLibres.push({ x: 0, y: hFinal, w: HOJA_ANCHO, h: HOJA_ALTO - hFinal });
      }

      hojas.push(nuevaHoja);
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
}