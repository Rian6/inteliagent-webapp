import { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrowRounded,
  PauseRounded,
  PhotoOutlined,
  CloseOutlined,
  MicOutlined,
} from "@mui/icons-material";
import { api } from "../services/api";
import { CHAT_URL } from "../tools/config";
const time = (value) =>
  `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, "0")}`;
export default function ChatMedia({ attachment }) {
  const [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [duration, setDuration] = useState(
      Number(attachment.durationMillis || 0) / 1000,
    );
  const audio = useRef(null),
    playOnLoad = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    if (attachment.kind === "image") load(controller.signal);
    return () => controller.abort();
  }, [attachment.id, attachment.url]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function load(signal) {
    setBusy(true);
    setError("");
    try {
      const response = await api.get(CHAT_URL + attachment.url, {
        responseType: "blob",
        signal,
      });
      if (signal?.aborted) return;
      setUrl(URL.createObjectURL(response.data));
    } catch {
      if (!signal?.aborted)
        setError("Não foi possível carregar o anexo. Tente novamente.");
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }
  async function toggle() {
    if (!url) {
      playOnLoad.current = true;
      await load();
      return;
    }
    try {
      if (audio.current.paused) await audio.current.play();
      else audio.current.pause();
    } catch {
      setError("Toque novamente para reproduzir o áudio.");
    }
  }
  const size = attachment.size
    ? attachment.size >= 1048576
      ? (attachment.size / 1048576).toFixed(1) + " MB"
      : Math.max(1, Math.round(attachment.size / 1024)) + " KB"
    : "";
  return (
    <Box
      data-attachment-id={attachment.id}
      sx={{
        mb: 0.5,
        minWidth: attachment.kind === "audio" ? 210 : undefined,
        maxWidth: "100%",
      }}
    >
      {attachment.kind === "audio" ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 0.5,
            minWidth: 0,
          }}
        >
          <Tooltip title={playing ? "Pausar áudio" : "Ouvir áudio"}>
            <span>
              <IconButton
                aria-label={playing ? "Pausar áudio" : "Ouvir áudio"}
                disabled={busy}
                onClick={toggle}
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  width: 40,
                  height: 40,
                  color: "white",
                  bgcolor: "#1C1C1C",
                  "&:hover": { bgcolor: "#38383E" },
                }}
              >
                {busy ? (
                  <CircularProgress size={20} color="inherit" />
                ) : playing ? (
                  <PauseRounded sx={{ fontSize: 26 }} />
                ) : (
                  <PlayArrowRounded sx={{ fontSize: 26 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 110 }}>
            <Box
              component="input"
              type="range"
              aria-label="Posição do áudio"
              min={0}
              max={duration || 1}
              step={0.1}
              value={position}
              disabled={!url || !duration}
              onChange={(event) => {
                audio.current.currentTime = Number(event.target.value);
                setPosition(Number(event.target.value));
              }}
              sx={{
                width: "100%",
                height: 4,
                accentColor: "#626974",
                display: "block",
                m: 0,
              }}
            />
            <Typography sx={{ fontSize: 10.5, color: "#78808B", mt: 1 }}>
              {time(position || duration)}
              {!url && size ? " · " + size : ""}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "#D7E3F0",
              display: "grid",
              placeItems: "center",
              color: "#626974",
            }}
          >
            <MicOutlined sx={{ fontSize: 21 }} />
          </Box>
          {url && (
            <audio
              ref={audio}
              src={url}
              preload="metadata"
              onLoadedMetadata={() => {
                if (Number.isFinite(audio.current.duration))
                  setDuration(audio.current.duration);
                if (playOnLoad.current) {
                  playOnLoad.current = false;
                  audio.current
                    .play()
                    .catch(() =>
                      setError("Toque novamente para reproduzir o áudio."),
                    );
                }
              }}
              onTimeUpdate={() => setPosition(audio.current.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() =>
                setError("Não foi possível reproduzir este áudio.")
              }
              style={{ display: "none" }}
            />
          )}
        </Box>
      ) : !url ? (
        <Box
          sx={{
            width: 230,
            maxWidth: "100%",
            height: 165,
            bgcolor: "#DBE3ED",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "#7C8794",
          }}
        >
          <PhotoOutlined sx={{ fontSize: 38 }} />
          {error ? (
            <IconButton
              aria-label="Tentar carregar imagem novamente"
              onClick={() => load()}
            >
              <PhotoOutlined />
            </IconButton>
          ) : (
            <CircularProgress size={22} aria-label="Carregando imagem" />
          )}
          <Typography sx={{ fontSize: 11 }}>{size}</Typography>
        </Box>
      ) : (
        <Box
          component="button"
          aria-label="Ampliar imagem da mensagem"
          onClick={() => setOpen(true)}
          sx={{
            border: 0,
            p: 0,
            bgcolor: "transparent",
            display: "block",
            cursor: "pointer",
            maxWidth: "100%",
          }}
        >
          <Box
            component="img"
            src={url}
            alt="Imagem enviada na conversa"
            onError={() => {
              setError("Não foi possível abrir a imagem.");
              setUrl("");
            }}
            sx={{
              display: "block",
              width: 240,
              maxWidth: "100%",
              maxHeight: 250,
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </Box>
      )}
      {error && (
        <Typography sx={{ fontSize: 11, color: "error.main", mt: 1 }}>
          {error}
        </Typography>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <IconButton
            aria-label="Fechar imagem"
            onClick={() => setOpen(false)}
            sx={{ float: "right" }}
          >
            <CloseOutlined />
          </IconButton>
          <Box
            component="img"
            src={url}
            alt="Imagem da conversa ampliada"
            sx={{ width: "100%", objectFit: "contain" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
