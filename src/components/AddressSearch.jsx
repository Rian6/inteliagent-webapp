import { useEffect, useState } from "react";
import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
export default function AddressSearch({ onSelect, disabled = false }) {
  const [city, setCity] = useState("Cascavel"),
    [state, setState] = useState("PR"),
    [query, setQuery] = useState(""),
    [options, setOptions] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setOptions([]);
    setError("");
    setBusy(false);
    if (
      query.trim().length < 3 ||
      city.trim().length < 3 ||
      !/^[A-Z]{2}$/.test(state)
    )
      return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const url =
          "https://viacep.com.br/ws/" +
          state +
          "/" +
          encodeURIComponent(city.trim()) +
          "/" +
          encodeURIComponent(query.trim()) +
          "/json/";
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted)
          setOptions(Array.isArray(data) ? data : []);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Não foi possível pesquisar. Use o CEP ou preencha o endereço abaixo.",
          );
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, city, state]);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "100px 1fr" },
        gap: 2,
      }}
    >
      <TextField
        label="UF da busca"
        value={state}
        disabled={disabled}
        onChange={(e) =>
          setState(
            e.target.value
              .toUpperCase()
              .replace(/[^A-Z]/g, "")
              .slice(0, 2),
          )
        }
      />
      <TextField
        label="Cidade da busca"
        value={city}
        disabled={disabled}
        onChange={(e) => setCity(e.target.value)}
      />
      <Autocomplete
        sx={{ gridColumn: "1 / -1" }}
        disabled={disabled}
        options={options}
        inputValue={query}
        onInputChange={(_, value, reason) => {
          if (reason === "input" || reason === "clear") setQuery(value);
        }}
        loading={busy}
        filterOptions={(values) => values}
        getOptionLabel={(option) =>
          option.logradouro +
          ", " +
          option.bairro +
          " · " +
          option.localidade +
          "/" +
          option.uf +
          " · " +
          option.cep
        }
        isOptionEqualToValue={(a, b) =>
          a.cep === b.cep && a.logradouro === b.logradouro
        }
        onChange={(_, option) => {
          if (option) onSelect(option);
        }}
        noOptionsText={
          query.length < 3
            ? "Digite pelo menos três letras da rua."
            : "Nenhum endereço encontrado."
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar imóvel por endereço"
            helperText={
              error ||
              "Busque a rua e selecione um resultado para preencher endereço e CEP."
            }
            error={!!error}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {busy && <CircularProgress size={20} />}{" "}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
}
