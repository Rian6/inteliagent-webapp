import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  LinearProgress,
  Divider,
  Box,
} from "@mui/material";
import { api, errorMessage } from "../services/api";
import { SERVIDOR_MAIN } from "../tools/config";
const codes = { 1: "A1", 2: "A2", 3: "B", 4: "C", 5: "D1", 6: "D2", 7: "E" };
export default function VisitDetails({ id, onClose }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    const c = new AbortController();
    setData(null);
    setError("");
    api
      .get(SERVIDOR_MAIN + "/api/visita/" + id + "/ficha", { signal: c.signal })
      .then((r) => setData(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      });
    return () => c.abort();
  }, [id]);
  const visit = data?.visita;
  return (
    <Dialog open={!!id} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ficha da visita</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {!data && !error && <LinearProgress aria-label="Carregando ficha" />}
          {visit && (
            <>
              <Typography variant="h6">
                {visit.NOME}, {visit.NUMERO || "s/n"}
              </Typography>
              <Typography>
                {visit.COMPLEMENTO} · CEP {visit.CEP || "não informado"}
              </Typography>
              <Typography>
                {visit.TIPO_VISITA === "R" ? "Retorno" : "Visita normal"} ·{" "}
                {{
                  1: "Imóvel fechado",
                  2: "Visita recusada",
                  3: "Realizada",
                  4: "Rejeitada",
                  5: "Aguardando visita",
                }[visit.SITUACAO_REFERENCIA] || "Aguardando visita"}
              </Typography>
              <Typography>
                Primeira visita:{" "}
                {visit.PRIMEIRA_VISITA
                  ? new Date(visit.PRIMEIRA_VISITA).toLocaleDateString("pt-BR")
                  : "Não registrada"}{" "}
                · Retorno:{" "}
                {visit.SEGUNDA_VISITA
                  ? new Date(visit.SEGUNDA_VISITA).toLocaleDateString("pt-BR")
                  : "Não agendado"}
              </Typography>
              <Typography>
                {visit.TIPO_IMOVEL || "Tipo de imóvel não informado"} ·{" "}
                {visit.NUMERO_QUARTOS || 0} quartos
                {visit.LADO
                  ? " · Lado " + (visit.LADO === "D" ? "direito" : "esquerdo")
                  : ""}
              </Typography>
              <Divider />
              <Typography variant="h6">Inspeções</Typography>
              {data.inspecao.map((row) => (
                <Typography key={row.ID}>
                  {codes[row.TIPO] || row.TIPO}:{" "}
                  {row.NUMERO_DEPOSITOS ?? "Quantidade não informada"} depósitos
                </Typography>
              ))}
              {!data.inspecao.length && (
                <Typography>Nenhum depósito registrado.</Typography>
              )}
              <Divider />
              <Typography variant="h6">Amostras</Typography>
              {data.amostra.map((row) => {
                let photos = [];
                try {
                  photos = JSON.parse(row.IMAGENS_JSON || "[]");
                } catch {
                  /* historical records may not have photos */
                }
                return (
                  <Stack key={row.ID} spacing={1}>
                    <Typography>
                      Números {row.NUMERO_INICIO} a {row.NUMERO_FINAL} ·{" "}
                      {row.QUANTIDADE} tubitos
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {photos
                        .filter(
                          (uri) =>
                            typeof uri === "string" &&
                            uri.startsWith("data:image/jpeg;base64,"),
                        )
                        .map((uri, index) => (
                          <Box
                            component="img"
                            key={index}
                            src={uri}
                            alt={"Foto da amostra " + (index + 1)}
                            sx={{
                              maxWidth: "100%",
                              width: 220,
                              height: 180,
                              objectFit: "contain",
                              borderRadius: 2,
                            }}
                          />
                        ))}
                    </Box>
                  </Stack>
                );
              })}
              {!data.amostra.length && (
                <Typography>Sem coleta de amostras.</Typography>
              )}
              <Divider />
              <Typography variant="h6">Tratamentos</Typography>
              {data.tratamento.map((row) => (
                <Typography key={row.ID}>
                  {String(row.TIPO || "Eliminação de depósitos")
                    .replace("PERIFOCAL:", "Perifocal · ")
                    .replace("FOCAL:", "Focal · ")}{" "}
                  · Carga: {row.QTD_CARGA || 0} · Depósitos tratados:{" "}
                  {row.QTD_TRATAMENTO || 0} · Eliminados:{" "}
                  {row.DEPOSITOS_ELIMINADOS || 0} · Imóveis tratados:{" "}
                  {row.IMOVEIS_TRATADOS || 0}
                </Typography>
              ))}
              {!data.tratamento.length && (
                <Typography>Sem tratamento registrado.</Typography>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar ficha</Button>
      </DialogActions>
    </Dialog>
  );
}
