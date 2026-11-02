import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { PictureAsPdfOutlined } from "@mui/icons-material";
import { SERVIDOR_MAIN } from "../tools/config";
import { api, errorMessage } from "../services/api";
import { createDailyReport } from "../reports/pncd";
import catalog from "../data/planning-catalog.json";
export default function ReportExport({
  planId,
  disabled = false,
  compact = false,
  planName = "",
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get(
        SERVIDOR_MAIN + "/api/planejamento/" + planId + "/boletim",
      );
      const result = await createDailyReport(data.plan, data.visits, catalog);
      const url = URL.createObjectURL(
        new Blob([result.bytes], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      setError(
        e.response
          ? errorMessage(e)
          : e.message || "Não foi possível gerar o PDF.",
      );
    } finally {
      setBusy(false);
    }
  }
  const label = planName ? "Baixar PDF de " + planName : "Baixar PDF";
  return (
    <>
      {compact ? (
        <Tooltip title={busy ? "Gerando PDF…" : label}>
          <span>
            <IconButton
              aria-label={label}
              disabled={disabled || busy}
              onClick={download}
            >
              <PictureAsPdfOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          onClick={download}
          disabled={disabled || busy}
          startIcon={<PictureAsPdfOutlined />}
        >
          {busy ? "Gerando PDF…" : "Baixar PDF"}
        </Button>
      )}
      <Dialog
        open={!!error}
        onClose={() => setError("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Revise os dados do cadastro</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ whiteSpace: "pre-line" }}>
            {error}
          </Alert>
          <p>
            O PDF é preenchido automaticamente. Complete as informações no
            planejamento ou nas visitas e baixe novamente.
          </p>
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button onClick={() => setError("")}>Fechar</Button>
          <Button
            component={RouterLink}
            to={"/planejamento/cadastrar/" + planId + "?aba=geral"}
            onClick={() => setError("")}
          >
            Revisar planejamento
          </Button>
          <Button
            component={RouterLink}
            to={"/planejamento/cadastrar/" + planId + "?aba=visitas"}
            onClick={() => setError("")}
          >
            Revisar visitas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
