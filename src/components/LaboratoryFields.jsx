import {
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Disclosure } from "./ui";
import { depositTypes, laboratorySpecies } from "../reports/daily-summary";
export default function LaboratoryFields({ value = {}, onChange }) {
  const set = (key, val) => onChange({ ...value, [key]: val });
  const speciesField = (species, key, val) =>
    set(species, { ...value[species], [key]: val });
  return (
    <Disclosure
      title="Resultado do laboratório"
      summary="Preencha quando a análise da amostra estiver concluída"
    >
      <Stack spacing={2}>
        <FormControlLabel
          label="Análise laboratorial concluída"
          control={
            <Switch
              checked={!!value.concluido}
              onChange={(e) => set("concluido", e.target.checked)}
            />
          }
        />
        {value.concluido && (
          <>
            <Typography variant="body2" color="text.secondary">
              Registre os resultados confirmados. As quantidades iniciam em
              zero; não inclua depósitos ou exemplares sem identificação.
            </Typography>
            {[
              ["dataEntrada", "Data de entrada"],
              ["dataConclusao", "Data de conclusão"],
              ["nome", "Laboratório"],
              ["laboratorista", "Laboratorista"],
            ].map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                type={key.startsWith("data") ? "date" : "text"}
                value={value[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { maxLength: 120 },
                }}
              />
            ))}
            {laboratorySpecies.map(([species, label]) => (
              <Disclosure key={species} title={label}>
                <Stack spacing={2}>
                  <Typography variant="body2">
                    Depósitos com espécimes identificados
                  </Typography>
                  {depositTypes.map((type) => (
                    <TextField
                      key={type}
                      label={"Depósitos " + type + " · " + label}
                      type="number"
                      value={value[species]?.depositos?.[type] ?? 0}
                      onChange={(e) =>
                        speciesField(species, "depositos", {
                          ...value[species]?.depositos,
                          [type]: e.target.value,
                        })
                      }
                      slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    />
                  ))}
                  {[
                    ["larvas", "Larvas"],
                    ["pupas", "Pupas"],
                    ["exuvias", "Exúvias"],
                    ["adultos", "Adultos"],
                  ].map(([key, name]) => (
                    <TextField
                      key={key}
                      label={name + " · " + label}
                      type="number"
                      value={value[species]?.[key] ?? 0}
                      onChange={(e) =>
                        speciesField(species, key, e.target.value)
                      }
                      slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    />
                  ))}
                </Stack>
              </Disclosure>
            ))}
          </>
        )}
      </Stack>
    </Disclosure>
  );
}
