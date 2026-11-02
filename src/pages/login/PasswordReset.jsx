import { useState } from "react";
import { Stack, Typography, TextField, Button, Alert } from "@mui/material";
import { api } from "../../services/api";
import { AUTH_URL } from "../../tools/config";

export default function PasswordReset({ onBack }) {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [password, setPassword] = useState("");
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!sent) {
        await api.post(`${AUTH_URL}/api/user/password/request`, { email });
        setSent(true);
        setMessage(
          "Se a conta existir, enviaremos um código por email. Ele vale por 10 minutos.",
        );
      } else {
        await api.post(`${AUTH_URL}/api/user/password/reset`, {
          email,
          code,
          password,
        });
        setMessage("Senha atualizada. Entre novamente com sua nova senha.");
        setSent(false);
        setPassword("");
        setCode("");
      }
    } catch {
      setError(
        "Não foi possível concluir. Verifique o código, a senha e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack component="form" onSubmit={submit} spacing={3}>
      <Typography component="h1" variant="h4">
        Recuperar senha
      </Typography>
      {message && <Alert severity="info">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        required
        type="email"
        label="Email da conta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={sent}
      />
      {sent && (
        <>
          <TextField
            required
            label="Código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                pattern: "[0-9]{6}",
                maxLength: 6,
              },
            }}
          />
          <TextField
            required
            type="password"
            label="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            helperText="Pelo menos 12 caracteres e no máximo 72 bytes."
            slotProps={{ htmlInput: { minLength: 12 } }}
          />
        </>
      )}
      <Button variant="contained" type="submit" disabled={busy}>
        {sent ? "Atualizar senha" : "Receber código"}
      </Button>
      <Button onClick={onBack}>Voltar para o login</Button>
    </Stack>
  );
}
