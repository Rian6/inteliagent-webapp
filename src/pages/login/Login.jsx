import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";

import { Visibility, VisibilityOff, EmailOutlined, LockOutlined } from "@mui/icons-material";

import { api } from "../../services/api";

import { setSession } from "../../services/session";

import { AUTH_URL } from "../../tools/config";

import PasswordReset from "./PasswordReset";

import { design } from "../../design";

export default function Login() {
  const [reset, setReset] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState(""),
    [senha, setSenha] = useState("");

  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    setBusy(true);

    setError("");

    try {
      const { data } = await api.post(
        `${AUTH_URL}/api/user/login/web`,

        {
          email: email.trim().toLowerCase(),

          senha,
        },

        {
          withCredentials: true,
        },
      );

      if (!data.token) throw new Error();

      setSession(data);

      setSenha("");
    } catch {
      setError(
        "Não foi possível entrar. Verifique suas credenciais e a aprovação da conta.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (reset)
    return (
      <Box
        sx={{
          minHeight: "100vh",

          display: "grid",

          placeItems: "center",

          p: 3,
        }}
      >
        <Paper
          sx={{
            width: "100%",

            maxWidth: 450,

            p: 4,
          }}
        >
          <PasswordReset onBack={() => setReset(false)} />
        </Paper>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "grid",

        placeItems: "center",

        p: {
          xs: 2,

          sm: 4,
        },

        background: design.softGradient,
      }}
    >
      <Box
        sx={{
          width: "100%",

          maxWidth: 1120,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            md: "1fr 1fr",
          },

          gap: { xs: 3, md: 6 },

          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: {
              xs: "none",

              md: "block",
            },

            p: 5,

            bgcolor: "#E6F1FD",

            borderRadius: "32px",
          }}
        >
          <Box
            component="img"
            src="/brand/icon.svg"
            alt="Inteliagent"
            sx={{ width: 64, height: 64, mb: 5 }}
          />

          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            SUA ROTINA EM CAMPO
          </Typography>

          <Typography
            variant="h2"
            sx={{
              mt: 2,
              mb: 3,
              maxWidth: 480,
              fontSize: "clamp(2rem,3vw,3rem)",
              lineHeight: 1.2,
            }}
          >
            Mais tempo para cuidar.
            <br />
            Menos esforço para registrar.
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
            Planejamento, visitas e equipe em um só lugar.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 6 }}>
            {[
              "01 · Organize suas rotas",
              "02 · Acompanhe os atendimentos",
              "03 · Mantenha a equipe conectada",
            ].map((label) => (
              <Box
                key={label}
                sx={{
                  bgcolor: "#FFFFFFB3",
                  borderRadius: "16px",
                  px: 2.5,
                  py: 2,
                  fontSize: 14,
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>
        </Box>

        <Paper
          component="form"

          onSubmit={submit}

          sx={{
            p: {
              xs: 2.5,

              sm: 4,
            },

            width: "100%",

            maxWidth: 480,

            mx: "auto",

            borderRadius: "24px",

            boxShadow: "none",
          }}
        >
          <Stack spacing={3}>
            <Box
              component="img"
              src="/brand/icon.svg"
              alt="Inteliagent"
              sx={{ width: 48, height: 48 }}
            />

            <Box>
              <Typography component="h1" variant="h4">
                Entre na sua conta
              </Typography>

              <Typography
                color="text.secondary"

                sx={{
                  mt: 1,
                }}
              >
                Acesse sua equipe de vigilância em saúde.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"

              type="email"

              required

              autoComplete="username"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              slotProps={{
                input: {startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment>},
                htmlInput: {
                  maxLength: 254,
                },
              }}
            />

            <TextField
              label="Senha"

              type={showPassword ? "text" : "password"}

              required

              autoComplete="current-password"

              value={senha}

              onChange={(e) => setSenha(e.target.value)}

              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }

                        aria-pressed={showPassword}

                        onClick={() => setShowPassword((value) => !value)}

                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button variant="contained" type="submit" disabled={busy}>
              {busy ? "Entrando…" : "Entrar"}
            </Button>

            <Button onClick={() => setReset(true)}>Esqueci minha senha</Button>

            <Typography variant="caption" color="text.secondary">
              Use sua conta aprovada pela administração da sede.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
