import React, { useState } from 'react';
import { optimizarCortes } from './optimizador';
import './App.css';

function App() {
  const [piezas, setPiezas] = useState([]);
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [resultado, setResultado] = useState(null);

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
    const optimizacion = optimizarCortes(piezas);
    setResultado(optimizacion);
  };

  const hojasAgrupadas = resultado
    ? resultado.piezas.reduce((acc, pieza) => {
        if (!acc[pieza.hoja]) acc[pieza.hoja] = [];
        acc[pieza.hoja].push(pieza);
        return acc;
      }, {})
    : {};

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Graziano Vidrios - Optimizador</h2>
      
      <form onSubmit={agregarPieza} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block' }}>Ancho (mm):</label>
          <input type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} style={{ padding: '5px', width: '100px' }} />
        </div>
        <div>
          <label style={{ display: 'block' }}>Alto (mm):</label>
          <input type="number" value={alto} onChange={(e) => setAlto(e.target.value)} style={{ padding: '5px', width: '100px' }} />
        </div>
        <div>
          <label style={{ display: 'block' }}>Cantidad:</label>
          <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ padding: '5px', width: '70px' }} />
        </div>
        <button type="submit" style={{ padding: '6px 12px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Agregar Pieza
        </button>
      </form>

      {piezas.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Piezas cargadas:</h3>
          <ul>
            {piezas.map((p, index) => (
              <li key={p.id}>Vidrio {index + 1}: {p.ancho} x {p.alto} mm</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={procesarCortes} style={{ padding: '10px 15px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              Generar cortes
            </button>
            <button onClick={limpiarLista} style={{ padding: '10px 15px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Limpiar todo
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div style={{ marginTop: '30px' }}>
          <h3>Resultado de Optimización</h3>
          <p><strong>Placas de vidrio utilizadas:</strong> {Object.keys(hojasAgrupadas).length}</p>

          {Object.keys(hojasAgrupadas).map((numHoja) => (
            <div key={numHoja} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', background: '#f9f9f9' }}>
              <h4>Hoja N° {numHoja}</h4>
              <div style={{ 
                position: 'relative', 
                width: '720px', 
                height: '500px', 
                border: '3px solid #000', 
                backgroundColor: '#e0e0e0',
                marginBottom: '10px'
              }}>
                {hojasAgrupadas[numHoja].map((pieza, idx) => (
                  <div key={idx} style={{
                    position: 'absolute',
                    left: `${pieza.x / 5}px`,
                    top: `${pieza.y / 5}px`,
                    width: `${pieza.ancho / 5}px`,
                    height: `${pieza.alto / 5}px`,
                    backgroundColor: '#4dabf7',
                    border: '1px solid #0056b3',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    overflow: 'hidden'
                  }}>
                    {/* Mostramos las medidas reales para que el operario no se confunda */}
                    {Math.max(pieza.ancho, pieza.alto)}x{Math.min(pieza.ancho, pieza.alto)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;