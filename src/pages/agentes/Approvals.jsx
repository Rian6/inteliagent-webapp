import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Button, Alert } from "@mui/material";
import { api, errorMessage } from "../../services/api";
import { AUTH_URL } from "../../tools/config";
export default function Approvals() {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    api
      .get(`${AUTH_URL}/api/approvals`, {
        signal: c.signal,
      })
      .then((r) => setRows(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      });
    return () => c.abort();
  }, []);
  async function decide(id, approved) {
    setBusy(true);
    setError("");
    try {
      await api.post(`${AUTH_URL}/api/approvals/${id}`, {
        approved,
      });
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Paper
      sx={{
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Solicitações de cadastro</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {!rows.length && (
          <Typography color="text.secondary">
            Nenhuma solicitação pendente.
          </Typography>
        )}
        {rows.map((row) => (
          <Stack
            key={row.id}
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              alignItems: {
                sm: "center",
              },
            }}
          >
            <Stack
              sx={{
                flex: 1,
              }}
            >
              <Typography>{row.nome}</Typography>
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            </Stack>
            <Button disabled={busy} onClick={() => decide(row.id, false)}>
              Rejeitar
            </Button>
            <Button
              disabled={busy}
              variant="contained"
              onClick={() => decide(row.id, true)}
            >
              Aprovar
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
