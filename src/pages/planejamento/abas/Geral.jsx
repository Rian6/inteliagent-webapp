import { planningReportErrors } from "../../../data/planning-report";
import ReportContextFields from "../../../components/ReportContextFields";
import { reportMetadata } from "../../../reports/pncd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stack,
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import { api, errorMessage } from "../../../services/api";
import { getSession } from "../../../services/session";
import { SERVIDOR_MAIN } from "../../../tools/config";
import catalog from "../../../data/planning-catalog.json";
import {
  emptyClassification,
  selectedClassification,
  mergeClassification,
  planningCycle,
} from "../../../data/planning-fields";
import PlanningClassification from "../../../components/PlanningClassification";
import { Disclosure } from "../../../components/ui";
export default function Geral() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const admin =
    !!getSession()?.permissions?.[
      uuid === "0" ? "createPlanning" : "editPlanning"
    ];
  const [name, setName] = useState(""),
    [zone, setZone] = useState(""),
    [status, setStatus] = useState(2);
  const [year, setYear] = useState(String(new Date().getFullYear())),
    [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [boletim, setBoletim] = useState({});
  const [metadata, setMetadata] = useState({});
  const [classification, setClassification] = useState(emptyClassification()),
    [cycle, setCycle] = useState("");
  const [attempted, setAttempted] = useState(false);
  const fields =
    uuid === "0" && attempted
      ? planningReportErrors(
          {
            ...classification,
            nome: name,
            zona: zone,
            ano: year,
            ciclo: cycle,
            boletim,
          },
          catalog,
        )
      : {};
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    if (uuid === "0") return;
    const c = new AbortController();
    setBusy(true);
    api
      .get(`${SERVIDOR_MAIN}/api/find-by-uuid/${uuid}`, { signal: c.signal })
      .then(({ data }) => {
        setBoletim({
          ...reportMetadata(data.boletimJson),
          municipioIbge:
            reportMetadata(data.boletimJson).municipioIbge || data.idCidade,
        });
        setMetadata({
          idCidade: data.idCidade,
          idCategoria: data.idCategoria,
          atividade: data.atividade,
          tipo: data.tipo,
          catalogoVersao: data.catalogoVersao,
        });
        setClassification(selectedClassification(data, catalog));
        setCycle(data.ciclo ?? "");
        setYear(String(data.ano || new Date().getFullYear()).slice(0, 4));
        setDate(
          String(
            data.dataUltVisita || new Date().toLocaleDateString("en-CA"),
          ).slice(0, 10),
        );
        setName(data.descricao || "");
        setZone(data.zona || "");
        setStatus(data.situacao || 2);
      })
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => setBusy(false));
    return () => c.abort();
  }, [uuid]);
  async function save(event) {
    event.preventDefault();
    setAttempted(true);
    if (uuid === "0") {
      const errors = planningReportErrors(
        {
          ...classification,
          nome: name,
          zona: zone,
          ano: year,
          ciclo: cycle,
          boletim,
        },
        catalog,
      );
      if (Object.keys(errors).length) {
        setError("Preencha os campos obrigatórios do planejamento.");
        return;
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Informe uma data da visita válida.");
      return;
    }
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const { data } = await api.post(
        `${SERVIDOR_MAIN}/api/planejamento/salvar`,
        {
          ...mergeClassification(metadata, classification, catalog),
          uuid,
          boletimJson: JSON.stringify(boletim),
          nomeRegiao: name,
          zona: zone,
          situacao: status,
          ano: year + "-01-01",
          ciclo: planningCycle(cycle),
          dataUltVisita: date + " 00:00:00",
        },
      );
      setSaved(true);
      navigate(
        `/planejamento/cadastrar/${data.uuid}?aba=${uuid === "0" ? "visitas" : "geral"}`,
        { replace: true },
      );
    } catch (e) {
      setError(e.response ? errorMessage(e) : e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Paper
      component="form"
      noValidate
      onSubmit={save}
      sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1000 }}
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {saved && <Alert severity="success">Planejamento salvo.</Alert>}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Localidade
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              required
              error={!!fields.nome}
              helperText={fields.nome}
              label="Nome da região"
              value={name}
              disabled={!admin || busy}
              onChange={(event) => setName(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
            <ReportContextFields
              value={boletim}
              onChange={setBoletim}
              disabled={!admin || busy}
              required={uuid === "0"}
              errors={fields}
            />
            <TextField
              required={uuid === "0"}
              error={!!fields.zona}
              helperText={fields.zona}
              label="Zona"
              value={zone}
              disabled={!admin || busy}
              onChange={(event) => setZone(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Supervisor:{" "}
            {boletim.supervisorNome ||
              (uuid === "0"
                ? getSession()?.nome
                : "Responsável não identificado")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            O supervisor é definido automaticamente. A conclusão da localidade
            acompanha as visitas realizadas.
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Período e andamento
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              required
              error={!!fields.ano}
              helperText={fields.ano}
              label="Ano"
              type="number"
              value={year}
              disabled={!admin || busy}
              onChange={(event) => setYear(event.target.value)}
              slotProps={{ htmlInput: { min: 1900, max: 9999 } }}
            />
            <TextField
              required={uuid === "0"}
              error={!!fields.ciclo}
              helperText={fields.ciclo}
              label="Ciclo"
              type="number"
              value={cycle}
              disabled={!admin || busy}
              onChange={(event) => setCycle(event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 99, step: 1 } }}
            />
            <TextField
              required
              label="Data da visita"
              type="date"
              value={date}
              disabled={!admin || busy}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Situação"
              value={status}
              disabled={!admin || busy}
              onChange={(event) => setStatus(Number(event.target.value))}
            >
              <MenuItem value={2}>Pendente</MenuItem>
              <MenuItem value={3}>Em execução</MenuItem>
              <MenuItem value={1}>Concluído</MenuItem>
            </TextField>
          </Box>
        </Box>
        {uuid === "0" ? (
          <PlanningClassification
            value={classification}
            onChange={setClassification}
            disabled={!admin || busy}
            required
            errors={fields}
          />
        ) : (
          <Disclosure
            title="Classificação do planejamento"
            summary="Município, categoria, atividade e tipo da localidade"
          >
            <PlanningClassification
              value={classification}
              onChange={setClassification}
              disabled={!admin || busy}
              legacy={!metadata.catalogoVersao}
            />
          </Disclosure>
        )}
        {admin && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {uuid === "0"
                ? "Após salvar, adicione os imóveis da rota."
                : "As alterações serão recebidas automaticamente pelo aplicativo."}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              disabled={busy || (uuid !== "0" && !name.trim())}
            >
              {busy ? "Salvando…" : "Salvar planejamento"}
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
