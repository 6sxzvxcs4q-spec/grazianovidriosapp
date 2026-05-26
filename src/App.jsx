import React, { useState } from 'react';
import { Plus, Trash2, Layers, Percent, Square, RefreshCw } from 'lucide-react';

// ==========================================
// LÓGICA DEL OPTIMIZADOR (Tu función original)
// ==========================================
export function optimizarCortes(piezas, placaAncho, placaAlto) {
  if (piezas.length === 0) return { barrasUsadas: 0, desperdicioTotal: "0% (0.00 m²)", detalles: [], areaTotalHojasM2: 0 };

  const lotes = [];
  piezas.forEach(pieza => {
    const loteExistente = lotes.find(l => 
      (l.ancho === pieza.ancho && l.alto === pieza.alto) || 
      (l.ancho === pieza.alto && l.alto === pieza.ancho)
    );
    if (loteExistente) {
      loteExistente.cantidad++;
    } else {
      lotes.push({ ancho: pieza.ancho, alto: pieza.alto, cantidad: 1 });
    }
  });

  const placas = [];
  let areaVidriosNetoM2 = 0;

  lotes.forEach(lote => {
    areaVidriosNetoM2 += ((lote.ancho * lote.alto) / 1000000) * lote.cantidad;

    const cantPorColA = Math.floor(placaAlto / lote.alto);
    const cantPorFilaA = Math.floor(placaAncho / lote.ancho);
    const totalA = cantPorColA * cantPorFilaA;

    const cantPorColB = Math.floor(placaAlto / lote.ancho);
    const cantPorFilaB = Math.floor(placaAncho / lote.alto);
    const totalB = cantPorColB * cantPorFilaB;

    let usarRotado = false;
    if (totalB > totalA) {
      usarRotado = true;
    } else if (totalB === totalA) {
      if ((placaAlto % lote.ancho) < (placaAlto % lote.alto)) usarRotado = true;
    }

    const anchoFinal = usarRotado ? lote.alto : lote.ancho;
    const altoFinal = usarRotado ? lote.ancho : lote.alto;

    for (let i = 0; i < lote.cantidad; i++) {
      let ubicada = false;

      for (let placa of placas) {
        if (acomodarEnPlacaVertical(placa, anchoFinal, altoFinal, usarRotado)) {
          ubicada = true;
          break;
        }
      }

      if (!ubicada) {
        const nuevaPlaca = {
          ancho: placaAncho,
          alto: placaAlto,
          piezasUbicadas: [],
          columnas: []
        };
        acomodarEnPlacaVertical(nuevaPlaca, anchoFinal, altoFinal, usarRotado);
        placas.push(nuevaPlaca);
      }
    }
  });

  const areaPlacaTotal = placas.length * (placaAncho * placaAlto);
  const areaUtilizadaTotal = placas.reduce((acc, p) => {
    return acc + p.piezasUbicadas.reduce((sum, pz) => sum + (pz.ancho * pz.alto), 0);
  }, 0);
  
  const areaDesperdicio = areaPlacaTotal - areaUtilizadaTotal;
  const porcentajeDesperdicio = ((areaDesperdicio / areaPlacaTotal) * 100).toFixed(1);
  const metrosDesperdicio = (areaDesperdicio / 1000000).toFixed(2);

  return {
    barrasUsadas: placas.length,
    desperdicioTotal: `${porcentajeDesperdicio}% (${metrosDesperdicio} m²)`,
    detalles: placas,
    areaTotalHojasM2: areaVidriosNetoM2
  };
}

