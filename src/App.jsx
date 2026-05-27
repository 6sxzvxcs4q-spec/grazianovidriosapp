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

// Algoritmo de Corte Guillotina 2D con Rotación Inteligente
function optimizarCortes(listaPaños) {
  const HOJA_ANCHO = 3600;
  const HOJA_ALTO = 2500;
  const AREA_TOTAL_HOJA = HOJA_ANCHO * HOJA_ALTO;

  let todosPaños = [];
  listaPaños.forEach(p => {
    for (let i = 0; i < p.cantidad; i++) {
      todosPaños.push({ id: `${p.id}-${i}`, ancho: p.ancho, alto: p.alto });
    }
  });

  // Ordenamos de mayor a menor por el lado más largo (Estrategia clásica de taller)
  todosPaños.sort((a, b) => Math.max(b.ancho, b.alto) - Math.max(a.ancho, a.alto));

  let hojas = [];

  todosPaños.forEach(paño => {
    let acomodado = false;

    // Intentar meter en hojas existentes
    for (let hoja of hojas) {
      for (let espacio de hoja.espaciosLibres) {
        let w = paño.ancho;
        let h = paño.alto;
        let rotado = false;

        let encajaNormal = (w <= espacio.w && h <= espacio.h);
        let encajaRotado = (h <= espacio.w && w <= espacio.h);

        if (!encajaNormal && !encajaRotado) continue;

        // Decidir orientación ideal para dejar el remanente más largo
        if (encajaRotado && (!encajaNormal || (espacio.w - h > espacio.w - w))) {
          w = paño.alto;
          h = paño.ancho;
          rotado = true;
        }

        // Registrar el paño con coordenadas reales dentro del contenedor visual
        hoja.paños.push({
          ancho: w,
          alto: h,
          x: espacio.x,
          y: espacio.y,
          rotado: rotado
        });

        hoja.areaUsada += (w * h);

        // Dividir el espacio remanente usando corte guillotina limpio
        let espaciosNuevos = [];
        if (espacio.w - w > 0) {
          espaciosNuevos.push({ x: espacio.x + w, y: espacio.y, w: espacio.w - w, h: h });
        }
        if (espacio.h - h > 0) {
          espaciosNuevos.push({ x: espacio.x, y: espacio.y + h, w: espacio.w, h: espacio.h - h });
        }

        // Remover el espacio viejo y sumar los dos nuevos sectores disponibles
        hoja.espaciosLibres = hoja.espaciosLibres.filter(e => e !== espacio).concat(espaciosNuevos);
        
        // Reordenar espacios libres más chicos primero para aprovechar retazos
        hoja.espaciosLibres.sort((a, b) => (a.w * a.h) - (b.w * b.h));

        acomodado = true;
        break;
      }
      if (acomodado) break;
    }

    // Si no entró en ninguna hoja, abrimos una plancha nueva de 3600x2500
    if (!acomodado) {
      let w = paño.ancho;
      let h = paño.alto;
      let rotado = false;

      // Si de parado aprovecha mejor la base de la hoja, lo rotamos al entrar
      if (h <= HOJA_ANCHO && w <= HOJA_ALTO && h > w) {
        w = paño.alto;
        h = paño.ancho;
        rotado = true;
      }

      let nuevaHoja = {
        paños: [{ ancho: w, alto: h, x: 0, y: 0, rotado: rotado }],
        areaUsada: w * h,
        espaciosLibres: []
      };

      if (HOJA_ANCHO - w > 0) nuevaHoja.espaciosLibres.push({ x: w, y: 0, w: HOJA_ANCHO - w, h: h });
      if (HOJA_ALTO - h > 0) nuevaHoja.espaciosLibres.push({ x: 0, y: h, w: HOJA_ANCHO, h: HOJA_ALTO - h });

      hojas.push(nuevaHoja);
    }
  });

  return hojas.map(h => ({
    paños: h.paños,
    rendimiento: Number(((h.areaUsada / AREA_TOTAL_HOJA) * 100).toFixed(1))
  }));
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

  // ESTADOS DE COSTOS DVH (Asegurados)
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

              {/* AQUÍ VOLVIERON LOS COSTOS DVH COMPLETOS */}
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

        {/* COLUMNA DERECHA: RESULTADOS MAPEADOS A ESCALA VIRTUAL */}
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
                    
                    {/* CONTENEDOR CON COORDENADAS ABSOLUTAS PROPORCIONALES */}
                    <div style={{ 
                      width: '100%', 
                      paddingBottom: '69.4%', /* Proporción exacta de 2500/3600 */
                      border: '2px dashed #ff4444', 
                      position: 'relative', 
                      backgroundColor: '#0a0e14', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      {hoja.paños.map((p, pIdx) => {
                        // Convertimos las coordenadas de milímetros a porcentajes de la hoja base
                        const leftPct = (p.x / 3600) * 100;
                        const topPct = (p.y / 2500) * 100;
                        const widthPct = (p.ancho / 3600) * 100;
                        const heightPct = (p.alto / 2500) * 100;

                        return (
                          <div key={pIdx} style={{ 
                            position: 'absolute',
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                            backgroundColor: p.rotado ? '#8a3ffc' : '#388bfd', 
                            border: '1px solid #ffffff', 
                            color: '#ffffff', 
                            boxSizing: 'border-box',
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: 'calc(4px + 0.4vw)',
                            overflow: 'hidden',
                            lineHeight: '1.1'
                          }}>
                            <span style={{ fontWeight: 'bold' }}>{p.ancho}x{p.alto}</span>
                            {p.rotado && <span style={{ fontSize: '7px', color: '#ffb454' }}>[GIRADO]</span>}
                          </div>
                        );
                      })}
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