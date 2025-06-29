import React, { useState, useEffect } from 'react';
import './filtros.css';

const UbicacionFilter = ({
  titulo = "Filtrar por Ubicación",
  onSeleccionUbicacion = null,
  mostrarMapa = false,
  tipoEntidad = null, // 'atractivos', 'empresas', o null para ambos
}) => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionesFiltradas, setUbicacionesFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar todas las ubicaciones al inicio
  useEffect(() => {
    const fetchUbicaciones = async () => {
      setCargando(true);
      try {
        const url = tipoEntidad 
          ? `http://localhost:3000/api/ubicaciones?tipo=${tipoEntidad}`
          : 'http://localhost:3000/api/ubicaciones';
          
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
          throw new Error('Error al cargar ubicaciones');
        }
        
        const data = await respuesta.json();
        setUbicaciones(data);
        setUbicacionesFiltradas(data);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener ubicaciones:", error);
        setError('No se pudieron cargar las ubicaciones');
        setCargando(false);
      }
    };
    
    fetchUbicaciones();
  }, [tipoEntidad]);
  
  // Filtrar ubicaciones al escribir
  useEffect(() => {
    if (busqueda.trim() === '') {
      setUbicacionesFiltradas(ubicaciones);
      return;
    }
    
    const busquedaLower = busqueda.toLowerCase();
    const filtradas = ubicaciones.filter(ubicacion => 
      ubicacion.direccion.toLowerCase().includes(busquedaLower)
    );
    
    setUbicacionesFiltradas(filtradas);
  }, [busqueda, ubicaciones]);
  
  // Manejar clic en ubicación
  const handleUbicacionClick = (ubicacion) => {
    setUbicacionSeleccionada(ubicacion);
    
    if (onSeleccionUbicacion) {
      onSeleccionUbicacion(ubicacion);
    }
  };
  
  // Limpiar filtro de ubicación
  const limpiarSeleccion = () => {
    setUbicacionSeleccionada(null);
    setBusqueda('');
    
    if (onSeleccionUbicacion) {
      onSeleccionUbicacion(null);
    }
  };
  
  // Determinar si la ubicación está cerca usando la API de geolocalización
  const buscarUbicacionesCercanas = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }
    
    setCargando(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const radio = 10; // 10 km de radio
          
          const url = tipoEntidad
            ? `http://localhost:3000/api/ubicaciones/cercanas?lat=${latitude}&lng=${longitude}&radio=${radio}&tipo=${tipoEntidad}`
            : `http://localhost:3000/api/ubicaciones/cercanas?lat=${latitude}&lng=${longitude}&radio=${radio}`;
          
          const respuesta = await fetch(url);
          
          if (!respuesta.ok) {
            throw new Error('Error al buscar ubicaciones cercanas');
          }
          
          const data = await respuesta.json();
          setUbicacionesFiltradas(data);
          setCargando(false);
        } catch (error) {
          console.error("Error al obtener ubicaciones cercanas:", error);
          setError('No se pudieron cargar las ubicaciones cercanas');
          setCargando(false);
        }
      },
      (error) => {
        setCargando(false);
        setError("Error al obtener tu ubicación");
        console.error("Error de geolocalización:", error);
      }
    );
  };
  
  return (
    <div className="ubicacion-filter">
      <h3 className="filtro-titulo">{titulo}</h3>
      
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar por dirección..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="ubicacion-input"
        />
        <button 
          onClick={buscarUbicacionesCercanas} 
          className="btn-cerca"
          title="Encontrar ubicaciones cercanas a mí"
        >
          <span role="img" aria-label="ubicación">📍</span> Cerca de mí
        </button>
      </div>
      
      {ubicacionSeleccionada && (
        <div className="seleccion-actual">
          <p>Ubicación seleccionada: <strong>{ubicacionSeleccionada.direccion}</strong></p>
          <button onClick={limpiarSeleccion} className="btn-limpiar">Limpiar</button>
        </div>
      )}
      
      {error && <p className="error-mensaje">{error}</p>}
      
      {cargando ? (
        <p className="cargando">Cargando ubicaciones...</p>
      ) : (
        <div className="ubicaciones-lista">
          {ubicacionesFiltradas.length === 0 ? (
            <p className="no-resultados">No se encontraron ubicaciones</p>
          ) : (
            <ul>
              {ubicacionesFiltradas.map((ubicacion, index) => (
                <li 
                  key={`${ubicacion.direccion}-${index}`}
                  className={ubicacionSeleccionada?.direccion === ubicacion.direccion ? 'seleccionada' : ''}
                  onClick={() => handleUbicacionClick(ubicacion)}
                >
                  <span className="ubicacion-direccion">{ubicacion.direccion}</span>
                  <span className="ubicacion-fuente">
                    {ubicacion.fuente === 'empresas' ? '🏢' : '🏛️'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {mostrarMapa && ubicaciones.length > 0 && (
        <div className="mapa-container">
          <p><em>Nota: La visualización del mapa está desactivada en esta versión.</em></p>
        </div>
      )}
    </div>
  );
};

export default UbicacionFilter;
