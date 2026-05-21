import React, { useState } from 'react';
import { optimizarCortes } from './optimizador';
import './App.css';

function App() {
  const [piezas, setPiezas] = useState([]);
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [resultado, setResultado] = useState(null);
  
  // Estado para la longitud de la barra del perfil
  const [largoPerfil, setLargoPerfil] = useState('3600');

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
    // Usamos el largo de perfil seleccionado (3600, 1100 o 1000)
    const optimizacion = optimizarCortes(piezas, Number(largoPerfil));
    setResultado(optimizacion);
  };

  return (
    <div className="container">
      <h1>Optimizador de Cortes - Graziano Vidrios</h1>
      
      <div className="config-seccion">
        <label><strong>Longitud de la barra de perfil:</strong></label>
        <select 
          value={largoPerfil} 
          onChange={(e) => setLargoPerfil(e.target.value)}
          className="select-perfil"
        >
          <option value="3600">3600 mm (Estándar)</option>
          <option value="1100">1100 mm</option>
          <option value="1000">1000 mm</option>
        </select>
      </div>

      <form onSubmit={agregarPieza} className="form-piezas">
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
        <div className="lista-seccion">
          <h3>Piezas a cortar ({piezas.length}):</h3>
          <ul className="lista-piezas">
            {piezas.map((p, idx) => (
              <li key={p.id}>#{idx + 1}: {p.ancho} x {p.alto} mm</li>
            ))}
          </ul>
          <div className="acciones-recuadro">
            <button onClick={procesarCortes} className="btn-optimizar">Optimizar Cortes</button>
            <button onClick={limpiarLista} className="btn-limpiar">Limpiar Todo</button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="resultado-seccion">
          <h2>Resultado del Cálculo</h2>
          <p><strong>Barras de {largoPerfil}mm necesarias:</strong> {resultado.barrasUsadas}</p>
          <p><strong>Desperdicio total:</strong> {resultado.desperdicioTotal} mm</p>
          
          <h3>Detalle por Barra:</h3>
          {resultado.detalles.map((barra, i) => (
            <div key={i} className="barra-item">
              <h4>Barra {i + 1}:</h4>
              <p>Cortes realizados: {barra.cortes.join('mm, ')}mm</p>
              <p>Sobrante de esta barra: {barra.sobrante} mm</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;