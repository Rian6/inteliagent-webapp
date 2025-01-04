import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import { SERVIDOR_MAIN } from "../../tools/config";

const Agentes = () => {
  const [agents, setAgents] = useState([]);
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null); // Estado para o InfoWindow

  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: -23.55052,
    lng: -46.633308,
  };

  const libraries = ["places", "marker"];

  useEffect(() => {
    const fetchAgentLocations = async () => {
      try {
        const response = await axios.get(SERVIDOR_MAIN + "/usuario-location");
        const data = response.data;

        if (data && Array.isArray(data)) {
          const formattedData = data.map(agent => ({
            id: agent.nome,
            name: agent.nome,
            lat: parseFloat(agent.latitude),
            lng: parseFloat(agent.longitude),
          }));

          setAgents(formattedData);
        }
      } catch (error) {
        console.error("Erro ao buscar as localizações:", error);
      }
    };

    fetchAgentLocations();
  }, []);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  useEffect(() => {
    if (map && window.google && window.google.maps) {
      // Inicializa o InfoWindow
      const newInfoWindow = new google.maps.InfoWindow();
      setInfoWindow(newInfoWindow);

      agents.forEach(agent => {
        const marker = new google.maps.Marker({
          position: { lat: agent.lat, lng: agent.lng },
          map: map,
          title: "Nome: "+agent.name+"\n"+"Latitude: "+agent.lat+"\n"+"Longitude: "+agent.lng+"\n",
        });

        marker.addListener("click", () => {
          // Quando o marcador for clicado, abrirá o InfoWindow com o nome do agente
          newInfoWindow.setContent(agent.name);
          newInfoWindow.open(map, marker); // Abre o InfoWindow sobre o marcador
        });
      });
    }
  }, [map, agents]);

  return (
    <div style={{width: '97vw', height: '70vh'}}>
      <h1>Agentes</h1>
      <LoadScript googleMapsApiKey="AIzaSyAOQx5-tulPLEKK6tUMKztcwfngiU7r-Fo" libraries={libraries}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={handleMapLoad}
        />
      </LoadScript>
    </div>
  );
};

export default Agentes;
