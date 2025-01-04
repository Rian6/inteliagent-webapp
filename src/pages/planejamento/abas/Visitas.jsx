import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, IconButton, Typography, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SortIcon from '@mui/icons-material/Sort';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVIDOR_MAIN } from '../../../tools/config';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const primaryColor = "#A9007A";
const center = { lat: -15.7942, lng: -47.8822 };

const libraries = ['places'];

export default function VisitasMap() {
  const [visitas, setVisitas] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const { uuid } = useParams();

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAOQx5-tulPLEKK6tUMKztcwfngiU7r-Fo',
    libraries,
  });

  useEffect(() => {
    async function fetchVisitas() {
      try {
        const response = await fetch(`${SERVIDOR_MAIN}/api/visitas-list/${uuid}`);
        const data = await response.json();
        const visitasCompletas = await Promise.all(
          data.map(async (visita) => {
            const address = `${visita.numero}, ${visita.cep}`;
            try {
              const results = await getGeocode({ address });
              const components = results[0].address_components;
              const nome = components.find((comp) => comp.types.includes('route'))?.long_name || address;

              return {
                ...visita,
                endereco: address,
                lat: visita.lat,
                lng: visita.lng,
                nome,
              };
            } catch (error) {
              console.error("Erro ao buscar coordenadas:", error);
              return {
                ...visita,
                endereco: address,
                lat: null,
                lng: null,
                nome: address,
              };
            }
          })
        );

        setVisitas(visitasCompletas);
      } catch (error) {
        console.error('Erro ao buscar visitas:', error);
      }
    }

    fetchVisitas();
  }, [uuid]);

  const salvarVisitas = async () => {
    const visitasSalvarDTO = visitas.map((visita, index) => ({
      uuid: visita.id,
      cep: visita.cep,
      nome: visita.nome,
      numero: visita.numero,
      lat: visita.lat,
      lng: visita.lng,
      sequencia: index + 1,
      idPlanejamento: uuid,
    }));
  
    try {
      const response = await axios.post(SERVIDOR_MAIN+'/api/visita/salvar', visitasSalvarDTO);
      console.log('Visitas salvas com sucesso:', response.data);
      alert('Visitas salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar visitas:', error);
      alert('Ocorreu um erro ao salvar as visitas. Tente novamente.');
    }
  };

  const handleSelectAddress = async (address) => {
    try {
      setValue(address, false);
      clearSuggestions();
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      const components = results[0].address_components;
      const cep = components.find((comp) => comp.types.includes('postal_code'))?.long_name || '';
      const numero = components.find((comp) => comp.types.includes('street_number'))?.long_name || '';
      const nome = components.find((comp) => comp.types.includes('route'))?.long_name || address;
      const uuid = crypto.randomUUID();

      setVisitas([...visitas, { id: uuid, endereco: address, lat, lng, cep, numero, nome }]);
    } catch (error) {
      console.error("Erro ao buscar coordenadas do endereço:", error);
    }
  };

  const handleRemoveVisita = (id) => {
    setVisitas(visitas.filter((visita) => visita.id !== id));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(visitas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVisitas(items);
  };

  const handleOptimizeRoute = async () => {
    if (visitas.length < 2) {
      console.warn('Adicione pelo menos duas visitas para otimizar a rota.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: visitas[0].endereco,
        destination: visitas[visitas.length - 1].endereco,
        waypoints: visitas.slice(1, -1).map((visita) => ({
          location: visita.endereco,
          stopover: true,
        })),
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (response, status) => {
        if (status === 'OK') {
          const optimizedOrder = response.routes[0].waypoint_order;
          const reorderedVisitas = [
            visitas[0],
            ...optimizedOrder.map((index) => visitas[index + 1]),
            visitas[visitas.length - 1],
          ];
          setVisitas(reorderedVisitas);
          setDirectionsResponse(response);
        } else {
          console.error('Erro ao otimizar rota:', status);
        }
      }
    );
  };

  if (!isLoaded) return <div>Carregando Mapa...</div>;

  return (
    <Box display="flex" width="90vw">
      <Box width="30%" p={2} bgcolor="white">
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Digite um endereço"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSelectAddress(value);
            }}
            style={{ backgroundColor: 'white', borderRadius: 4 }}
          />
          {status === "OK" && (
            <Box bgcolor="white" mt={1} p={1} borderRadius={4}>
              {data.map(({ description }, idx) => (
                <Typography
                  key={idx}
                  onClick={() => handleSelectAddress(description)}
                  style={{ cursor: "pointer" }}
                >
                  {description}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Lista de Visitas</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<SortIcon />}
              onClick={handleOptimizeRoute}
              style={{ backgroundColor: 'white', color: primaryColor }}
            >
              Ordenar
            </Button>
            <Button
              variant="contained"
              onClick={() => salvarVisitas()}
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              Salvar
            </Button>
          </Box>
        </Box>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="visitasList">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {visitas.map((visita, index) => (
                  <Draggable key={visita.id} draggableId={visita.id} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveVisita(visita.id)}>
                            <DeleteIcon style={{ color: primaryColor }} />
                          </IconButton>
                        }
                        style={{ backgroundColor: '#ffdff5', marginBottom: 5, borderRadius: 4 }}
                      >
                        {visita.nome}, {visita.numero}
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>

            )}
          </Droppable>
        </DragDropContext>
      </Box>
      <Box flex={1}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
        >
          {visitas.map((visita) => (
            visita.lat && visita.lng && <Marker key={visita.id} position={{ lat: visita.lat, lng: visita.lng }} />
          ))}
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </Box>
    </Box>
  );
}
