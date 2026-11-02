import { Link as RouterLink } from "react-router-dom";

import { useCallback, useEffect, useState } from "react";

import { Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";

import {
  Box,
  Stack,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  LinearProgress,
} from "@mui/material";

import { Refresh } from "@mui/icons-material";

import { api, errorMessage } from "../../services/api";

import { SERVIDOR_MAIN } from "../../tools/config";

ChartJS.register(
  CategoryScale,

  LinearScale,

  BarElement,

  Tooltip,

  Legend,

  LineElement,

  PointElement,
);

export default function Home() {
  const [metrics, setMetrics] = useState({});
  const [updatedAt, setUpdatedAt] = useState(null);
  const [view, setView] = useState("summary");

  const [days, setDays] = useState([]),
    [regions, setRegions] = useState([]),
    [visits, setVisits] = useState([]);

  const [busy, setBusy] = useState(true),
    [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setBusy(true);

    setError("");

    try {
      const result = await Promise.all(
        [
          "visitas-por-dia",
          "visitas-por-regiao",
          "ultimas-visitas",
          "indicadores",
        ].map((path) =>
          api.get(`${SERVIDOR_MAIN}/api/${path}`, {
            signal,
          }),
        ),
      );

      setMetrics(result[3].data);
      setUpdatedAt(new Date());
      setDays(result[0].data);

      setRegions(result[1].data);

      setVisits(result[2].data);
    } catch (e) {
      if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal);

    return () => controller.abort();
  }, [load]);

  const dataset = (rows, field, label) => ({
    labels: rows.map((r) => r[field]),

    datasets: [
      {
        label,

        data: rows.map((r) => r.quantidade),

        borderColor: field === "data" ? "#1C1C1C" : "#007AFF",

        backgroundColor: field === "data" ? "#D8D2FC" : "#A8C5EF",

        borderRadius: "20px",

        tension: 0.3,
      },
    ],
  });

  const number = (key) => Number(metrics[key] || 0);
  const total = number("totalVisitas"),
    realizadas = number("realizadas"),
    pendencias = number("fechados") + number("recusados");
  const percentage = total ? Math.round((realizadas / total) * 1000) / 10 : 0;
  const count = (value) =>
    error || !updatedAt ? "—" : Number(value).toLocaleString("pt-BR");
  const stats = [
    [
      "Visitas cadastradas",
      total,
      "Total de imóveis na rota da sede",
      "#E6F1FD",
    ],
    ["Visitas realizadas", realizadas, "Atendimentos concluídos", "#EDE9FE"],
    [
      "Realizadas hoje",
      number("hoje"),
      "Atendimentos na data de hoje",
      "#1C1C1C",
    ],
    [
      "Pendências de acesso",
      pendencias,
      "Imóveis fechados ou visitas recusadas",
      "#FFF2DD",
    ],
  ];
  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: "column",

          sm: "row",
        }}

        sx={{
          gap: 3,

          justifyContent: "space-between",

          alignItems: {
            xs: "flex-start",

            sm: "center",
          },

          pb: 1,
        }}
      >
        <Box>
          <Typography component="h1" variant="h4">
            Uma visão do cuidado em campo
          </Typography>

          <Typography
            color="text.secondary"

            sx={{
              mt: 1,
            }}
          >
            Acompanhe visitas, regiões e a atividade da sua equipe.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"

            startIcon={<Refresh />}

            onClick={() => load()}

            disabled={busy}
          >
            Atualizar
          </Button>

          <Button component={RouterLink} to="/planejamento" variant="contained">
            Ver planejamentos
          </Button>
        </Stack>
      </Stack>

      {busy && <LinearProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="caption" color="text.secondary" aria-live="polite">
        {updatedAt
          ? "Dados da sua sede · Atualizado às " +
            updatedAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Carregando indicadores da sede…"}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,minmax(0,1fr))",
            lg: "repeat(4,minmax(0,1fr))",
          },
          gap: 2,
        }}
      >
        {stats.map(([title, value, description, background], index) => (
          <Paper
            key={title}
            component="section"
            aria-label={title}
            sx={{
              p: 3,
              bgcolor: background,
              color: index === 2 ? "#FFFFFF" : "text.primary",
              minWidth: 0,
              borderRadius: "20px",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {count(value)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, opacity: 0.75 }}
            >
              {description}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Paper
        component="section"
        aria-label="Progresso dos atendimentos"
        sx={{ p: 3, borderRadius: "20px" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ gap: 1, justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography variant="h6">Progresso dos atendimentos</Typography>
            <Typography variant="body2" color="text.secondary">
              {count(realizadas)} realizadas de {count(total)} visitas
              cadastradas
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {error || !updatedAt
              ? "—"
              : percentage.toLocaleString("pt-BR") + "%"}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          aria-label="Percentual de visitas realizadas"
          sx={{ height: 8, borderRadius: 8, bgcolor: "#E6F1FD" }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
            gap: 2,
            mt: 2,
          }}
        >
          {[
            ["A visitar", number("aVisitar")],
            ["Imóveis fechados", number("fechados")],
            ["Visitas recusadas", number("recusados")],
          ].map(([label, value]) => (
            <Box key={label}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6">{count(value)}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" },
          gap: 2,
        }}
      >
        {[
          [
            "Planejamentos da sede",
            [
              ["Total de planejamentos", number("planejamentos")],
              ["Em andamento", number("emAndamento")],
              ["Pendentes", number("planosPendentes")],
              ["Concluídos", number("planosConcluidos")],
            ],
          ],
          [
            "Atividade em campo",
            [
              ["Realizadas nos últimos 7 dias", number("realizadas7Dias")],
              ["Visitas com coleta", number("comAmostra")],
              ["Visitas com tratamento", number("comTratamento")],
              ["Regiões com visitas", regions.length],
              [
                "Visitas cadastradas em 90 dias",
                days.reduce((n, r) => n + Number(r.quantidade || 0), 0),
              ],
              [
                "Realizadas com coleta (%)",
                realizadas
                  ? Math.round((number("comAmostra") / realizadas) * 1000) / 10
                  : 0,
              ],
            ],
          ],
        ].map(([title, items]) => (
          <Paper
            key={title}
            component="section"
            aria-label={title}
            sx={{ p: 3, borderRadius: "20px", minWidth: 0 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {title}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 2,
              }}
            >
              {items.map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {count(value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
      <Stack
        direction="row"
        spacing={1}
        aria-label="Visualização dos indicadores"
      >
        <Button
          aria-pressed={view === "summary"}
          onClick={() => setView("summary")}
          sx={{ bgcolor: view === "summary" ? "#E8E8ED" : "transparent" }}
        >
          Resumo
        </Button>
        <Button
          aria-pressed={view === "recent"}
          onClick={() => setView("recent")}
          sx={{ bgcolor: view === "recent" ? "#E8E8ED" : "transparent" }}
        >
          Visitas recentes
        </Button>
      </Stack>

      {view === "summary" && (
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              lg: "1fr 1fr",
            },

            gap: 3,
          }}
        >
          {[
            ["Visitas por região", regions, "regiao", Bar],

            ["Evolução das visitas", days, "data", Line],
          ].map(([title, rows, field, Chart]) => (
            <Paper
              key={title}

              sx={{
                p: 3,

                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"

                sx={{
                  mb: 3,
                }}
              >
                {title}
              </Typography>

              {rows.length ? (
                <Chart
                  role="img"

                  aria-label={
                    title +
                    ": " +
                    rows

                      .map((row) => `${row[field]}: ${row.quantidade}`)

                      .join(", ")
                  }

                  data={dataset(rows, field, title)}

                  options={{
                    responsive: true,

                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <Typography
                  color="text.secondary"

                  sx={{
                    py: 6,
                  }}
                >
                  Nenhuma visita registrada neste período.
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {view === "recent" && (
        <TableContainer component={Paper}>
          <Typography
            variant="h6"

            sx={{
              p: 3,
            }}
          >
            Últimas visitas modificadas
          </Typography>

          <Table aria-label="Visitas recentes">
            <TableHead>
              <TableRow>
                <TableCell>Visita</TableCell>

                <TableCell>Região</TableCell>

                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visits.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.id.slice(0, 8)}</TableCell>

                  <TableCell>{v.regiao}</TableCell>

                  <TableCell>{v.data}</TableCell>
                </TableRow>
              ))}

              {!visits.length && (
                <TableRow>
                  <TableCell colSpan={3}>Nenhuma visita disponível.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
