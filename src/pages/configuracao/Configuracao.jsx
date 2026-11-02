import AgentPermissions from "../../components/AgentPermissions";
import { useEffect, useState } from "react";
import {
  Stack,
  Paper,
  Typography,
  Alert,
  Button,
  FormControlLabel,
  Switch,
  LinearProgress,
} from "@mui/material";
import { api, errorMessage } from "../../services/api";
import { AUTH_URL } from "../../tools/config";
export default function Configuracao() {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(true),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    api
      .get(AUTH_URL + "/api/user/settings", { signal: c.signal })
      .then((r) => {
        setEnabled(r.data.autoApprove);
        setReady(true);
      })
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      })
      .finally(() => setBusy(false));
    return () => c.abort();
  }, []);
  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api.put(AUTH_URL + "/api/user/settings", { autoApprove: enabled });
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h4">
          Configuração
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Gerencie o acesso da equipe e as preferências da sua sede.
        </Typography>
      </Stack>
      {busy && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {saved && (
        <Alert severity="success">Preferência salva para a sua sede.</Alert>
      )}
      <AgentPermissions />
      <Paper
        component="section"
        aria-label="Preferências da sede"
        sx={{ p: { xs: 2, sm: 3 }, borderColor: "divider" }}
      >
        <Stack spacing={2}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Preferência da sede
          </Typography>
          <Typography component="h2" variant="h6">
            Aprovação de novos cadastros
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Quando ativada, novos usuários que confirmarem o email e o código da
            sede recebem acesso de agente automaticamente. Solicitações já
            pendentes continuam disponíveis em Agentes para análise.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                disabled={busy || !ready}
                onChange={(e) => {
                  setEnabled(e.target.checked);
                  setSaved(false);
                }}
              />
            }
            label="Liberar novos usuários automaticamente"
          />
          <Button
            sx={{ alignSelf: "flex-start" }}
            variant="contained"
            disabled={busy || !ready}
            onClick={save}
          >
            Salvar configuração
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
