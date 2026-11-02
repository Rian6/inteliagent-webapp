import { TextField } from "@mui/material";
export default function LocalityCodeField({
  value = {},
  onChange,
  disabled = false,
  required = false,
  errors = {},
}) {
  return (
    <TextField
      required={required}
      error={!!errors.codigoLocalidade}
      helperText={
        errors.codigoLocalidade ||
        "Identificação da localidade utilizada pela sede."
      }
      label="Código da localidade"
      value={value.codigoLocalidade || ""}
      disabled={disabled}
      onChange={(event) =>
        onChange({ ...value, codigoLocalidade: event.target.value })
      }
      slotProps={{ htmlInput: { maxLength: 32 } }}
    />
  );
}
