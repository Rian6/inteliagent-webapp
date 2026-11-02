import {
  Autocomplete,
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import catalog from "../data/planning-catalog.json";
export default function PlanningClassification({
  value,
  onChange,
  disabled = false,
  legacy = false,
  required = false,
  errors = {},
}) {
  const options = catalog.municipios;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 3,
      }}
    >
      <Typography variant="h6" sx={{ gridColumn: "1 / -1" }}>
        Classificação do planejamento
      </Typography>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ gridColumn: "1 / -1" }}
      >
        {legacy
          ? "A classificação anterior foi preservada. Para atualizá-la, selecione os quatro campos abaixo."
          : required
            ? "Preencha os quatro campos para o cabeçalho do boletim PDF."
            : "Opcional. Preencha os quatro campos para registrar a classificação PNCD/FAD."}
      </Typography>
      <Autocomplete
        disableClearable={!!value.idCidade}
        options={options}
        value={
          options.find((option) => option.value === value.idCidade) || null
        }
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, item) => option.value === item.value}
        filterOptions={(rows, state) => {
          const term = state.inputValue
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("pt-BR");
          return rows
            .filter((row) =>
              row.label
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLocaleLowerCase("pt-BR")
                .includes(term),
            )
            .slice(0, 80);
        }}
        disabled={disabled}
        onChange={(_, option) => {
          if (option) onChange({ ...value, idCidade: option.value });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            error={!!errors.idCidade}
            label="Município"
            helperText={
              errors.idCidade ||
              "Nome e UF do IBGE; disponível sem consulta externa."
            }
          />
        )}
      />
      {[
        ["idCategoria", "Categoria da localidade", catalog.categorias],
        ["atividade", "Atividade", catalog.atividades],
        ["tipo", "Tipo da localidade", catalog.tipos],
      ].map(([key, label, items]) => (
        <TextField
          key={key}
          required={required}
          error={!!errors[key]}
          helperText={errors[key]}
          select
          label={label}
          value={value[key] ?? ""}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, [key]: Number(event.target.value) })
          }
        >
          {items.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ whiteSpace: "normal" }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ))}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ gridColumn: "1 / -1" }}
      >
        Base de referência PNCD/FAD · Município IBGE · Categoria: Bairro ou
        Povoado · Tipo: Sede ou Outros.
      </Typography>
    </Box>
  );
}
