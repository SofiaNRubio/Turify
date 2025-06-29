import React, { useState, useEffect } from 'react';
import './filtros.css';

/**
 * Componente de filtro por ubicación que muestra todas las ubicaciones/distritos disponibles
 * como checkboxes para permitir filtrar el contenido en cualquier página.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.titulo="Ubicación"] - Título del panel de filtro
 * @param {Function} [props.onUbicacionesChange] - Callback cuando cambian las ubicaciones seleccionadas
 * @param {Array} [props.ubicacionesPreseleccionadas=[]] - Ubicaciones que vienen preseleccionadas
 * @param {string} [props.className=""] - Clases CSS adicionales para el contenedor
 * @param {boolean} [props.mostrarAgregarFaltantes=false] - Si se muestra la opción para sugerir ubicaciones faltantes
 * @returns {JSX.Element} Componente de filtrado por ubicaciones
 */
const FiltroPorUbicacion = ({
  titulo = "Ubicación",
  onUbicacionesChange = null,
  ubicacionesPreseleccionadas = [],
  className = "",
  mostrarAgregarFaltantes = true
}) => {
  // Estado para las ubicaciones disponibles y seleccionadas
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionesSeleccionadas, setUbicacionesSeleccionadas] = useState([...ubicacionesPreseleccionadas]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(true); // El panel inicia abierto por defecto
  
  // Obtener ubicaciones de la API al montar el componente
  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        setCargando(true);
        
        // Volvemos a usar la URL absoluta mientras se soluciona el problema de autenticación
        const API_URL = 'http://localhost:3000/api/ubicaciones';
        console.log("Intentando conectar a:", API_URL);
        
        // Realizamos la petición a la nueva API de ubicaciones con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
        
        const respuesta = await fetch(API_URL, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log("Código de estado:", respuesta.status);
        
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status} ${respuesta.statusText}`);
        }
        
        const data = await respuesta.json();
        console.log("Datos recibidos:", data ? `${data.length} ubicaciones` : "Sin datos");
        
        // Extraemos solo las direcciones únicas y las ordenamos alfabéticamente
        const ubicacionesUnicas = [...new Set(data.map(item => item.direccion))].sort();
        console.log("Ubicaciones únicas:", ubicacionesUnicas.length);
        
        setUbicaciones(ubicacionesUnicas);
        setCargando(false);
      } catch (err) {
        console.error("Error detallado al obtener las ubicaciones:", err);
        
        // Mensaje más descriptivo según el tipo de error
        if (err.name === 'AbortError') {
          setError('Tiempo de espera agotado. Compruebe si el servidor está en ejecución.');
        } else if (err.message.includes('Failed to fetch')) {
          setError('No se puede conectar al servidor. ¿Está el backend en ejecución?');
        } else if (err.message.includes('401')) {
          setError(`Error de autenticación con la base de datos. Verifique el token de Turso.`);
        } else {
          // Intentamos obtener más detalles si el error viene con una respuesta completa
          try {
            const errorDetails = JSON.parse(err.message.split(': ')[1]);
            setError(`Error: ${errorDetails.error || err.message}`);
            console.log("Detalles del error:", errorDetails);
          } catch {
            setError(`No se pudieron cargar las ubicaciones: ${err.message}`);
          }
        }
        
        setCargando(false);
      }
    };
    
    cargarUbicaciones();
  }, []);
  
  // Manejar cambio en un checkbox de ubicación
  const toggleUbicacion = (ubicacion) => {
    setUbicacionesSeleccionadas(prev => {
      // Si ya está seleccionada, la quitamos; sino, la agregamos
      const nuevasSeleccionadas = prev.includes(ubicacion)
        ? prev.filter(u => u !== ubicacion)
        : [...prev, ubicacion];
        
      // Si hay callback, lo llamamos con las nuevas ubicaciones seleccionadas
      if (onUbicacionesChange) {
        onUbicacionesChange(nuevasSeleccionadas);
      }
      
      // Emitir un evento personalizado para que cualquier componente padre pueda escuchar
      // los cambios en las ubicaciones seleccionadas
      if (typeof document !== 'undefined') {
        const evento = new CustomEvent('cambioUbicaciones', {
          detail: nuevasSeleccionadas,
          bubbles: true
        });
        document.getElementById('filtro-ubicaciones')?.dispatchEvent(evento);
      }
      
      return nuevasSeleccionadas;
    });
  };
  
  return (
    <div className={`filtro-ubicacion ${className}`}>
      <div className="filtro-panel">
        {/* Cabecera con flecha desplegable */}
        <div 
          className="filtro-header" 
          onClick={() => setAbierto(!abierto)}
        >
          <span className={`flecha-toggle ${abierto ? 'abierto' : ''}`}>▼</span>
          <h3 className="filtro-titulo">{titulo}</h3>
        </div>
        
        {/* Contenido desplegable */}
        {abierto && (
          <div className="filtro-contenido">
            {cargando ? (
              <p className="filtro-cargando">Cargando ubicaciones...</p>
            ) : error ? (
              <p className="filtro-error">{error}</p>
            ) : (
              <div className="opciones-filtro">
                {ubicaciones.length === 0 ? (
                  <p className="sin-opciones">No hay ubicaciones disponibles</p>
                ) : (
                  <div className="lista-ubicaciones">
                    {ubicaciones.map((ubicacion, index) => (
                      <label key={index} className="opcion-filtro">
                        <input
                          type="checkbox"
                          checked={ubicacionesSeleccionadas.includes(ubicacion)}
                          onChange={() => toggleUbicacion(ubicacion)}
                        />
                        {ubicacion}
                      </label>
                    ))}
                    
                    {/* Opción para agregar ubicaciones que faltan */}
                    {mostrarAgregarFaltantes && (
                      <div className="agregar-ubicacion">
                        <label className="opcion-filtro opcion-agregar">
                          <input type="checkbox" disabled />
                          <span className="texto-agregar">Agregar los que faltan</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltroPorUbicacion;
