// Optimizador de cortes en 2D con ROTACIÓN automática de piezas
export function optimizarCortes(piezas, placaAncho, placaAlto) {
  // Ordenar piezas de mayor a menor superficie
  const piezasOrdenadas = [...piezas].sort((a, b) => (b.ancho * b.alto) - (a.ancho * a.alto));
  
  const placasUsadas = [];

  piezasOrdenadas.forEach((pieza) => {
    let ubicada = false;

    // 1. Intentar ubicarla en las placas que ya abrimos
    for (let placa of placasUsadas) {
      if (intentarUbicarConRotacion(placa, pieza)) {
        ubicada = true;
        break;
      }
    }

    // 2. Si no cupo, abrimos una placa nueva
    if (!ubicada) {
      const nuevaPlaca = {
        ancho: placaAncho,
        alto: placaAlto,
        piezasUbicadas: []
      };
      
      if (intentarUbicarConRotacion(nuevaPlaca, pieza)) {
        placasUsadas.push(nuevaPlaca);
      } else {
        console.error("La pieza es demasiado grande para la placa.");
      }
    }
  });

  const desperdicioTotal = placasUsadas.reduce((acc, p) => {
    const areaPlaca = p.ancho * p.alto;
    const areaUtilizada = p.piezasUbicadas.reduce((sum, pz) => sum + (pz.ancho * pz.alto), 0);
    return acc + (areaPlaca - areaUtilizada);
  }, 0);

  return {
    barrasUsadas: placasUsadas.length,
    desperdicioTotal: (desperdicioTotal / 1000000).toFixed(2) + " m²",
    detalles: placasUsadas
  };
}

function intentarUbicarConRotacion(placa, pieza) {
  // Primero intentamos ponerla en la orientación original
  if (buscarHuecoYUbicar(placa, pieza.ancho, pieza.alto, false)) {
    return true;
  }
  // Si no entra, probamos rotándola 90 grados (intercambiando ancho por alto)
  if (buscarHuecoYUbicar(placa, pieza.alto, pieza.ancho, true)) {
    return true;
  }
  return false;
}

function buscarHuecoYUbicar(placa, ancho, alto, rotada) {
  // Escaneo por coordenadas buscando un punto libre (pasos de 10mm para más precisión)
  for (let y = 0; y <= placa.alto - alto; y += 10) {
    for (let x = 0; x <= placa.ancho - ancho; x += 10) {
      
      let solapa = false;
      for (let otra of placa.piezasUbicadas) {
        if (
          x < otra.x + otra.ancho &&
          x + ancho > otra.x &&
          y < otra.y + otra.alto &&
          y + alto > otra.y
        ) {
          solapa = true;
          break;
        }
      }

      if (!solapa) {
        // Encontramos lugar físico estable
        placa.piezasUbicadas.push({
          ancho: ancho,
          alto: alto,
          x: x,
          y: y,
          rotada: rotada
        });
        return true;
      }
    }
  }
  return false;
}