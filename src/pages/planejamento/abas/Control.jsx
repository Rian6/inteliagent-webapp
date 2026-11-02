import ReportExport from "../../../components/ReportExport";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Stack, Typography, Button, Tabs, Tab, Box } from "@mui/material";
import Geral from "./Geral";
import Visitas from "./Visitas";
export default function Control() {
  const { uuid } = useParams(),
    [search, setSearch] = useSearchParams();
  const tab = uuid !== "0" && search.get("aba") === "visitas" ? 1 : 0;
  return (
    <Stack spacing={2.5}>
      <Button
        component={Link}
        to="/planejamento"
        sx={{ alignSelf: "flex-start", p: 0, minHeight: 36 }}
      >
        ← Voltar aos planejamentos
      </Button>
      <Box>
        <Typography component="h1" variant="h4">
          {uuid === "0" ? "Novo planejamento" : "Planejamento da localidade"}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          {uuid === "0"
            ? "Defina a localidade e o período. Depois, organize a rota."
            : "Consulte a rota ou ajuste os dados do planejamento."}
        </Typography>
      </Box>
      {uuid !== "0" && <Box sx={{alignSelf:"flex-end"}}><ReportExport planId={uuid}/></Box>}
      <Tabs
        value={tab}
        onChange={(_, value) =>
          setSearch(
            { aba: value === 1 ? "visitas" : "geral" },
            { replace: true },
          )
        }
        aria-label="Seções do planejamento"
      >
        <Tab label="Geral" id="tab-geral" aria-controls="panel-geral" />
        {uuid !== "0" && (
          <Tab label="Visitas" id="tab-visitas" aria-controls="panel-visitas" />
        )}
      </Tabs>
      <Box
        hidden={tab !== 0}
        role="tabpanel"
        id="panel-geral"
        aria-labelledby="tab-geral"
      >
        <Geral key={uuid} />
      </Box>
      {uuid !== "0" && (
        <Box
          hidden={tab !== 1}
          role="tabpanel"
          id="panel-visitas"
          aria-labelledby="tab-visitas"
        >
          <Visitas key={uuid} />
        </Box>
      )}
    </Stack>
  );
}
