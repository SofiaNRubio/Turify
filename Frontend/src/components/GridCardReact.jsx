import React from "react";
import "./filtros.css";

const GridCardReact = ({ items = [] }) => {
  return (
    <div className="grid-container">
      {items.length === 0 ? (
        <p>No hay elementos para mostrar.</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="card">
            <img 
              src={index % 2 === 0 ? "/catamaran.jpg" : "/hotel.jpg"} 
              alt={item.nombre || item.titulo} 
            />            <div className="card-content">
              <h3>{item.nombre || item.titulo}</h3>
              <p>{item.descripcion}</p>
              <button>Ver Más</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GridCardReact;
