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
  
  const [precioDVHM2, setPrecioDVHM2] = useState('');
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

  // Procesamos los números totales de la obra
  const totales = calcularObraDVH(listaPaños);

  // Cálculo del presupuesto comercial
  let totalPresupuesto = null;
  if (totales.totalM2Vidrio > 0 && precioDVHM2) {
    // Tomamos como base los m² totales de estructura DVH (área del paño completo)
    const m2EstructuraDVH = totales.totalM2Vidrio / 2; 
    const costoBase = m2EstructuraDVH * Number(precioDVHM2);
    const factorAjuste = 1 + (Number(porcentajeAjuste) / 100);
    const totalConAjuste = costoBase * factorAjuste;

    totalPresupuesto = totalConAjuste.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS'
    });
  }

  return (
    <div className="container">
      {/* Encabezado para Impresión / PDF */}
      <div className="print-header">
        <div className="header-logo-container">
          <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
          <div>
            <h1>Graziano Vidrios - Presupuesto de DVH</h1>
            <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>

      {/* Encabezado Pantalla */}
      <div className="app-header no-print">
        <img src="/logo.jpg" alt="Graziano Vidrios Logo" className="logo-app" onError={(e) => e.target.style.display='none'} />
        <h1>Calculador y Cotizador DVH - Graziano Vidrios</h1>
      </div>

      {/* Parámetros de Precios */}
      <div className="config-seccion no-print" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div className="input-group">
          <label><strong>Precio M² DVH base ($):</strong></label>
          <input 
            type="number" 
            value={precioDVHM2} 
            onChange={(e) => setPrecioDVHM2(e.target.value)} 
            placeholder="Ej: 75000"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '140px' }}
          />
        </div>
        <div className="input-group">
          <label><strong>Ajuste % (+ / -):</strong></label>
          <input 
            type="number" 
            value={porcentajeAjuste} 
            onChange={(e) => setPorcentajeAjuste(e.target.value)} 
            placeholder="Ej: 10"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '90px' }}
          />
        </div>
      </div>

      {/* Formulario de Carga de Paños */}
      <form onSubmit={agregarPaño} className="form-piezas no-print" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
          <div className="input-group">
            <label>Ancho (mm):</label>
            <input type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="Ej: 1200" />
          </div>
          <div className="input-group">
            <label>Alto (mm):</label>
            <input type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="Ej: 1100" />
          </div>
          <div className="input-group">
            <label>Cantidad:</label>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%', marginTop: '10px' }}>
          <div className="input-group">
            <label>Vidrio Ext:</label>
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
              <option value="6mm">6 mm</option>
              <option value="9mm">9 mm</option>
              <option value="12mm">12 mm</option>
            </select>
          </div>
          <div className="input-group">
            <label>Vidrio Int:</label>
            <select value={vidrioInt} onChange={(e) => setVidrioInt(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
              <option value="Float 4mm">Float 4mm</option>
              <option value="Float 5mm">Float 5mm</option>
              <option value="Float 6mm">Float 6mm</option>
              <option value="Laminado 3+3">Laminado 3+3</option>
              <option value="Laminado 4+4">Laminado 4+4</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-add" style={{ marginTop: '15px', width: '100%' }}>Agregar Paño a la Obra</button>
      </form>

      {/* Lista de Paños Cargados */}
      {listaPaños.length > 0 && (
        <div className="lista-seccion">
          <h3 className="no-print">Detalle de la Obra Cargada ({totales.totalPaños} paños):</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#102a43', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Cant</th>
                <th style={{ padding: '10px' }}>Medidas (mm)</th>
                <th style={{ padding: '10px' }}>Composición DVH</th>
                <th style={{ padding: '10px' }} className="no-print">Acción</th>
              </tr>
            </thead>
            <tbody>
              {listaPaños.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #ccc' }}>
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

          {/* Resumen de Materiales y Totales */}
          <div className="resumen-datos" style={{ backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #102a43' }}>
            <h2>Resumen General de Materiales (Kit)</h2>
            <p><strong>Total de estructuras DVH armadas:</strong> {totales.totalPaños} unidades</p>
            <p><strong>Vidrio neto a cortar (M² totales):</strong> {totales.totalM2Vidrio} m² <small style={{ color: '#555' }}>(Exterior + Interior)</small></p>
            <p><strong>Perfil de aluminio total necesario:</strong> {totales.totalMetrosPerfil} metros lineales</p>
            
            {totalPresupuesto && (
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px dashed #102a43' }}>
                {Number(porcentajeAjuste) !== 0 && (
                  <p style={{ fontSize: '14px', color: '#4a5568', margin: '0 0 5px 0' }}>Ajuste comercial: {Number(porcentajeAjuste) > 0 ? `+${porcentajeAjuste}` : porcentajeAjuste}%</p>
                )}
                <p style={{ fontSize: '24px', color: '#2f855a', margin: 0 }}>
                  <strong>PRESUPUESTO TOTAL: {totalPresupuesto}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="acciones-recuadro no-print" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button onClick={mandarAImprimir} className="btn-optimizar" style={{ flex: 1 }}>🖨️ Imprimir Presupuesto Cliente</button>
            <button onClick={limpiarObra} className="btn-limpiar">Borrar Toda la Obra</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;