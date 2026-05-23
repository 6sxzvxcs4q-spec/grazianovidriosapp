import React, { useState } from 'react';
import { calcularObraDVH } from './dvhCalculador';
import './App.css';

function App() {
  const [listaPaños, setListaPaños] = useState([]);
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [vidrioExt, setVidrioExt] = useState('Float 4mm');
  const [camara, setCamara] = useState('9mm');
  const [vidrioInt, setVidrioInt] = useState('Float 4mm');
  
  // PRECIOS A ELECCIÓN
  const [precioVidrioExt, setPrecioVidrioExt] = useState('');
  const [precioVidrioInt, setPrecioVidrioInt] = useState('');
  const [precioCamaraML, setPrecioCamaraML] = useState('');
  const [porcentajeAjuste, setPorcentajeAjuste] = useState('0');

  const agregarPaño = (e) => {
    e.preventDefault();
    if (!ancho || !alto || Number(cantidad) <= 0) return;

    const nuevoPaño = {
      id: Date.now() + Math.random(),
      ancho: Number(ancho),
      alto: Number(alto),
      cantidad: Number(cantidad),
      vidrioExt,
      camara,
      vidrioInt
    };

    setListaPaños([...listaPaños, nuevoPaño]);
    setAncho('');
    setAlto('');
    setCantidad('1');
  };

  const eliminarPaño = (id) => {
    setListaPaños(listaPaños.filter(p => p.id !== id));
  };

  const limpiarObra = () => {
    setListaPaños([]);
  };

  const mandarAImprimir = () => {
    window.print();
  };

  // Procesamos los números y costos desglosados de la obra
  const totales = calcularObraDVH(listaPaños, precioVidrioExt, precioVidrioInt, precioCamaraML);

  // Cálculo del presupuesto comercial definitivo
  let totalPresupuestoFinal = null;
  if (totales.costoConDesperdicio > 0) {
    const factorAjusteComercial = 1 + (Number(porcentajeAjuste) / 100);
    const presupuestoFinal = totales.costoConDesperdicio * factorAjusteComercial;

    totalPresupuestoFinal = presupuestoFinal.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  }

  return (
    <div className="container">
      {/* Encabezado exclusivo para Impresión / PDF */}
      <div className="print-header">
        <div className="header-logo-container">
          <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
          <div>
            <h1>Graziano Vidrios - Presupuesto Técnico DVH</h1>
            <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>

      {/* Encabezado en Pantalla */}
      <div className="app-header no-print">
        <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
        <h1>Cotizador Desglosado DVH - Graziano Vidrios</h1>
      </div>

      {/* PANEL DE PRECIOS A ELECCIÓN */}
      <div className="config-seccion no-print" style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>Configuración de Precios ($)</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="input-group">
            <label>Precio Vidrio Ext. M²:</label>
            <input type="number" value={precioVidrioExt} onChange={(e) => setPrecioVidrioExt(e.target.value)} placeholder="Ej: 25000" style={{ padding: '6px', width: '110px' }} />
          </div>
          <div className="input-group">
            <label>Precio Vidrio Int. M²:</label>
            <input type="number" value={precioVidrioInt} onChange={(e) => setPrecioVidrioInt(e.target.value)} placeholder="Ej: 25000" style={{ padding: '6px', width: '110px' }} />
          </div>
          <div className="input-group">
            <label>Precio Cámara ML:</label>
            <input type="number" value={precioCamaraML} onChange={(e) => setPrecioCamaraML(e.target.value)} placeholder="Ej: 8000" style={{ padding: '6px', width: '110px' }} />
          </div>
          <div className="input-group">
            <label>Ajuste Comercial % (+/-):</label>
            <input type="number" value={porcentajeAjuste} onChange={(e) => setPorcentajeAjuste(e.target.value)} placeholder="Ej: 10" style={{ padding: '6px', width: '90px' }} />
          </div>
        </div>
      </div>

      {/* FORMULARIO DE CARGA CONTINUA (PARA IR AGREGANDO MEDIDAS) */}
      <form onSubmit={agregarPaño} className="form-piezas no-print" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
          <div className="input-group">
            <label>Ancho (mm):</label>
            <input type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="Ej: 1200" required />
          </div>
          <div className="input-group">
            <label>Alto (mm):</label>
            <input type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="Ej: 1100" required />
          </div>
          <div className="input-group">
            <label>Cantidad:</label>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%', marginTop: '10px' }}>
          <div className="input-group">
            <label>Vidrio Exterior:</label>
            <select value={vidrioExt} onChange={(e) => setVidrioExt(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              <option value="Float 4mm">Float 4mm</option>
              <option value="Float 5mm">Float 5mm</option>
              <option value="Float 6mm">Float 6mm</option>
              <option value="Laminado 3+3">Laminado 3+3</option>
              <option value="Laminado 4+4">Laminado 4+4</option>
            </select>
          </div>
          <div className="input-group">
            <label>Cámara:</label>
            <select value={camara} onChange={(e) => setCamara(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              <option value="6mm">Cámara 6mm</option>
              <option value="9mm">Cámara 9mm</option>
              <option value="12mm">Cámara 12mm</option>
            </select>
          </div>
          <div className="input-group">
            <label>Vidrio Interior:</label>
            <select value={vidrioInt} onChange={(e) => setVidrioInt(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              <option value="Float 4mm">Float 4mm</option>
              <option value="Float 5mm">Float 5mm</option>
              <option value="Float 6mm">Float 6mm</option>
              <option value="Laminado 3+3">Laminado 3+3</option>
              <option value="Laminado 4+4">Laminado 4+4</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-add" style={{ marginTop: '15px', width: '100%' }}>Agregar Paño a la Lista</button>
      </form>

      {/* TABLA DE LA OBRA COMPLETA */}
      {listaPaños.length > 0 && (
        <div className="lista-seccion">
          <h3>Detalle de la Obra ({totales.totalPaños} posiciones):</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
            <thead>
              <tr style={{ backgroundColor: '#102a43', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Cant</th>
                <th style={{ padding: '10px' }}>Medidas (mm)</th>
                <th style={{ padding: '10px' }}>Estructura DVH</th>
                <th style={{ padding: '10px' }} className="no-print">Acción</th>
              </tr>
            </thead>
            <tbody>
              {listaPaños.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}><strong>{p.cantidad}</strong></td>
                  <td style={{ padding: '10px' }}>{p.ancho} x {p.alto} mm</td>
                  <td style={{ padding: '10px' }}><span style={{ color: '#023e8a', fontWeight: '500' }}>{p.vidrioExt} + C{p.camara} + {p.vidrioInt}</span></td>
                  <td style={{ padding: '10px' }} className="no-print">
                    <button onClick={() => eliminarPaño(p.id)} style={{ backgroundColor: '#e63946', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DESGLOSE Y PRESUPUESTO FINAL CON EL 15% INCLUIDO */}
          <div className="resumen-datos" style={{ backgroundColor: '#ebf8ff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #2b6cb0' }}>
            <h2 style={{ color: '#2c5282', marginTop: 0 }}>Cómputo Técnico y Resumen</h2>
            <p><strong>Unidades totales a fabricar:</strong> {totales.totalPaños} paños</p>
            <p><strong>M² Netos Vidrio Exterior:</strong> {totales.totalM2VidrioExt} m²</p>
            <p><strong>M² Netos Vidrio Interior:</strong> {totales.totalM2VidrioInt} m²</p>
            <p><strong>Metros lineales de Cámara/Perfil:</strong> {totales.totalMetrosPerfil} ML</p>
            <p style={{ color: '#4a5568', fontSize: '13px', fontStyle: 'italic', marginTop: '5px' }}>
              * El sistema incluye automáticamente un +15% por desperdicio de corte en los valores finales.
            </p>
            
            {totalPresupuestoFinal && (
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px dashed #bee3f8' }}>
                {Number(porcentajeAjuste) !== 0 && (
                  <p style={{ fontSize: '14px', color: '#4a5568', margin: '0 0 5px 0' }}> Margen de Obra: {Number(porcentajeAjuste) > 0 ? `+${porcentajeAjuste}` : porcentajeAjuste}%</p>
                )}
                <p style={{ fontSize: '26px', color: '#2f855a', margin: 0 }}>
                  <strong>PRESUPUESTO FINAL TOTAL: {totalPresupuestoFinal}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="acciones-recuadro no-print" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button onClick={mandarAImprimir} className="btn-optimizar" style={{ flex: 1, padding: '12px', fontSize: '16px' }}>
              🖨️ Imprimir / Guardar PDF
            </button>
            <button onClick={limpiarObra} className="btn-limpiar">Borrar Todo</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;