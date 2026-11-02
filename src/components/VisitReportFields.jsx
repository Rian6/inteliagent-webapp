import LaboratoryFields from "./LaboratoryFields";
import { Disclosure } from "./ui";
import {
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { reportMetadata } from "../reports/pncd";
export default function VisitReportFields({ draft, onChange }) {
  const b = reportMetadata(draft.boletimJson),
    set = (key, value) =>
      onChange({
        ...draft,
        boletimJson: JSON.stringify({ ...b, [key]: value }),
      });
  return (
    <Stack spacing={2}>
      {[
        ["quarteirao", "Número do quarteirão"],
        ["sequenciaQuarteirao", "Sequência do quarteirão"],
        ["ladoQuarteirao", "Face do quarteirão"],
        ["sequenciaImovel", "Sequência do imóvel"],
        ["agenteNome", "Agente responsável"],
        ["agenteCodigo", "Código do agente"],
        ["horaEntrada", "Hora de entrada"],
      ].map(([key, label]) => (
        <TextField
          key={key}
          label={label}
          type={key === "horaEntrada" ? "time" : "text"}
          value={b[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { maxLength: 120 },
          }}
        />
      ))}
      <TextField
        select
        label="Tipo do imóvel no boletim"
        value={draft.tipoImovel || ""}
        onChange={(e) => onChange({ ...draft, tipoImovel: e.target.value })}
      >
        <MenuItem value="">Não informado</MenuItem>
        {[
          "Residencial",
          "Comercial",
          "Terreno baldio",
          "Ponto estratégico",
          "Outros",
        ].map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        label="Imóvel inspecionado para levantamento de índice (LI)"
        control={
          <Switch
            checked={!!b.inspecionadoLI}
            onChange={(e) => set("inspecionadoLI", e.target.checked)}
          />
        }
      />
      {[
        ["imovelInformado", "Morador orientado / imóvel informado"],
        ["quarteiraoConcluido", "Quarteirão concluído nesta visita"],
      ].map(([key, label]) => (
        <FormControlLabel
          key={key}
          label={label}
          control={
            <Switch
              checked={!!b[key]}
              onChange={(e) => set(key, e.target.checked)}
            />
          }
        />
      ))}
      <LaboratoryFields
        value={b.laboratorio}
        onChange={(value) => set("laboratorio", value)}
      />
      <Disclosure
        title="Quantidades adicionais de larvicida"
        summary="Gramas do L1 e segundo produto L2"
      >
        <TextField
          label="Larvicida L1 aplicado (g, para o boletim)"
          value={b.focalGramas ?? ""}
          onChange={(e) => set("focalGramas", e.target.value)}
        />
        {[
          ["tipo", "Tipo de larvicida L2"],
          ["gramas", "Quantidade de larvicida L2 (g)"],
          ["depositos", "Depósitos tratados L2"],
        ].map(([key, label]) => (
          <TextField
            key={key}
            label={label}
            value={b.focal2?.[key] ?? ""}
            onChange={(e) =>
              set("focal2", { ...b.focal2, [key]: e.target.value })
            }
          />
        ))}
      </Disclosure>
    </Stack>
  );
}
