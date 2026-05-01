import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '1rem',
  border: '2px solid #444'
};

export const RestaurantMap = ({ latitud, longitud }) => {
  // Carga el script de Google usando tu API KEY de forma segura
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Si no hay coordenadas válidas, mostramos un mensaje amigable
  if (!latitud || !longitud) {
    return (
      <div className="bg-dark text-white p-4 rounded-4 text-center border border-secondary d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
        <div>
          <i className="fas fa-map-marker-alt fs-1 text-secondary mb-3"></i>
          <h5>Ubicación no disponible</h5>
          <p className="text-white-50">Este restaurante aún no tiene coordenadas registradas.</p>
        </div>
      </div>
    );
  }

  // Convertimos a números decimales por si acaso llegan como texto
  const center = {
    lat: parseFloat(latitud),
    lng: parseFloat(longitud)
  };

  // Si el mapa ya cargó, lo mostramos. Si no, mostramos "Cargando..."
  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16} // Nivel de zoom (16 es ideal para ver calles cercanas)
      >
        <Marker position={center} />
      </GoogleMap>
  ) : (
    <div className="bg-dark text-white p-4 rounded-4 text-center d-flex align-items-center justify-content-center" style={{ height: '350px' }}>
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Cargando mapa...</span>
      </div>
    </div>
  );
};