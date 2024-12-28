import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const Agentes = () => {
  // Estado para armazenar as localizações dos agentes
  const [agents, setAgents] = useState([
    { id: 1, name: "Agente 1", lat: -23.55052, lng: -46.633308 },
    { id: 2, name: "Agente 2", lat: -22.9035, lng: -43.2096 },
    { id: 3, name: "Agente 3", lat: -19.8157, lng: -43.9542 },
    // Você pode adicionar mais agentes com base nos dados reais do servidor
  ]);

  // Configuração do mapa
  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  const center = {
    lat: -23.55052, // Localização central do mapa
    lng: -46.633308,
  };

  return (
    <div>
      <h1>Agentes</h1>
      <LoadScript googleMapsApiKey="AIzaSyAOQx5-tulPLEKK6tUMKztcwfngiU7r-Fo">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
        >
          {/* Adicionando marcadores para cada agente */}
          {agents.map((agent) => (
            <Marker
              key={agent.id}
              position={{ lat: agent.lat, lng: agent.lng }}
              title={agent.name}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Agentes;
