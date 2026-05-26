import React, { useState } from 'react';

// ==========================================
// 1. FUNCIONES LÓGICAS (Fuera del Componente)
// ==========================================

// Calculador Avanzado Desglosado de DVH - Graziano Vidrios
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

// Algoritmo de Optimización de Corte con Rotación Inteligente (Hojas de 3600x2500)
function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_HOJA = HOJA_ANCHO * HOJA_ALTO;
  
  let hojas = [];
  let pañosRestantes = [];

  // Desglosamos las cantidades en paños individuales
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      pañosRestantes.push({ ancho: p.ancho, alto: p.alto });
    }
  });

  // Ordenamos de mayor a menor área para mejorar la estrategia de acomodo (Max-Fit)
  pañosRestantes.sort((a, b) => (b.ancho * b.alto) - (a.ancho * a.alto));

  while (pañosRestantes.length > 0) {
    let hojaActual = { paños: [], areaUsada: 0, X_actual: 0, Y_actual: 0, altoFilaMax: 0 };
    let pañosQueNoEntraron = [];

    pañosRestantes.forEach(paño => {
      let anchoFinal = paño.ancho;
      let altoFinal = paño.alto;
      let entraNormal = (hojaActual.X_actual + anchoFinal <= HOJA_ANCHO) && (hojaActual.Y_actual + altoFinal <= HOJA_ALTO);
      let entraRotado = (hojaActual.X_actual + altoFinal <= HOJA_ANCHO) && (hojaActual.Y_actual + anchoFinal <= HOJA_ALTO);

      // Si no entra normal pero sí rotado, o si rotado aprovecha mejor el espacio, lo giramos
      if (!entraNormal && entraRotado) {
        anchoFinal = paño.alto;
        altoFinal = paño.ancho;
        entraNormal = true;
      } else if (entraNormal && entraRotado) {
        // Estrategia heurística: si entra de las dos formas, elegimos la que deje menos desperdicio horizontal en la fila
        if (anchoFinal < altoFinal) {
          anchoFinal = paño.alto;
          altoFinal = paño.ancho;
        }
      }

      // Verificamos si podemos acomodarlo en la posición definida
      if (entraNormal && (hojaActual.areaUsada + (anchoFinal * altoFinal) <= AREA_HOJA)) {
        hojaActual.paños.push({ 
          ancho: anchoFinal, 
          alto: altoFinal, 
          rotado: anchoFinal !== paño.ancho 
        });
        hojaActual.areaUsada += (anchoFinal * altoFinal);
        
        // Avanzamos el cursor virtual de corte
        hojaActual.X_actual += anchoFinal;
        if (altoFinal > hojaActual.altoFilaMax) {
          hojaActual.altoFilaMax = altoFinal;
        }

        // Si nos pasamos del ancho de la plancha, saltamos a la siguiente fila horizontal
        if (hojaActual.X_actual >= HOJA_ANCHO) {
          hojaActual.X_actual = 0;
          hojaActual.Y_actual += hojaActual.altoFilaMax;
          hojaActual.altoFilaMax = 0;
        }
      } else {
        pañosQueNoEntraron.push(paño);
      }
    });

    hojas.push({
      paños: hojaActual.paños,
      rendimiento: Number(((hojaActual.areaUsada / AREA_HOJA) * 100).toFixed(1))
    });

    if (pañosRestantes.length === pañosQueNoEntraron.length) {
      // Forzar salida si un paño excede los límites físicos de la plancha base
      break;
    }
    pañosRestantes = pañosQueNoEntraron;
  }

  return hojas;
}

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [pestana, setPestana] = useState('optimizador');

  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [vidrioExtTipo, setVidrioExtTipo] = useState('Float 4mm');
  const [camaraTipo, setCamaraTipo] = useState('9mm');

  const [listaOptimizador, setListaOptimizador] = useState([]);
  const [listaDVH, setListaDVH] = useState([]);

  const [precioVidrioExt, setPrecioVidrioExt] = useState('');
  const [precioVidrioInt, setPrecioVidrioInt] = useState('');
  const [precioCamara, setPrecioCamara] = useState('');
  const [desperdicio, setDesperdicio] = useState('15');

  const resultadosCorte = optimizarCortes(listaOptimizador);
  const resumenDVH = calcularObraDVH(listaDVH, precioVidrioExt, precioVidrioInt, precioCamara, desperdicio);

  const handleAgregarPaño = () => {
    if (!ancho || !alto || Number(cantidad) <= 0) return;

    const nuevoPaño = {
      id: Date.now(),
      ancho: Number(ancho),
      alto: Number(alto),
      cantidad: Number(cantidad),
      composicion: pestana === 'dvh' ? `${vidrioExtTipo} / ${camaraTipo} / ${vidrioExtTipo}` : 'Monolítico'
    };

    if (pestana === 'optimizador') {
      setListaOptimizador([...listaOptimizador, nuevoPaño]);
    } else {
      setListaDVH([...listaDVH, nuevoPaño]);
    }

    setAncho('');
    setAlto('');
    setCantidad('1');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#ffffff', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* Encabezado */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#58a6ff', margin: '0 0 5px 0', fontSize: '28px' }}>Graziano Vidrios — Sistema Unificado</h1>
        <p style={{ color: '#8b949e', margin: '0', fontSize: '16px' }}>Gestión de Taller y Presupuestos</p>
      </header>

      {/* Selectores de Pestaña */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => setPestana('optimizador')}
          style={{
            padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none',
            backgroundColor: pestana === 'optimizador' ? '#1f6feb' : '#21262d', color: '#ffffff'
          }}
        >
          Optimizador de Corte
        </button>
        <button 
          onClick={() => setPestana('dvh')}
          style={{
            padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none',
            backgroundColor: pestana === 'dvh' ? '#1f6feb' : '#21262d', color: '#ffffff'
          }}
        >
          Cotizador de DVH
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL ASIMÉTRICO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* COLUMNA IZQUIERDA: FORMULARIOS DE CARGA */}
        <div style={{ backgroundColor: '#161b22', padding: '25px', borderRadius: '8px', border: '1px solid #30363d', height: 'fit-content' }}>
          
          {pestana === 'optimizador' ? (
            <>
              <h2 style={{ color: '#58a6ff', marginTop: '0', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Carga de Paños</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Ancho (mm)</label>
                  <input type="number" value={ancho} onChange={e => setAncho(e.target.value)} style={inputEstilo} placeholder="0" />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Alto (mm)</label>
                  <input type="number" value={alto} onChange={e => setAlto(e.target.value)} style={inputEstilo} placeholder="0" />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#8b949e', fontSize: '12px' }}>Cantidad</label>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} style={inputEstilo} />
              </div>

              <button onClick={handleAgregarPaño} style={botonAzulEstilo}>+ Agregar a la lista</button>
              <button onClick={() => setListaOptimizador([])} style={botonGrisEstilo}>Limpiar Lista</button>
            </>
          ) : (
            <>
              <h2 style={{ color: '#58a6ff', marginTop: '0', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Configuración DVH</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Ancho (mm)</label>
                  <input type="number" value={ancho} onChange={e => setAncho(e.target.value)} style={inputEstilo} placeholder="0" />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Alto (mm)</label>
                  <input type="number" value={alto} onChange={e => setAlto(e.target.value)} style={inputEstilo} placeholder="0" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Vidrio Exterior / Interior</label>
                  <select value={vidrioExtTipo} onChange={e => setVidrioExtTipo(e.target.value)} style={inputEstilo}>
                    <option value="Float 4mm">Float 4mm</option>
                    <option value="Float 5mm">Float 5mm</option>
                    <option value="Float 6mm">Float 6mm</option>
                    <option value="Laminado 3+3">Laminado 3+3</option>
                    <option value="Laminado 4+4">Laminado 4+4</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '12px' }}>Cámara</label>
                  <select value={camaraTipo} onChange={e => setCamaraTipo(e.target.value)} style={inputEstilo}>
                    <option value="6mm">6mm</option>
                    <option value="9mm">9mm</option>
                    <option value="12mm">12mm</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#8b949e', fontSize: '12px' }}>Cantidad</label>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} style={inputEstilo} />
              </div>

              {/* SECCIÓN DE COSTOS DINÁMICOS */}
              <div style={{ borderTop: '1px solid #30363d', paddingTop: '15px', marginTop: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ color: '#ffb454', fontSize: '12px', fontWeight: 'bold' }}>Precio Vidrio Ext ($ / m²)</label>
                    <input type="number" value={precioVidrioExt} onChange={e => setPrecioVidrioExt(e.target.value)} style={inputEstiloCostos} placeholder="Ej: 45000" />
                  </div>
                  <div>
                    <label style={{ color: '#ffb454', fontSize: '12px', fontWeight: 'bold' }}>Precio Vidrio Int ($ / m²)</label>
                    <input type="number" value={precioVidrioInt} onChange={e => setPrecioVidrioInt(e.target.value)} style={inputEstiloCostos} placeholder="Ej: 42000" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ color: '#ffb454', fontSize: '12px', fontWeight: 'bold' }}>Precio Cámara ($ / ML)</label>
                    <input type="number" value={precioCamara} onChange={e => setPrecioCamara(e.target.value)} style={inputEstiloCostos} placeholder="Ej: 850" />
                  </div>
                  <div>
                    <label style={{ color: '#ffb454', fontSize: '12px', fontWeight: 'bold' }}>Desperdicio (%)</label>
                    <input type="number" value={desperdicio} onChange={e => setDesperdicio(e.target.value)} style={inputEstiloCostos} placeholder="15" />
                  </div>
                </div>
              </div>

              <button onClick={handleAgregarPaño} style={botonAzulEstilo}>+ Agregar al presupuesto</button>
              <button onClick={() => { setListaDVH([]); setPrecioVidrioExt(''); setPrecioVidrioInt(''); setPrecioCamara(''); setDesperdicio('15'); }} style={botonGrisEstilo}>Limpiar Lista y Precios</button>
            </>
          )}

        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div style={{ backgroundColor: '#161b22', padding: '25px', borderRadius: '8px', border: '1px solid #30363d' }}>
          
          {pestana === 'optimizador' ? (
            <>
              <h2 style={{ color: '#34d058', marginTop: '0', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Resultado de Optimización</h2>
              {listaOptimizador.length === 0 ? (
                <p style={{ color: '#8b949e', textAlign: 'center' }}>No hay paños en la lista de corte.</p>
              ) : (
                resultadosCorte.map((hoja, index) => (
                  <div key={index} style={{ border: '1px solid #30363d', borderRadius: '6px', padding: '15px', marginBottom: '20px', backgroundColor: '#0d1117' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>HOJA Nº {index + 1} (3600x2500)</span>
                      <span style={{ color: '#34d058', fontWeight: 'bold' }}>Rendimiento: {hoja.rendimiento} %</span>
                    </div>
                    <div style={{ width: '100%', minHeight: '180px', border: '1px solid #ff4444', position: 'relative', backgroundColor: '#0a0e14', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', padding: '10px', gap: '4px' }}>
                      {hoja.paños.map((p, pIdx) => (
                        <div key={pIdx} style={{ 
                          backgroundColor: p.rotado ? '#8a3ffc' : '#388bfd', 
                          border: '1px solid #fff', 
                          color: '#fff', 
                          fontSize: '10px', 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '4px', 
                          minWidth: '55px', 
                          height: '45px',
                          borderRadius: '2px'
                        }}>
                          <span>{p.ancho}x{p.alto}</span>
                          {p.rotated || p.rotado && <span style={{ fontSize: '8px', color: '#ffb454', fontWeight: 'bold' }}>[GIRADO]</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <h2 style={{ color: '#ffb454', marginTop: '0', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>Detalle de Presupuesto</h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #30363d', color: '#8b949e', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '10px' }}>Cant/Medida</th>
                    <th style={{ paddingBottom: '10px' }}>Composición</th>
                  </tr>
                </thead>
                <tbody>
                  {listaDVH.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ padding: '20px 0', color: '#8b949e', textAlign: 'center' }}>No hay elementos en el presupuesto.</td>
                    </tr>
                  ) : (
                    listaDVH.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #21262d' }}>
                        <td style={{ padding: '10px 0' }}>{item.cantidad} u. ({item.ancho} x {item.alto} mm)</td>
                        <td style={{ padding: '10px 0', color: '#8b949e' }}>{item.composicion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {listaDVH.length > 0 && (
                <div style={{ backgroundColor: '#0d1117', padding: '15px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#58a6ff', borderBottom: '1px solid #21262d', paddingBottom: '5px' }}>Resumen de Materiales</h3>
                  
                  <div style={filaResumenEstilo}>
                    <span>Total Paños:</span>
                    <span style={{ fontWeight: 'bold' }}>{resumenDVH.totalPaños} unidades</span>
                  </div>
                  <div style={filaResumenEstilo}>
                    <span>Total Vidrio Exterior:</span>
                    <span>{resumenDVH.totalM2VidrioExt} m²</span>
                  </div>
                  <div style={filaResumenEstilo}>
                    <span>Total Vidrio Interior:</span>
                    <span>{resumenDVH.totalM2VidrioInt} m²</span>
                  </div>
                  <div style={filaResumenEstilo}>
                    <span>Total Perfil Cámara:</span>
                    <span>{resumenDVH.totalMetrosPerfil} ML</span>
                  </div>

                  <h3 style={{ margin: '20px 0 12px 0', fontSize: '15px', color: '#ffb454', borderBottom: '1px solid #21262d', paddingBottom: '5px' }}>Análisis de Costos</h3>
                  
                  <div style={filaResumenEstilo}>
                    <span>Subtotal Insumos Netos:</span>
                    <span style={{ color: '#34d058' }}>$ {resumenDVH.costoSubtotalInsumos.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ ...filaResumenEstilo, fontSize: '16px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #30363d' }}>
                    <span style={{ fontWeight: 'bold', color: '#ffb454' }}>TOTAL (Con {desperdicio}% Desp.):</span>
                    <span style={{ fontWeight: 'bold', color: '#34d058', fontSize: '18px' }}>$ {resumenDVH.costoConDesperdicio.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ESTILOS EN LÍNEA (CSS-in-JS)
// ==========================================
const inputEstilo = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#21262d',
  border: '1px solid #30363d',
  borderRadius: '6px',
  color: '#ffffff',
  marginTop: '5px',
  boxSizing: 'border-box'
};

const inputEstiloCostos = {
  ...inputEstilo,
  backgroundColor: '#1c212a',
  border: '1px solid #444c56',
};

const botonAzulEstilo = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#1f6feb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginBottom: '10px',
  fontSize: '14px'
};

const botonGrisEstilo = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#21262d',
  color: '#f0f6fc',
  border: '1px solid #30363d',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px'
};

const filaResumenEstilo = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  fontSize: '13px',
  color: '#c9d1d9'
};