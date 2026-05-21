export function optimizarCortes(piezas) {
  const ANCHO_PLANCHA = 3600;
  const ALTO_PLANCHA = 2600;

  let cortes = [];
  let x = 0;
  let y = 0;
  let filaAltura = 0;

  piezas.forEach((pieza) => {
    const ancho = Number(pieza.ancho);
    const alto = Number(pieza.alto);
    const cantidad = Number(pieza.cantidad);

    for (let i = 0; i < cantidad; i++) {
      if (x + ancho > ANCHO_PLANCHA) {
        x = 0;
        y += filaAltura;
        filaAltura = 0;
      }

      if (y + alto > ALTO_PLANCHA) {
        continue;
      }

      cortes.push({
        ...pieza,
        x,
        y,
      });

      x += ancho;

      if (alto > filaAltura) {
        filaAltura = alto;
      }
    }
  });

  return cortes;
}