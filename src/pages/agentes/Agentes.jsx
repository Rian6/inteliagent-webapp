import Approvals from "./Approvals";
import RouteMap from "../../components/RouteMap";
import { getSession } from "../../services/session";
import { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import {
  Stack,
  Typography,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { api, errorMessage } from "../../services/api";
import { SERVIDOR_MAIN } from "../../tools/config";
const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
function AgentMap({ agents }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: key });
  const [selected, setSelected] = useState(null);
  if (loadError)
    return <Alert severity="warning">Não foi possível carregar o mapa.</Alert>;
  if (!isLoaded) return <Typography>Carregando mapa…</Typography>;
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "55vh", borderRadius: 16 }}
      center={{ lat: -24.9555, lng: -53.4552 }}
      zoom={12}
    >
      {agents
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a, i) => (
          <MarkerF
            key={i}
            position={{ lat: Number(a.latitude), lng: Number(a.longitude) }}
            onClick={() => setSelected(a)}
          />
        ))}
      {selected && (
        <InfoWindowF
          position={{
            lat: Number(selected.latitude),
            lng: Number(selected.longitude),
          }}
          onCloseClick={() => setSelected(null)}
        >
          <span>{selected.nome}</span>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
export default function Agentes() {
  const [agents, setAgents] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    api
      .get(`${SERVIDOR_MAIN}/usuario-location`, { signal: c.signal })
      .then((r) => setAgents(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      });
    return () => c.abort();
  }, []);
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        Agentes
      </Typography>
      <Typography color="text.secondary">
        Última localização informada pela equipe. A posição pode estar
        desatualizada.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {key ? (
        <AgentMap agents={agents} />
      ) : (
        <Paper sx={{ p: 2 }}>
          <RouteMap
            label="Última localização dos agentes"
            connect={false}
            visits={agents.map((agent, index) => ({
              id: String(index),
              nome: agent.nome,
              lat: agent.latitude,
              lng: agent.longitude,
            }))}
          />
        </Paper>
      )}
      {getSession()?.role === "ADMIN" && <Approvals />}
      <Paper sx={{ overflow: "auto" }}>
        <Table aria-label="Agentes da sede">
          <TableHead>
            <TableRow>
              <TableCell>Agente</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((a, i) => (
              <TableRow key={i}>
                <TableCell>{a.nome}</TableCell>
                <TableCell>{a.latitude ?? "Indisponível"}</TableCell>
                <TableCell>{a.longitude ?? "Indisponível"}</TableCell>
              </TableRow>
            ))}
            {!agents.length && (
              <TableRow>
                <TableCell colSpan={3}>Nenhum agente disponível.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