function acomodarEnPlacaVertical(placa, ancho, alto, rotada) {
  for (let col of placa.columnas) {
    if (ancho <= col.ancho && (col.yActual + alto) <= placa.alto) {
      placa.piezasUbicadas.push({
        ancho: ancho,
        alto: alto,
        x: col.x,
        y: col.yActual,
        rotada: rotada
      });
      col.yActual += alto;
      return true;
    }
  }

  const xSiguiente = placa.columnas.length > 0 
    ? placa.columnas[placa.columnas.length - 1].x + placa.columnas[placa.columnas.length - 1].ancho
    : 0;

  if (xSiguiente + ancho <= placa.ancho && alto <= placa.alto) {
    placa.columnas.push({ x: xSiguiente, ancho: ancho, yActual: alto });
    placa.piezasUbicadas.push({
      ancho: ancho,
      alto: alto,
      x: xSiguiente,
      y: 0,
      rotada: rotada
    });
    return true;
  }

  return false;
}

// ==========================================
// COMPONENTE PRINCIPAL APP
// ==========================================
export default function App() {
  // Medidas por defecto de la plancha de vidrio estándar (en mm)
  const [placaAncho, setPlacaAncho] = useState(3210);
  const [placaAlto, setPlacaAlto] = useState(2400);

  // Estados para el formulario de piezas
  const [piezas, setPiezas] = useState([]);
  const [anchoInput, setAnchoInput] = useState('');
  const [altoInput, setAltoInput] = useState('');
  const [cantInput, setCantInput] = useState('1');

  // Agregar piezas a la lista
  const agregarPiezas = (e) => {
    e.preventDefault();
    if (!anchoInput || !altoInput || parseInt(cantInput) <= 0) return;

    const nuevasPiezas = [];
    for (let i = 0; i < parseInt(cantInput); i++) {
      nuevasPiezas.push({
        id: Date.now() + Math.random(),
        ancho: parseInt(anchoInput),
        alto: parseInt(altoInput)
      });
    }

    setPiezas([...piezas, ...nuevasPiezas]);
    setAnchoInput('');
    setAltoInput('');
    setCantInput('1');
  };

  // Eliminar una pieza individual de la lista
  const eliminarPieza = (id) => {
    setPiezas(piezas.filter(p => p.id !== id));
  };

  // Limpiar toda la carga
  const limpiarTodo = () => {
    setPiezas([]);
  };

  // Ejecutar el optimizador con los datos actuales
  const resultado = optimizarCortes(piezas, placaAncho, placaAlto);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 tracking-tight">Graziano Vidrios</h1>
          <p className="text-gray-400 text-sm">Optimizador Limpio por M² Reales</p>
        </div>
        {piezas.length > 0 && (
          <button 
            onClick={limpiarTodo}
            className="flex items-center gap-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 px-4 py-2 rounded-lg text-sm transition-all border border-red-800"
          >
            <RefreshCw size={16} /> Limpiar Todo
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN Y CARGA */}
        <div className="space-y-6 lg:col-span-1">
          {/* Medidas de la Placa */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-blue-300 flex items-center gap-2">
              <Square size={18} /> Medidas de la Hoja (mm)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Ancho (X)</label>
                <input 
                  type="number" 
                  value={placaAncho} 
                  onChange={(e) => setPlacaAncho(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Alto (Y)</label>
                <input 
                  type="number" 
                  value={placaAlto} 
                  onChange={(e) => setPlacaAlto(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Formulario de Carga */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
              <Plus size={18} /> Cargar Vidrios a Cortar
            </h2>
            <form onSubmit={agregarPiezas} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Ancho (mm)</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 1200"
                    value={anchoInput} 
                    onChange={(e) => setAnchoInput(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Alto (mm)</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 800"
                    value={altoInput} 
                    onChange={(e) => setAltoInput(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Cantidad de piezas</label>
                <input 
                  type="number" 
                  min="1"
                  value={cantInput} 
                  onChange={(e) => setCantInput(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Agregar a la Lista
              </button>
            </form>
          </div>

          {/* Lista de Piezas Cargadas */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg max-h-80 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Piezas en espera ({piezas.length})
            </h3>
            {piezas.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay piezas cargadas aún.</p>
            ) : (
              <div className="space-y-2">
                {piezas.map((pieza) => (
                  <div key={pieza.id} className="flex justify-between items-center bg-gray-900 p-2.5 rounded border border-gray-800 text-sm">
                    <span>{pieza.ancho} x {pieza.alto} mm</span>
                    <button 
                      onClick={() => eliminarPieza(pieza.id)} 
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS DE OPTIMIZACIÓN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de Resumen Numérico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-950 to-gray-800 p-5 rounded-xl border border-blue-900 shadow-md">
              <div className="text-blue-400 mb-1 flex items-center gap-2 text-sm font-medium">
                <Layers size={16} /> Hojas Necesarias
              </div>
              <div className="text-3xl font-bold">{resultado.barrasUsadas}</div>
              <p className="text-xs text-gray-400 mt-1">Placas de {placaAncho}x{placaAlto}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-950 to-gray-800 p-5 rounded-xl border border-emerald-900 shadow-md">
              <div className="text-emerald-400 mb-1 flex items-center gap-2 text-sm font-medium">
                <Square size={16} /> Superficie Neta
              </div>
              <div className="text-3xl font-bold">{resultado.areaTotalHojasM2.toFixed(2)} m²</div>
              <p className="text-xs text-gray-400 mt-1">Suma de m² reales de vidrio</p>
            </div>

            <div className="bg-gradient-to-br from-amber-950 to-gray-800 p-5 rounded-xl border border-amber-900 shadow-md">
              <div className="text-amber-400 mb-1 flex items-center gap-2 text-sm font-medium">
                <Percent size={16} /> Desperdicio Total
              </div>
              <div className="text-3xl font-bold text-amber-300">{resultado.desperdicioTotal.split(' ')[0]}</div>
              <p className="text-xs text-gray-400 mt-1">Equivale a {resultado.desperdicioTotal.split(' ')[1] || '0.00'} m²</p>
            </div>
          </div>

          {/* Detalle Visual/Esquema de las Placas */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Esquema de Distribución por Hoja</h2>
            {resultado.detalles.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
                Cargá piezas a la izquierda para ver la distribución del corte.
              </div>
            ) : (
              <div className="space-y-8">
                {resultado.detalles.map((placa, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
                    <h3 className="text-sm font-medium text-blue-400 mb-3">Hoja N° {index + 1}</h3>
                    
                    {/* Contenedor proporcional del vidrio */}
                    <div 
                      className="relative bg-gray-900 border-2 border-gray-600 rounded mx-auto overflow-hidden shadow-inner"
                      style={{
                        width: '100%',
                        aspectRatio: `${placaAncho} / ${placaAlto}`,
                        maxWidth: '500px'
                      }}
                    >
                      {/* Dibujo de las piezas ubicadas dentro de la placa */}
                      {placa.piezasUbicadas.map((pz, pzIdx) => {
                        // Calculamos porcentajes relativos para el renderizado CSS
                        const pctX = (pz.x / placaAncho) * 100;
                        const pctY = (pz.y / placaAlto) * 100;
                        const pctW = (pz.ancho / placaAncho) * 100;
                        const pctH = (pz.alto / placaAlto) * 100;

                        return (
                          <div
                            key={pzIdx}
                            className="absolute border border-blue-500 bg-blue-500/20 text-[9px] font-bold text-blue-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-blue-500/40"
                            style={{
                              left: `${pctX}%`,
                              top: `${pctY}%`,
                              width: `${pctW}%`,
                              height: `${pctH}%`,
                            }}
                            title={`${pz.ancho}x${pz.alto}mm ${pz.rotada ? '(Rotado)' : ''}`}
                          >
                            <span>{pz.ancho}</span>
                            <span className="text-[7px] text-gray-400">x</span>
                            <span>{pz.alto}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-2">
                      Piezas en esta hoja: {placa.piezasUbicadas.length}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}