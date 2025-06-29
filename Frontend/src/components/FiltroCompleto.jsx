import React, { useState, useEffect } from 'react';
import UbicacionFilter from './UbicacionFilter';
import './filtros.css';

/**
 * Componente combinado que integra FiltroPanelReact con UbicacionFilter
 * para proporcionar una experiencia de filtrado completa.
 */
const FiltroCompleto = ({
  entidadPorDefecto = "atractivos",
  mostrarSelectorEntidad = true,
  tipoPreseleccionado = "",
  categoriaPreseleccionada = "",
  titulo = "Filtros",
  mostrarUbicaciones = true
}) => {
  const [entidad, setEntidad] = useState(entidadPorDefecto);
  const [filtros, setFiltros] = useState({
    categorias: categoriaPreseleccionada ? [categoriaPreseleccionada] : [],
    tipos: tipoPreseleccionado ? [tipoPreseleccionado] : [],
    ubicacion: null
  });
  const [opcionesCategoria, setOpcionesCategoria] = useState([]);
  const [opcionesTipo, setOpcionesTipo] = useState([]);
  const [resultados, setResultados] = useState({
    empresas: [],
    atractivos: [],
    rutas: []
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // Cargar opciones de filtrado al iniciar
  useEffect(() => {
    fetch("http://localhost:3000/api/filtros")
      .then(res => res.json())
      .then(data => {
        setOpcionesCategoria(data.categorias || []);
        setOpcionesTipo(data.empresas || []); // Usamos empresas como tipos
      })
      .catch(err => {
        console.error("Error al cargar opciones de filtro:", err);
        setError("No se pudieron cargar las opciones de filtro");
      });
  }, []);
  
  // Efecto para aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [entidad, filtros]);
  
  // Función para aplicar los filtros y realizar la búsqueda
  const aplicarFiltros = async () => {
    setCargando(true);
    setError(null);
    
    try {
      // Construir URL de búsqueda con los parámetros actuales
      const params = new URLSearchParams();
      params.append('entidad', entidad);
      
      // Agregar categorías si hay seleccionadas y estamos buscando atractivos
      if (entidad === 'atractivos' && filtros.categorias.length > 0) {
        params.append('categoria', filtros.categorias[0]);
      }
      
      // Agregar tipos si hay seleccionados y estamos buscando empresas
      if (entidad === 'empresas' && filtros.tipos.length > 0) {
        params.append('tipo', filtros.tipos[0]);
      }
      
      // Agregar ubicación si está seleccionada
      if (filtros.ubicacion) {
        params.append('ubicacion', filtros.ubicacion.direccion);
      }
      
      const url = `http://localhost:3000/api/busqueda?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al realizar la búsqueda');
      }
      
      const data = await response.json();
      setResultados(data);
      
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
      setError("Ocurrió un error al buscar resultados");
    } finally {
      setCargando(false);
    }
  };
  
  // Manejar cambio de entidad
  const handleEntidadChange = (nuevaEntidad) => {
    setEntidad(nuevaEntidad);
    setFiltros({
      categorias: [],
      tipos: [],
      ubicacion: null
    });
  };
  
  // Manejar cambio de categoría
  const toggleCategoria = (categoria) => {
    setFiltros(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoria) 
        ? prev.categorias.filter(c => c !== categoria)
        : [categoria] // Solo permitimos una categoría a la vez
    }));
  };
  
  // Manejar cambio de tipo
  const toggleTipo = (tipo) => {
    setFiltros(prev => ({
      ...prev,
      tipos: prev.tipos.includes(tipo) 
        ? prev.tipos.filter(t => t !== tipo)
        : [tipo] // Solo permitimos un tipo a la vez
    }));
  };
  
  // Manejar selección de ubicación
  const handleUbicacionSelect = (ubicacion) => {
    setFiltros(prev => ({
      ...prev,
      ubicacion
    }));
  };
  
  return (
    <div className="filtro-completo-container">
      <div className="filtros-columna">
        <div className="filtro-panel">
          <h3 className="filtro-titulo">{titulo}</h3>
          
          {/* Selector de Entidad */}
          {mostrarSelectorEntidad && (
            <div className="filtro-seccion">
              <h4>Tipo de Contenido</h4>
              <div className="opciones-radio">
                {['atractivos', 'empresas', 'rutas'].map(opcion => (
                  <label key={opcion}>
                    <input
                      type="radio"
                      name="entidad"
                      value={opcion}
                      checked={entidad === opcion}
                      onChange={() => handleEntidadChange(opcion)}
                    />
                    {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Filtro por Categoría (solo para atractivos) */}
          {entidad === 'atractivos' && opcionesCategoria.length > 0 && (
            <div className="filtro-seccion">
              <h4>Categorías</h4>
              <div className="opciones-check">
                {opcionesCategoria.map((categoria, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      value={categoria}
                      checked={filtros.categorias.includes(categoria)}
                      onChange={() => toggleCategoria(categoria)}
                    />
                    {categoria}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Filtro por Tipo (solo para empresas) */}
          {entidad === 'empresas' && opcionesTipo.length > 0 && (
            <div className="filtro-seccion">
              <h4>Tipos de Empresa</h4>
              <div className="opciones-check">
                {opcionesTipo.map((tipo, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      value={tipo}
                      checked={filtros.tipos.includes(tipo)}
                      onChange={() => toggleTipo(tipo)}
                    />
                    {tipo}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Filtro de Ubicación */}
        {mostrarUbicaciones && (
          <div className="ubicacion-container">
            <UbicacionFilter
              titulo="Ubicación"
              tipoEntidad={entidad === 'todos' ? null : entidad}
              onSeleccionUbicacion={handleUbicacionSelect}
            />
          </div>
        )}
      </div>
      
      {/* Resultados */}
      <div className="resultados-container">
        {cargando ? (
          <div className="cargando-resultados">
            <p>Cargando resultados...</p>
          </div>
        ) : error ? (
          <div className="error-resultados">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h3 className="resultados-titulo">
              {getEntidadLabel(entidad)} encontrados: {getResultCount(resultados, entidad)}
            </h3>
            
            <div className="resultados-grid">
              {renderResultados(resultados, entidad)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Funciones auxiliares para el renderizado de resultados
const getEntidadLabel = (entidad) => {
  switch(entidad) {
    case 'atractivos': return 'Atractivos';
    case 'empresas': return 'Empresas';
    case 'rutas': return 'Rutas';
    default: return 'Elementos';
  }
};

const getResultCount = (resultados, entidad) => {
  if (entidad === 'atractivos') return resultados.atractivos?.length || 0;
  if (entidad === 'empresas') return resultados.empresas?.length || 0;
  if (entidad === 'rutas') return resultados.rutas?.length || 0;
  
  // Si es 'todos', sumamos todos los resultados
  return (resultados.atractivos?.length || 0) + 
         (resultados.empresas?.length || 0) + 
         (resultados.rutas?.length || 0);
};

const renderResultados = (resultados, entidad) => {
  // Si no hay resultados en ninguna categoría
  if (!resultados.atractivos?.length && !resultados.empresas?.length && !resultados.rutas?.length) {
    return <p className="sin-resultados">No se encontraron resultados para tu búsqueda.</p>;
  }
  
  // Renderizado según el tipo seleccionado
  if (entidad === 'atractivos' && resultados.atractivos) {
    return resultados.atractivos.map(renderAtractivo);
  }
  
  if (entidad === 'empresas' && resultados.empresas) {
    return resultados.empresas.map(renderEmpresa);
  }
  
  if (entidad === 'rutas' && resultados.rutas) {
    return resultados.rutas.map(renderRuta);
  }
  
  // En caso de mostrar todos, agrupamos por tipo
  return (
    <>
      {resultados.atractivos?.map(renderAtractivo)}
      {resultados.empresas?.map(renderEmpresa)}
      {resultados.rutas?.map(renderRuta)}
    </>
  );
};

const renderAtractivo = (atractivo) => (
  <div key={atractivo.id} className="resultado-card">
    <div className="resultado-imagen">
      {/* Placeholder para imagen */}
      <div className="imagen-placeholder">
        <span>🏛️</span>
      </div>
    </div>
    <div className="resultado-contenido">
      <h4>{atractivo.nombre}</h4>
      <p className="tipo-tag">Atractivo</p>
      {atractivo.categoria_nombre && <p className="categoria-tag">{atractivo.categoria_nombre}</p>}
      {atractivo.direccion && <p className="direccion">{atractivo.direccion}</p>}
      <p className="descripcion">{atractivo.descripcion?.substring(0, 100)}...</p>
    </div>
  </div>
);

const renderEmpresa = (empresa) => (
  <div key={empresa.id} className="resultado-card">
    <div className="resultado-imagen">
      {/* Placeholder para imagen */}
      <div className="imagen-placeholder">
        <span>🏢</span>
      </div>
    </div>
    <div className="resultado-contenido">
      <h4>{empresa.nombre}</h4>
      <p className="tipo-tag">Empresa</p>
      {empresa.tipo && <p className="categoria-tag">{empresa.tipo}</p>}
      {empresa.direccion && <p className="direccion">{empresa.direccion}</p>}
      <p className="descripcion">{empresa.descripcion?.substring(0, 100)}...</p>
    </div>
  </div>
);

const renderRuta = (ruta) => (
  <div key={ruta.id} className="resultado-card">
    <div className="resultado-imagen">
      {/* Placeholder para imagen */}
      <div className="imagen-placeholder">
        <span>🛣️</span>
      </div>
    </div>
    <div className="resultado-contenido">
      <h4>{ruta.nombre}</h4>
      <p className="tipo-tag">Ruta</p>
      <p className="descripcion">{ruta.descripcion?.substring(0, 100)}...</p>
    </div>
  </div>
);

export default FiltroCompleto;
