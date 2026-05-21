const ANCHO_PLANCHA = 3600;
const ALTO_PLANCHA = 2500; 

export function optimizarCortes(piezas) {
  let resultados = [];
  let hojas = [];

  // Ordenamos las piezas: primero las que tienen mayor área para ubicar lo grande primero
  const piezasOrdenadas = [...piezas].sort((a, b) => {
    const areaA = Number(a.ancho) * Number(a.alto);
    const areaB = Number(b.ancho) * Number(b.alto);
    return areaB - areaA;
  });

  for (let pieza of piezasOrdenadas) {
    let pAncho = Math.max(Number(pieza.ancho), Number(pieza.alto));
    let pAlto = Math.min(Number(pieza.ancho), Number(pieza.alto));

    if (pAncho > ANCHO_PLANCHA || pAlto > ALTO_PLANCHA) continue;

    let acomodada = false;

    // Intentamos meter la pieza en las hojas existentes
    for (let i = 0; i < hojas.length; i++) {
      let hoja = hojas[i];

      // 1. Intentar meterla en los "huecos" libres (descartes) de la hoja
      for (let j = 0; j < hoja.espaciosLibres.length; j++) {
        let espacio = hoja.espaciosLibres[j];
        
        // Probar orientación Normal
        if (pAncho <= espacio.w && pAlto <= espacio.h) {
          resultados.push({ ...pieza, ancho: pAncho, alto: pAlto, x: espacio.x, y: espacio.y, hoja: i + 1, rotada: false });
          // Dividimos el espacio sobrante (Guillotine cut)
          if (espacio.w - pAncho > 0) {
            hoja.espaciosLibres.push({ x: espacio.x + pAncho, y: espacio.y, w: espacio.w - pAncho, h: pAlto });
          }
          if (espacio.h - pAlto > 0) {
            hoja.espaciosLibres.push({ x: espacio.x, y: espacio.y + pAlto, w: espacio.w, h: espacio.h - pAlto });
          }
          hoja.espaciosLibres.splice(j, 1);
          acomodada = true;
          break;
        }
        
        // Probar orientación Rotada (para meter los de 30cm en el aire sobrante)
        if (pAlto <= espacio.w && pAncho <= espacio.h) {
          resultados.push({ ...pieza, ancho: pAlto, alto: pAncho, x: espacio.x, y: espacio.y, hoja: i + 1, rotada: true });
          if (espacio.w - pAlto > 0) {
            hoja.espaciosLibres.push({ x: espacio.x + pAlto, y: espacio.y, w: espacio.w - pAlto, h: pAncho });
          }
          if (espacio.h - pAncho > 0) {
            hoja.espaciosLibres.push({ x: espacio.x, y: espacio.y + pAncho, w: espacio.w, h: espacio.h - pAncho });
          }
          hoja.espaciosLibres.splice(j, 1);
          acomodada = true;
          break;
        }
      }

      if (acomodada) break;

      // 2. Si no entró en los huecos, ver si podemos expandir el corte vertical a la derecha
      if (hoja.xActual + pAncho <= ANCHO_PLANCHA) {
        resultados.push({ ...pieza, ancho: pAncho, alto: pAlto, x: hoja.xActual, y: 0, hoja: i + 1, rotada: false });
        
        // El espacio que sobra abajo de esta pieza en su columna se vuelve un "hueco libre"
        if (ALTO_PLANCHA - pAlto > 0) {
          hoja.espaciosLibres.push({ x: hoja.xActual, y: pAlto, w: pAncho, h: ALTO_PLANCHA - pAlto });
        }
        hoja.xActual += pAncho;
        acomodada = true;
        break;
      }
      
      // 3. Intentar expandir a la derecha con la pieza rotada si calza mejor
      if (hoja.xActual + pAlto <= ANCHO_PLANCHA) {
        resultados.push({ ...pieza, ancho: pAlto, alto: pAncho, x: hoja.xActual, y: 0, hoja: i + 1, rotada: true });
        if (ALTO_PLANCHA - pAncho > 0) {
          hoja.espaciosLibres.push({ x: hoja.xActual, y: pAncho, w: pAlto, h: ALTO_PLANCHA - pAncho });
        }
        hoja.xActual += pAlto;
        acomodada = true;
        break;
      }
    }

    // Si de ninguna forma entró en la Hoja 1, se abre una Hoja Nueva
    if (!acomodada) {
      let nuevaHoja = {
        xActual: pAncho,
        espaciosLibres: []
      };
      if (ALTO_PLANCHA - pAlto > 0) {
        nuevaHoja.espaciosLibres.push({ x: 0, y: pAlto, w: pAncho, h: ALTO_PLANCHA - pAlto });
      }
      hojas.push(nuevaHoja);
      resultados.push({ ...pieza, ancho: pAncho, alto: pAlto, x: 0, y: 0, hoja: hojas.length, rotada: false });
    }
  }

  return { piezas: resultados };
}