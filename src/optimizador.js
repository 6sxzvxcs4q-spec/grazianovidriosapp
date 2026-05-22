// Optimizador de cortes en 2D para Placas Enteras
export function optimizarCortes(piezas, placaAncho, placaAlto) {
  // Ordenar piezas de mayor a menor superficie para optimizar mejor
  const piezasOrdenadas = [...piezas].sort((a, b) => (b.ancho * b.alto) - (a.ancho * a.alto));
  
  const placasUsadas = [];

  piezasOrdenadas.forEach((pieza) => {
    let ubicada = false;

    // Intentar meter la pieza en alguna placa que ya hayamos empezado a usar
    for (let placa of placasUsadas) {
      if (intentarUbicarPieza(placa, pieza)) {
        ubicada = true;
        break;
      }
    }

    // Si no cupo en las anteriores, abrimos una placa nueva
    if (!ubicada) {
      const nuevaPlaca = {
        ancho: placaAncho,
        alto: placaAlto,
        piezasUbicadas: [],
        // Un mapa simple de espacios ocupados (nivel básico para evitar solapamiento)
        espaciosOcupados: [] 
      };
      
      if (intentarUbicarPieza(nuevaPlaca, pieza)) {
        placasUsadas.push(nuevaPlaca);
      } else {
        // La pieza individual es más grande que la placa entera
        console.error("La pieza es demasiado grande para esta placa estándar.");
      }
    }
  });

  const desperdicioTotal = placasUsadas.reduce((acc, p) => {
    const areaPlaca = p.ancho * p.alto;
    const areaUtilizada = p.piezasUbicadas.reduce((sum, pieza) => sum + (pieza.ancho * pieza.alto), 0);
    return acc + (areaPlaca - areaUtilizada);
  }, 0);

  return {
    barrasUsadas: placasUsadas.length, // Mantenemos el nombre para no romper compatibilidad rápida
    desperdicioTotal: Math.round(desperdicioTotal / 1000000) + " m²", // Convertido a metros cuadrados aproximados
    detalles: placasUsadas
  };
}

function intentarUbicarPieza(placa, pieza) {
  // Algoritmo de empaquetamiento básico por coordenadas (Bottom-Left)
  // Intentamos ubicar en X e Y buscando un hueco libre
  for (let y = 0; y <= placa.alto - pieza.alto; y += 50) { // pasos de 50mm para velocidad
    for (let x = 0; x <= placa.ancho - pieza.ancho; x += 50) {
      
      // Validar si se solapa con otra pieza en esta placa
      let solapa = false;
      for (let otra of placa.piezasUbicadas) {
        if (
          x < otra.x + otra.ancho &&
          x + pieza.ancho > otra.x &&
          y < otra.y + otra.alto &&
          y + pieza.alto > otra.y
        ) {
          solapa = true;
          break;
        }
      }

      if (!solapa) {
        // Encontramos lugar físico sin solapamiento
        placa.piezasUbicadas.push({
          ...pieza,
          x: x,
          y: y
        });
        return true;
      }
    }
  }
  return false;
}