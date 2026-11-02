import ReportExport from "../../components/ReportExport";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Stack,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Alert,
  LinearProgress,
  Link,
  IconButton,
  Chip,
  MenuItem,
} from "@mui/material";
import { Add, EditOutlined, ChevronRight } from "@mui/icons-material";
import { api, errorMessage } from "../../services/api";
import { getSession } from "../../services/session";
import { SERVIDOR_MAIN } from "../../tools/config";
export default function Planejamento() {
  const [rows, setRows] = useState([]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(0);
  const [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    api
      .get(`${SERVIDOR_MAIN}/api/planejamento-list`, {
        signal: c.signal,
      })
      .then((r) => setRows(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => setBusy(false));
    return () => c.abort();
  }, []);
  const filtered = rows.filter(
    (row) =>
      `${row.descricao} ${row.zona}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")) &&
      (!statusFilter || Number(row.situacao) === statusFilter),
  );
  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        sx={{
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography component="h1" variant="h4">
            Planejamento
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Organize regiões e acompanhe as visitas da sua sede.
          </Typography>
        </Box>
        {getSession()?.permissions?.createPlanning && (
          <Button
            variant="contained"
            startIcon={<Add />}
            component={RouterLink}
            to="/planejamento/cadastrar/0"
          >
            Novo planejamento
          </Button>
        )}
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {busy && <LinearProgress />}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Buscar região ou zona"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          sx={{
            flex: "1 1 260px",
            maxWidth: 520,
          }}
        />
        <TextField
          select
          label="Filtrar por situação"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(Number(event.target.value));
            setPage(0);
          }}
          sx={{
            minWidth: 200,
          }}
        >
          {[
            [0, "Todas as situações"],
            [2, "Pendente"],
            [3, "Em execução"],
            [1, "Concluído"],
          ].map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Paper>
        <TableContainer>
          <Table aria-label="Planejamentos">
            <TableHead>
              <TableRow>
                <TableCell>Região</TableCell>
                <TableCell>Zona</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell align="center">Visitas</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * size, page * size + size).map((row) => (
                <TableRow key={row.codigo} hover>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/planejamento/cadastrar/${row.codigo}?aba=visitas`}
                    >
                      {row.descricao || "Sem nome"}
                    </Link>
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.zona}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        {
                          1: "Concluído",
                          2: "Pendente",
                          3: "Em execução",
                        }[row.situacao] || "Planejamento"
                      }
                      sx={{
                        bgcolor:
                          Number(row.situacao) === 1
                            ? "primary.light"
                            : "background.default",
                        color: "text.secondary",
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={Number(row.quantidadeVisitas ?? 0)}
                      aria-label={
                        Number(row.quantidadeVisitas ?? 0) +
                        " visitas de " +
                        row.descricao
                      }
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getSession()?.permissions?.editPlanning && (
                      <IconButton
                        component={RouterLink}
                        to={`/planejamento/cadastrar/${row.codigo}?aba=geral`}
                        aria-label={`Editar planejamento ${row.descricao}`}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    )}
                    <ReportExport
                      planId={row.codigo}
                      planName={row.descricao || "planejamento"}
                      compact
                    />
                    <IconButton
                      component={RouterLink}
                      to={`/planejamento/cadastrar/${row.codigo}?aba=visitas`}
                      aria-label={`Ver visitas de ${row.descricao}`}
                    >
                      <ChevronRight />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Nenhum planejamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={size}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
          labelDisplayedRows={({ from, to, count }) =>
            `${from} a ${to} de ${count}`
          }
          getItemAriaLabel={(type) =>
            ({
              next: "Próxima página",
              previous: "Página anterior",
            })[type] || type
          }
          labelRowsPerPage="Por página"
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Stack>
  );
}
