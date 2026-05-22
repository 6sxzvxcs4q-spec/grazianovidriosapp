import React, { useState } from 'react';
import { optimizarCortes } from './optimizador';
import './App.css';

function App() {
  const [piezas, setPiezas] = useState([]);
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [resultado, setResultado] = useState(null);
  
  // Guardamos la placa seleccionada como un objeto {ancho, alto}
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

  return (
    <div className="container">
      <h1>Optimizador de Placas - Graziano Vidrios</h1>
      
      <div className="config-seccion">
        <label><strong>Medida de la Placa Estándar:</strong></label>
        <select 
          value={placaSeleccionada} 
          onChange={(e) => setPlacaSeleccionada(e.target.value)}
          className="select-perfil"
        >
          <option value="3600x2500">3600 x 2500 mm</option>
          <option value="1600x2500">1600 x 2500 mm</option>
          <option value="1600x3000">1600 x 3000 mm</option>
          <option value="3600x2250">3600 x 2250 mm</option>
        </select>
      </div>

      <form onSubmit={agregarPieza} className="form-piezas">
        <div className="input-group">
          <label>Ancho del Vidrio (mm):</label>
          <input type="number" value={ancho} onChange={(e) => setAncho(e.target.value)} placeholder="Ej: 500" />
        </div>
        <div className="input-group">
          <label>Alto del Vidrio (mm):</label>
          <input type="number" value={alto} onChange={(e) => setAlto(e.target.value)} placeholder="Ej: 800" />
        </div>
        <div className="input-group">
          <label>Cantidad:</label>
          <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
        </div>
        <button type="submit" className="btn-add">Agregar Pieza</button>
      </form>

      {piezas.length > 0 && (
        <div className="lista-seccion">
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
          <p><strong>Placas totales necesarias:</strong> {resultado.barrasUsadas}</p>
          <p><strong>Desperdicio estimado:</strong> {resultado.desperdicioTotal}</p>
          
          <h3>Croquis de distribución por Placa:</h3>
          {resultado.detalles.map((placa, i) => {
            // Escala visual para que el dibujo quepa en la pantalla del celular o pc
            const escala = 0.15; 
            return (
              <div key={i} className="placa-contenedor-grafico" style={{ marginBottom: '30px' }}>
                <h4>Placa N° {i + 1} ({placa.ancho}x{placa.alto} mm)</h4>
                
                {/* Contenedor que simula la placa de vidrio de fondo */}
                <div style={{
                  position: 'relative',
                  width: `${placa.ancho * escala}px`,
                  height: `${placa.alto * escala}px`,
                  backgroundColor: '#e0f2f1',
                  border: '2px solid #004d40',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  {/* Dibujar cada vidrio recortado adentro */}
                  {placa.piezasUbicadas.map((pieza, idx) => (
                    <div key={idx} style={{
                      position: 'absolute',
                      left: `${pieza.x * escala}px`,
                      top: `${pieza.y * escala}px`,
                      width: `${pieza.ancho * escala}px`,
                      height: `${pieza.alto * escala}px`,
                      backgroundColor: '#4db6ac',
                      border: '1px solid #00796b',
                      color: 'white',
                      fontSize: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <span>{pieza.ancho}x{pieza.alto}</span>
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