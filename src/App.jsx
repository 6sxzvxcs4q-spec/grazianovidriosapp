import React, { useState } from 'react';

// --- ESTILOS UNIFICADOS ---
const styles = {
  container: { backgroundColor: '#111827', color: '#f3f4f6', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, sans-serif' },
  header: { borderBottom: '1px solid #374151', paddingBottom: '16px', marginBottom: '20px', textAlign: 'center' },
  nav: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' },
  tabButton: (active) => ({
    padding: '12px 24px', cursor: 'pointer', borderRadius: '8px', border: 'none', fontWeight: 'bold',
    backgroundColor: active ? '#2563eb' : '#374151', color: '#fff', transition: '0.3s'
  }),
  title: { fontSize: '28px', fontWeight: 'bold', color: '#60a5fa', margin: '0 0 4px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px', border: '1px solid #374151', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  input: { width: '100%', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px', marginTop: '10px' },
  button: { width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
  th: { textAlign: 'left', padding: '8px', borderBottom: '2px solid #4b5563', color: '#9ca3af', fontSize: '12px' },
  td: { padding: '8px', borderBottom: '1px solid #374151', fontSize: '14px' },
  mapaCorte: { position: 'relative', backgroundColor: '#0f172a', border: '2px solid #ef4444', margin: '16px auto', overflow: 'hidden', borderRadius: '4px' }
};

export default function App() {
  const [tab, setTab] = useState('optimizador'); // 'optimizador' o 'cotizador'

  // --- ESTADOS OPTIMIZADOR ---
  const [hojaAncho, setHojaAncho] = useState(3600);
  const [hojaAlto, setHojaAlto] = useState(2500);
  const [optAncho, setOptAncho] = useState('');
  const [optAlto, setOptAlto] = useState('');
  const [optCant, setOptCant] = useState(1);
  const [optPiezas, setOptPiezas] = useState([]);

  // --- ESTADOS COTIZADOR DVH ---
  const [dvhAncho, setDvhAncho] = useState('');
  const [dvhAlto, setDvhAlto] = useState('');
  const [dvhCant, setDvhCant] = useState(1);
  const [dvhV1, setDvhV1] = useState(4); // mm
  const [dvhCamara, setDvhCamara] = useState(9); // mm
  const [dvhV2, setDvhV2] = useState(4); // mm
  const [dvhLista, setDvhLista] = useState([]);

  // --- LÓGICA OPTIMIZADOR ---
  const agregarPiezaOpt = (e) => {
    e.preventDefault();
    const nuevas = Array.from({ length: optCant }, () => ({
      id: Date.now() + Math.random(),
      ancho: parseInt(optAncho), alto: parseInt(optAlto),
      etiqueta: `Vidrio ${optPiezas.length + 1}`
    }));
    setOptPiezas([...optPiezas, ...nuevas]);
    setOptAncho(''); setOptAlto(''); setOptCant(1);
  };

  const calcularOptimizacion = () => {
    let piezas = [...optPiezas].sort((a, b) => b.alto - a.alto);
    const hojas = [];
    while (piezas.length > 0) {
      const hoja = { piezas: [], utilizado: 0, y: 0 };
      while (hoja.y < hojaAlto && piezas.length > 0) {
        let x = 0, hFila = 0, fila = [];
        for (let i = 0; i < piezas.length; i++) {
          const p = piezas[i];
          if (x + p.ancho <= hojaAncho && hoja.y + p.alto <= hojaAlto) {
            fila.push({ ...p, x, y: hoja.y, aDisp: p.ancho, hDisp: p.alto });
            if (p.alto > hFila) hFila = p.alto;
            x += p.ancho; piezas.splice(i, 1); i--;
          } else if (x + p.alto <= hojaAncho && hoja.y + p.ancho <= hojaAlto) {
            fila.push({ ...p, x, y: hoja.y, aDisp: p.alto, hDisp: p.ancho, rot: true });
            if (p.ancho > hFila) hFila = p.ancho;
            x += p.alto; piezas.splice(i, 1); i--;
          }
        }
        if (fila.length > 0) { hoja.piezas.push(...fila); hoja.y += hFila; } else break;
      }
      const sup = hoja.piezas.reduce((s, p) => s + (p.ancho * p.alto), 0);
      hoja.utilizado = ((sup / (hojaAncho * hojaAlto)) * 100).toFixed(1);
      hojas.push(hoja);
    }
    return hojas;
  };

  // --- LÓGICA COTIZADOR DVH ---
  const agregarDvh = (e) => {
    e.preventDefault();
    const m2 = (dvhAncho * dvhAlto) / 1000000;
    const perim = ((parseInt(dvhAncho) + parseInt(dvhAlto)) * 2) / 1000;
    const peso = m2 * (parseInt(dvhV1) + parseInt(dvhV2)) * 2.5; // 2.5kg por mm por m2
    
    setDvhLista([...dvhLista, {
      id: Date.now(),
      ancho: dvhAncho, alto: dvhAlto, cant: dvhCant,
      comp: `${dvhV1}/${dvhCamara}/${dvhV2}`,
      m2: (m2 * dvhCant).toFixed(2),
      perim: (perim * dvhCant).toFixed(2),
      peso: (peso * dvhCant).toFixed(1)
    }]);
    setDvhAncho(''); setDvhAlto(''); setDvhCant(1);
  };

  const factorEscala = Math.min(280 / hojaAncho, 280 / hojaAlto);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Graziano Vidrios — Sistema Unificado</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Gestión de Taller y Presupuestos</p>
      </header>

      <nav style={styles.nav}>
        <button style={styles.tabButton(tab === 'optimizador')} onClick={() => setTab('optimizador')}>Optimizador de Corte</button>
        <button style={styles.tabButton(tab === 'cotizador')} onClick={() => setTab('cotizador')}>Cotizador de DVH</button>
      </nav>

      {tab === 'optimizador' ? (
        <div style={styles.grid}>
          {/* PANEL IZQUIERDO OPTIMIZADOR */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 15px 0', color: '#60a5fa' }}>Carga de Paños</h3>
            <form onSubmit={agregarPiezaOpt}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={styles.label}>Ancho (mm)</label><input type="number" style={styles.input} value={optAncho} onChange={e => setOptAncho(e.target.value)} required /></div>
                <div style={{ flex: 1 }}><label style={styles.label}>Alto (mm)</label><input type="number" style={styles.input} value={optAlto} onChange={e => setOptAlto(e.target.value)} required /></div>
              </div>
              <label style={styles.label}>Cantidad</label>
              <input type="number" style={styles.input} value={optCant} onChange={e => setOptCant(e.target.value)} min="1" />
              <button type="submit" style={styles.button}>+ Agregar a la lista</button>
            </form>
            <button onClick={() => setOptPiezas([])} style={{ ...styles.button, backgroundColor: '#4b5563', marginTop: '10px' }}>Limpiar Lista</button>
          </div>

          {/* PANEL DERECHO OPTIMIZADOR */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 15px 0', color: '#34d399' }}>Resultado de Optimización</h3>
            {calcularOptimizacion().map((hoja, i) => (
              <div key={i} style={{ backgroundColor: '#111827', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span>HOJA Nº {i + 1} (3600x2500)</span>
                  <span style={{ color: '#34d399' }}>Rendimiento: {hoja.utilizado}%</span>
                </div>
                <div style={{ ...styles.mapaCorte, width: hojaAncho * factorEscala, height: hojaAlto * factorEscala }}>
                  {hoja.piezas.map((p, idx) => (
                    <div key={idx} style={{
                      position: 'absolute', left: p.x * factorEscala, top: p.y * factorEscala,
                      width: p.aDisp * factorEscala, height: p.hDisp * factorEscala,
                      backgroundColor: `hsl(${(idx * 70) % 360}, 60%, 40%)`, border: '1px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold'
                    }}>{p.ancho}x{p.alto}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {/* PANEL IZQUIERDO COTIZADOR */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 15px 0', color: '#60a5fa' }}>Configuración DVH</h3>
            <form onSubmit={agregarDvh}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={styles.label}>Ancho (mm)</label><input type="number" style={styles.input} value={dvhAncho} onChange={e => setDvhAncho(e.target.value)} required /></div>
                <div style={{ flex: 1 }}><label style={styles.label}>Alto (mm)</label><input type="number" style={styles.input} value={dvhAlto} onChange={e => setDvhAlto(e.target.value)} required /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label style={styles.label}>Vidrio Exterior</label>
                  <select style={styles.input} value={dvhV1} onChange={e => setDvhV1(e.target.value)}>
                    <option value="4">Float 4mm</option><option value="5">Float 5mm</option><option value="6">Laminado 3+3</option><option value="8">Laminado 4+4</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={styles.label}>Cámara</label>
                  <select style={styles.input} value={dvhCamara} onChange={e => setDvhCamara(e.target.value)}>
                    <option value="6">6mm</option><option value="9">9mm</option><option value="12">12mm</option>
                  </select>
                </div>
              </div>
              <label style={styles.label}>Cantidad</label>
              <input type="number" style={styles.input} value={dvhCant} onChange={e => setDvhCant(e.target.value)} min="1" />
              <button type="submit" style={styles.button}>+ Agregar al presupuesto</button>
            </form>
          </div>

          {/* PANEL DERECHO COTIZADOR */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 15px 0', color: '#fbbf24' }}>Detalle de Presupuesto</h3>
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>Cant/Medida</th><th style={styles.th}>Composición</th><th style={styles.th}>m² / Peso</th></tr>
              </thead>
              <tbody>
                {dvhLista.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.cant} u. de {item.ancho}x{item.alto}</td>
                    <td style={styles.td}>{item.comp}</td>
                    <td style={styles.td}>{item.m2} m² — {item.peso} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dvhLista.length > 0 && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Superficie:</span><span style={{ fontWeight: 'bold' }}>{dvhLista.reduce((acc, i) => acc + parseFloat(i.m2), 0).toFixed(2)} m²</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span>Total Perímetro (Sellado):</span><span style={{ fontWeight: 'bold' }}>{dvhLista.reduce((acc, i) => acc + parseFloat(i.perim), 0).toFixed(2)} ml</span></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}