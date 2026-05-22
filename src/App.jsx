import React, { useState } from 'react';
import { optimizarCortes } from './optimizador';
import './App.css';

function App() {
  const [piezas, setPiezas] = useState([]);
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precioM2, setPrecioM2] = useState(''); 
  const [porcentajeAjuste, setPorcentajeAjuste] = useState('0'); // Estado para el % (+/-)
  const [resultado, setResultado] = useState(null);
  const [placaSeleccionada, setPlacaSeleccionada] = useState("3600x2500");

  const agregarPieza = (e) => {
    e.preventDefault();
    if (!ancho || !alto || Number(cantidad) <= 0) return;

    const nuevasPiezas = [];
    for (let i = 0; i < Number(cantidad); i++) {
      nuevasPiezas.push({
        id: Date.now() + Math.random(),
        ancho: Number(ancho),
        alto: Number(alto),
      });
    }

    setPiezas([...piezas, ...nuevasPiezas]);
    setAncho('');
    setAlto('');
    setCantidad('1');
  };

  const limpiarLista = () => {
    setPiezas([]);
    setResultado(null);
  };

  const procesarCortes = () => {
    if (piezas.length === 0) return;
    const [pAncho, pAlto] = placaSeleccionada.split('x').map(Number);
    const optimizacion = optimizarCortes(piezas, pAncho, pAlto);
    setResultado(optimizacion);
  };

  const mandarAImprimir = () => {
    window.print();
  };

  // LÓGICA DE PRESUPUESTO FLEXIBLE
  let totalPresupuesto = null;
  if (resultado && precioM2) {
    const costoBase = resultado.areaTotalHojasM2 * Number(precioM2);
    const factorAjuste = 1 + (Number(porcentajeAjuste) / 100);
    const totalConAjuste = costoBase * factorAjuste;
    
    totalPresupuesto = totalConAjuste.toLocaleString('es-AR', { 
      style: 'currency', 
      currency: 'ARS' 
    });
  }

  return (
    <div className="container">
      {/* Encabezado exclusivo para el PDF impreso */}
      <div className="print-header">
        <div className="header-logo-container">
          <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
          <div>
            <h1>Graziano Vidrios - Plano de Corte</h1>
            <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>

      {/* Encabezado para la pantalla de la computadora */}
      <div className="app-header no-print">
        <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
        <h1>Optimizador de Placas - Graziano Vidrios</h1>
      </div>
      
      {/* SECCIÓN CONFIGURACIÓN COMPLETA */}
      <div className="config-seccion no-print" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div className="input-group">
          <label><strong>Medida de la Placa Estándar:</strong></label>
          <select value={placaSeleccionada} onChange={(e) => setPlacaSeleccionada(e.target.value)} className="select-perfil">
            <option value="3600x2500">3600 x 2500 mm</option>
            <option value="1600x2500">1600 x 2500 mm</option>
            <option value="1600x3000">1600 x 3000 mm</option>
            <option value="3600x2250">3600 x 2250 mm</option>
          </select>
        </div>
        
        <div className="input-group">
          <label><strong>Precio M² ($):</strong></label>
          <input 
            type="number" 
            value={precioM2} 
            onChange={(e) => setPrecioM2(e.target.value)} 
            placeholder="Ej: 45000"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '130px' }}
          />
        </div>

        <div className="input-group">
          <label><strong>Ajuste % (+ ó -):</strong></label>
          <input 
            type="number" 
            value={porcentajeAjuste} 
            onChange={(e) => setPorcentajeAjuste(e.target.value)} 
            placeholder="Ej: 10 o -5"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
          />
          <small style={{ display: 'block', color: '#666', fontSize: '11px' }}>Use - para descuento</small>
        </div>
      </div>

      <form onSubmit={agregarPieza} className="form-piezas no-print">
        <div className="input-group">
          <label>Ancho (mm):</label>
          <input type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="Ej: 500" />
        </div>
        <div className="input-group">
          <label>Alto (mm):</label>
          <input type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="Ej: 800" />
        </div>
        <div className="input-group">
          <label>Cantidad:</label>
          <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
        </div>
        <button type="submit" className="btn-add">Agregar Pieza</button>
      </form>

      {piezas.length > 0 && (
        <div className="lista-seccion no-print">
          <h3>Piezas cargadas ({piezas.length}):</h3>
          <ul className="lista-piezas">
            {piezas.map((p, idx) => (
              <li key={p.id}>#{idx + 1}: {p.ancho} x {p.alto} mm</li>
            ))}
          </ul>
          <div className="acciones-recuadro">
            <button onClick={procesarCortes} className="btn-optimizar">Optimizar e Imprimir Croquis</button>
            <button onClick={limpiarLista} className="btn-limpiar">Limpiar Todo</button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="resultado-seccion">
          <h2>Resultado de la Optimización</h2>
          <div className="resumen-datos" style={{ backgroundColor: '#ebf8ff', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #2b6cb0' }}>
            <p><strong>Placas totales necesarias:</strong> {resultado.barrasUsadas}</p>
            <p><strong>Desperdicio estimado del corte:</strong> {resultado.desperdicioTotal}</p>
            <p style={{ marginTop: '10px', fontSize: '16px', color: '#2c5282' }}>
              <strong>M² totales de las placas:</strong> {resultado.areaTotalHojasM2.toFixed(2)} m²
            </p>
            {totalPresupuesto && (
              <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #bee3f8' }}>
                {Number(porcentajeAjuste) !== 0 && (
                  <p style={{ fontSize: '14px', color: '#4a5568', margin: '0 0 5px 0' }}>
                    Ajuste aplicado: {Number(porcentajeAjuste) > 0 ? `+${porcentajeAjuste}` : porcentajeAjuste}%
                  </p>
                )}
                <p style={{ fontSize: '22px', color: '#2f855a', margin: 0 }}>
                  <strong>VALOR TOTAL: {totalPresupuesto}</strong>
                </p>
              </div>
            )}
          </div>
          
          <button onClick={mandarAImprimir} className="btn-print no-print" style={{ marginTop: '15px' }}>
            🖨️ Imprimir / Guardar PDF
          </button>
          
          <h3 className="titulo-croquis">Croquis de distribución por Placa:</h3>
          {resultado.detalles.map((placa, i) => {
            const escala = 0.18; 
            return (
              <div key={i} className="placa-contenedor-grafico" style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                <h4>Placa N° {i + 1} ({placa.ancho}x{placa.alto} mm)</h4>
                
                <div style={{
                  position: 'relative',
                  width: `${placa.ancho * escala}px`,
                  height: `${placa.alto * escala}px`,
                  backgroundColor: '#f0f4f8',
                  border: '3px solid #102a43',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  {placa.piezasUbicadas.map((pieza, idx) => (
                    <div key={idx} style={{
                      position: 'absolute',
                      left: `${pieza.x * escala}px`,
                      top: `${pieza.y * escala}px`,
                      width: `${pieza.ancho * escala}px`,
                      height: `${pieza.alto * escala}px`,
                      backgroundColor: '#1982c4',
                      border: '1px solid #023e8a',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      padding: '2px'
                    }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        textAlign: 'center'
                      }}>
                        {pieza.ancho}x{pieza.alto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;