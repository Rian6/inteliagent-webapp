import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Avatar,
  Box,
  Stack,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  PhotoCameraOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import { api } from "../../services/api";
import { getSession, subscribe, updateProfile } from "../../services/session";
import { AUTH_URL } from "../../tools/config";
export default function Perfil() {
  const user = useSyncExternalStore(subscribe, getSession),
    input = useRef(null);
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [preview, setPreview] = useState(null),
    [remove, setRemove] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .get(AUTH_URL + "/api/user/me")
      .then(({ data }) => {
        if (active) updateProfile(data);
      })
      .catch(() => {
        if (active)
          setError("Não foi possível atualizar seu perfil. Tente novamente.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id]);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setSuccess("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 12 * 1024 * 1024
    ) {
      setError("Escolha uma foto JPEG, PNG ou WebP de até 12 MB.");
      return;
    }
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d"),
        side = Math.min(bitmap.width, bitmap.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        512,
        512,
      );
      bitmap.close();
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.88),
      );
      if (!blob) throw Error();
      setPreview({
        file: new File([blob], "perfil.jpg", { type: "image/jpeg" }),
        url: URL.createObjectURL(blob),
      });
    } catch {
      setError("Não foi possível abrir a foto. Escolha outra imagem.");
    } finally {
      setBusy(false);
    }
  }
  async function save(deleting = false) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      let response;
      if (deleting)
        response = await api.delete(AUTH_URL + "/api/user/me/photo");
      else {
        const form = new FormData();
        form.append("file", preview.file);
        response = await api.put(AUTH_URL + "/api/user/me/photo", form);
      }
      updateProfile(response.data);
      setPreview(null);
      setRemove(false);
      setSuccess(deleting ? "Foto removida." : "Foto atualizada.");
    } catch {
      setError(
        "Não foi possível salvar a foto. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  const details = [
    ["Nome", user.nome],
    ["Email", user.email],
    ["Função", user.role === "ADMIN" ? "Administrador" : "Agente"],
    [
      "Sede",
      user.codigoSede
        ? [user.nomeSede, String(user.codigoSede)].filter(Boolean).join(" · ")
        : "Carregando…",
    ],
    [
      "Situação da conta",
      user.situacaoAprovacao === 1 ? "Aprovada" : "Aguardando aprovação",
    ],
  ];
  return (
    <Stack sx={{ maxWidth: 760, mx: "auto", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Meu perfil
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary" }}>
          Sua foto e informações da conta.
        </Typography>
      </Box>
      {loading && <LinearProgress aria-label="Carregando perfil" />}
      {!!error && (
        <Alert
          severity="error"
          action={
            loading ? null : (
              <Button onClick={() => window.location.reload()}>
                Atualizar
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}
      {!!success && (
        <Alert severity="success" role="status">
          {success}
        </Alert>
      )}
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: "background.paper",
          border: "1px solid #E8E8ED",
          borderRadius: "24px",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: 2,
            pb: 3,
            borderBottom: "1px solid #E8E8ED",
          }}
        >
          <Avatar
            src={user.foto || undefined}
            alt={"Foto de " + user.nome}
            sx={{
              width: 112,
              height: 112,
              bgcolor: "#E6F1FD",
              color: "#45454D",
              fontSize: 36,
            }}
          >
            {user.nome?.charAt(0)}
          </Avatar>
          <Stack
            direction="row"
            sx={{ gap: 1, flexWrap: "wrap", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              startIcon={<PhotoCameraOutlined />}
              disabled={busy || loading}
              onClick={() => input.current?.click()}
            >
              {user.foto ? "Trocar foto" : "Adicionar foto"}
            </Button>
            {!!user.foto && (
              <Button
                startIcon={<DeleteOutlineOutlined />}
                disabled={busy}
                onClick={() => setRemove(true)}
              >
                Remover foto
              </Button>
            )}
          </Stack>
          <Typography
            sx={{ fontSize: 12, color: "text.secondary", textAlign: "center" }}
          >
            Sua foto será ajustada ao formato quadrado.
          </Typography>
        </Stack>
        <Box component="dl" sx={{ m: 0, pt: 1 }}>
          {details.map(([label, value]) => (
            <Box
              key={label}
              sx={{
                py: 2,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
                gap: 0.75,
                borderBottom: "1px solid #F1F1F4",
              }}
            >
              <Typography
                component="dt"
                sx={{ color: "text.secondary", fontSize: 14 }}
              >
                {label}
              </Typography>
              <Typography
                component="dd"
                sx={{ m: 0, fontSize: 15, overflowWrap: "anywhere" }}
              >
                {value || "Não informado"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Selecionar foto de perfil"
        onChange={choose}
        hidden
      />
      <Dialog
        open={!!preview}
        onClose={() => {
          if (!busy) setPreview(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Atualizar foto</DialogTitle>
        <DialogContent>
          {!!error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="img"
            src={preview?.url}
            alt="Prévia da foto de perfil"
            sx={{
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setPreview(null)}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={busy} onClick={() => save()}>
            {busy ? "Salvando…" : "Salvar foto"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={remove}
        onClose={() => {
          if (!busy) setRemove(false);
        }}
      >
        <DialogTitle>Remover foto do perfil?</DialogTitle>
        <DialogContent>
          {!!error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          Suas iniciais aparecerão no lugar da foto.
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setRemove(false)}>
            Cancelar
          </Button>
          <Button disabled={busy} onClick={() => save(true)}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
