import React, { useState } from 'react';

// --- ESTILOS EN JAVASCRIPT PARA EVITAR ERRORES DE TAILWIND ---
const styles = {
  container: { backgroundColor: '#111827', color: '#f3f4f6', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' },
  header: { borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '24px', textAlign: 'center' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#60a5fa', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#9ca3af', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #374151' },
  cardTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#f3f4f6', display: 'flex', gap: '8px', alignItems: 'center' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '4px' },
  input: { width: '100%', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' },
  button: { width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '8px' },
  buttonDanger: { width: '100%', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
  th: { textAlign: 'left', padding: '8px', borderBottom: '2px solid #4b5563', color: '#9ca3af', fontSize: '13px' },
  td: { padding: '8px', borderBottom: '1px solid #374151', fontSize: '14px' },
  badge: { backgroundColor: '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  summaryBox: { backgroundColor: '#111827', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #374151' },
  hojaContenedor: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid #374151' },
  mapaCorte: { position: 'relative', backgroundColor: '#0f172a', border: '2px solid #ef4444', margin: '16px auto', overflow: 'hidden', borderRadius: '4px' }
};

export default function App() {
  const [hojaAncho, setHojaAncho] = useState(3600);
  const [hojaAlto, setHojaAlto] = useState(2500);

  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [etiqueta, setEtiqueta] = useState('');
  const [piezas, setPiezas] = useState([]);

  const agregarPieza = (e) => {
    e.preventDefault();
    if (!ancho || !alto || cantidad < 1) return;

    const nuevas = [];
    for (let i = 0; i < cantidad; i++) {
      nuevas.push({
        id: Date.now() + Math.random(),
        ancho: parseInt(ancho),
        alto: parseInt(alto),
        etiqueta: etiqueta.trim() || `Vidrio ${piezas.length + i + 1}`
      });
    }
    setPiezas([...piezas, ...nuevas]);
    setAncho('');
    setAlto('');
    setCantidad(1);
    setEtiqueta('');
  };

  const eliminarPieza = (id) => {
    setPiezas(piezas.filter(p => p.id !== id));
  };

  const limpiarTodo = () => {
    setPiezas([]);
  };

  // --- ALGORITMO DE CORTE OPTIMIZADO POR NIVELES (FILAS) ---
  const optimizarCortes = () => {
    // Ordenamos las piezas priorizando siempre el alto para armar filas prolijas
    let piezasPendientes = [...piezas].sort((a, b) => b.alto - a.alto);
    const hojasResultado = [];

    while (piezasPendientes.length > 0) {
      const piezasEnEstaHoja = [];
      let yActual = 0; // Altura actual en la plancha

      while (yActual < hojaAlto && piezasPendientes.length > 0) {
        // Buscamos la pieza más alta que quede para definir la altura de la fila actual
        let alturaFila = 0;
        let xActual = 0;
        let piezasFila = [];

        // Recorremos las piezas para ver cuáles entran en el ancho de esta fila
        for (let i = 0; i < piezasPendientes.length; i++) {
          const pieza = piezasPendientes[i];
          let anchoPieza = pieza.ancho;
          let altoPieza = pieza.alto;
          let seRoto = false;

          // Verificamos si entra normal en lo que queda de ancho y alto de la plancha
          let entraNormal = (xActual + anchoPieza <= hojaAncho) && (yActual + altoPieza <= hojaAlto);
          // Verificamos si entra mejor rotándola 90°
          let entraRotada = (xActual + altoPieza <= hojaAncho) && (yActual + anchoPieza <= hojaAlto);

          // Si entra de las dos formas, elegimos la orientación que mejor mantenga el flujo o la altura de la fila
          if (entraNormal || entraRotada) {
            // Si no entra normal pero sí rotada, la rotamos obligatoriamente
            if (!entraNormal && entraRotada) {
              anchoPieza = pieza.alto;
              altoPieza = pieza.ancho;
              seRoto = true;
            }

            // Guardamos la pieza posicionada en la fila
            piezasFila.push({
              ...pieza,
              x: xActual,
              y: yActual,
              anchoDisplay: anchoPieza,
              altoDisplay: altoPieza,
              rotada: seRoto
            });

            // Llevamos el control de la altura máxima de esta fila
            if (altoPieza > alturaFila) {
              alturaFila = altoPieza;
            }

            xActual += anchoPieza; // Avanzamos el diamante en el eje X
            piezasPendientes.splice(i, 1); // La sacamos de la lista
            i--; // Reajustamos índice
          }
        }

        // Si pudimos meter piezas en esta fila, las sumamos a la hoja y avanzamos en el eje Y
        if (piezasFila.length > 0) {
          piezasEnEstaHoja.push(...piezasFila);
          yActual += alturaFila; // La próxima fila arranca justo abajo
        } else {
          // Si no entró nada en toda la fila, rompemos para pasar a otra hoja nueva
          break;
        }
      }

      // Si la hoja tiene piezas, calculamos sus m² y desperdicio
      if (piezasEnEstaHoja.length > 0) {
        const supHoja = hojaAncho * hojaAlto;
        const supUtilizada = piezasEnEstaHoja.reduce((sum, p) => sum + (p.ancho * p.alto), 0);
        const porcentajeUtilizado = ((supUtilizada / supHoja) * 100).toFixed(1);
        const desperdicio = (100 - porcentajeUtilizado).toFixed(1);

        hojasResultado.push({
          piezas: piezasEnEstaHoja,
          utilizado: porcentajeUtilizado,
          desperdicio: desperdicio,
          m2Utilizados: (supUtilizada / 1000000).toFixed(2)
        });
      } else {
        // Evitar bucle infinito si una pieza es más grande que la plancha entera
        break;
      }
    }

    return hojasResultado;
  };

  const hojasOptimizadas = optimizarCortes();
  const totalM2Reales = piezas.reduce((sum, p) => sum + (p.ancho * p.alto) / 1000000, 0).toFixed(2);

  const escalaMax = 280; 
  const factorEscala = Math.min(escalaMax / hojaAncho, escalaMax / hojaAlto);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Optimización Real de Planchas de Vidrio</h1>
        <p style={styles.subtitle}>Graziano Vidrios SRL — Sistema de Taller Inteligente</p>
      </header>

      <div style={styles.grid}>
        {/* PANEL IZQUIERDO: CARGA */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>1. Medidas de la Hoja Base (mm)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Ancho (X)</label>
                <input type="number" style={styles.input} value={hojaAncho} onChange={e => setHojaAncho(parseInt(e.target.value) || 0)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Alto (Y)</label>
                <input type="number" style={styles.input} value={hojaAlto} onChange={e => setHojaAlto(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h3 style={styles.cardTitle}>2. Cargar Vidrios a Cortar</h3>
            <form onSubmit={agregarPieza}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Ancho (mm)</label>
                  <input type="number" style={styles.input} required value={ancho} onChange={e => setAncho(e.target.value)} placeholder="Ej: 1200" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Alto (mm)</label>
                  <input type="number" style={styles.input} required value={alto} onChange={e => setAlto(e.target.value)} placeholder="Ej: 800" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Cantidad</label>
                  <input type="number" style={styles.input} min="1" required value={cantidad} onChange={e => setCantidad(parseInt(e.target.value) || 1)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Nota / Etiqueta</label>
                  <input type="text" style={styles.input} value={etiqueta} onChange={e => setEtiqueta(e.target.value)} placeholder="Ej: Obra Martínez" />
                </div>
              </div>
              <button type="submit" style={styles.button}>+ Agregar a la Lista de Corte</button>
            </form>
          </div>

          {piezas.length > 0 && (
            <div style={{ ...styles.card, marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ ...styles.cardTitle, marginBottom: 0 }}>Vidrios en Espera ({piezas.length})</h3>
                <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>Total Neto: {totalM2Reales} m²</span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '12px' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Medidas (mm)</th>
                      <th style={styles.th}>Etiqueta</th>
                      <th style={styles.th}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piezas.map((p) => (
                      <tr key={p.id}>
                        <td style={styles.td}>{p.ancho} x {p.alto}</td>
                        <td style={styles.td}><span style={styles.badge}>{p.etiqueta}</span></td>
                        <td style={styles.td}>
                          <button onClick={() => eliminarPieza(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={limpiarTodo} style={styles.buttonDanger}>Limpiar Todo el Listado</button>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: MAPAS */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>3. Distribución y Hojas Necesarias</h3>
            {piezas.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', margin: '20px 0' }}>Cargá medidas a la izquierda para proyectar el mapa de corte.</p>
            ) : (
              <div>
                <div style={styles.summaryBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#60a5fa', marginBottom: '4px' }}>
                    <span>Planchas Requeridas:</span>
                    <span>{hojasOptimizadas.length} Hoja(s)</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Corte guillotina optimizado por niveles combinado de alta eficiencia.</div>
                </div>

                {hojasOptimizadas.map((hoja, index) => (
                  <div key={index} style={styles.hojaContenedor}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #4b5563', paddingBottom: '8px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: '#f3f4f6' }}>HOJA Nº {index + 1}</span>
                      <span style={{ color: '#34d399', fontSize: '14px', fontWeight: 'bold' }}>Rendimiento: {hoja.utilizado}%</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                      <span>Vidrio Útil: {hoja.m2Utilizados} m²</span>
                      <span style={{ color: '#f87171' }}>Desperdicio: {hoja.desperdicio}%</span>
                    </div>

                    {/* MAPA GRÁFICO ESCALADO DE LA PLANCHA */}
                    <div style={{
                      ...styles.mapaCorte,
                      width: `${hojaAncho * factorEscala}px`,
                      height: `${hojaAlto * factorEscala}px`
                    }}>
                      {hoja.piezas.map((p, pIdx) => (
                        <div key={p.id} style={{
                          position: 'absolute',
                          left: `${p.x * factorEscala}px`,
                          top: `${p.y * factorEscala}px`,
                          width: `${(p.anchoDisplay || p.ancho) * factorEscala}px`,
                          height: `${(p.altoDisplay || p.alto) * factorEscala}px`,
                          backgroundColor: `hsl(${(pIdx * 65) % 360}, 65%, 35%)`,
                          border: '1px solid rgba(255,255,255,0.4)',
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '2px',
                          overflow: 'hidden'
                        }}>
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap' }}>
                            {p.ancho}x{p.alto} {p.rotada ? '🔄' : ''}
                          </span>
                          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            {p.rotada ? '(Girado)' : p.etiqueta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}