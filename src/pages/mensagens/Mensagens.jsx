import EmojiPicker from "../../components/EmojiPicker";
import ChatMedia from "../../components/ChatMedia";
import ContactAvatar from "../../components/ContactAvatar";
import { uuid as createUuid } from "../../tools/uuid";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Paper,
  Box,
  Stack,
  Typography,
  List,
  ListItemButton,
  InputBase,
  Button,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  SearchOutlined,
  MoreVert,
  CloseOutlined,
  ArrowBackOutlined,
  AttachFileOutlined,
  MicOutlined,
  SendOutlined,
  InsertEmoticonOutlined,
  PhotoOutlined,
  DoneOutlined,
  ChatBubbleOutlineOutlined,
  PersonOutlineOutlined,
  DeleteOutlineOutlined,
  StopCircleOutlined,
  HeadphonesOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { api, errorMessage } from "../../services/api";
import { getSession, ensureSession } from "../../services/session";
import { CHAT_URL } from "../../tools/config";
import {
  chatInitials,
  chatDay,
  chatTime,
  chatDate,
  chatPreview,
} from "../../data/chat-presentation";
const wallpaper =
  'url("data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="none" stroke="#CAD3E0" stroke-width="1" opacity=".46"><circle cx="16" cy="18" r="2"/><path d="M64 20h14v10H68l-4 4V20zM20 63l6-6 6 6v9H20z"/><circle cx="71" cy="73" r="3"/><path d="M42 38l3 3m0-3l-3 3"/></svg>',
  ) +
  '")';
function Action({ label, children, ...props }) {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          {...props}
          sx={{ color: "#626974", ...props.sx }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
const mergeMessages = (first, second) =>
  [
    ...new Map([...first, ...second].map((item) => [item.id, item])).values(),
  ].sort((a, b) => a.id - b.id);
export default function Mensagens() {
  const user = getSession();
  const [query, setQuery] = useState(""),
    [conversationSearch, setConversationSearch] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [attachmentAnchor, setAttachmentAnchor] = useState(null),
    [menuAnchor, setMenuAnchor] = useState(null),
    [detailsOpen, setDetailsOpen] = useState(false);
  const searchInput = useRef(null),
    composerInput = useRef(null),
    log = useRef(null),
    followBottom = useRef(true),
    historyAnchor = useRef(null);
  const [recording, setRecording] = useState(false),
    [seconds, setSeconds] = useState(0);
  const recorder = useRef(null),
    recordChunks = useRef([]),
    recordCancelled = useRef(false);
  useEffect(
    () => () => {
      recordCancelled.current = true;
      if (recorder.current?.state === "recording") recorder.current.stop();
      recorder.current?.stream?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(
      () =>
        setSeconds((value) => {
          if (value >= 179) {
            if (recorder.current?.state === "recording")
              recorder.current.stop();
            return 180;
          }
          return value + 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [recording]);
  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      audioInput.current?.click();
      return;
    }
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus"].find(
        (value) => MediaRecorder.isTypeSupported(value),
      );
      const active = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      recorder.current = active;
      recordChunks.current = [];
      recordCancelled.current = false;
      active.ondataavailable = (event) => {
        if (event.data.size) recordChunks.current.push(event.data);
      };
      active.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        if (!recordCancelled.current) {
          const type = active.mimeType || "audio/webm";
          setFile(
            new File(
              recordChunks.current,
              "Mensagem de voz." + (type.includes("ogg") ? "ogg" : "webm"),
              { type },
            ),
          );
          setUploaded(null);
        }
      };
      active.start();
      setSeconds(0);
      setRecording(true);
    } catch {
      setError(
        "Não foi possível acessar o microfone. Você também pode anexar um arquivo de áudio.",
      );
    }
  }
  function stopRecording(cancel = false) {
    recordCancelled.current = cancel;
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  const [users, setUsers] = useState([]),
    [selected, setSelected] = useState(null),
    [messages, setMessages] = useState([]);
  const [text, setText] = useState(""),
    [error, setError] = useState(""),
    [socket, setSocket] = useState(null),
    [busy, setBusy] = useState(false);
  const [more, setMore] = useState(false);
  const [file, setFile] = useState(null),
    [uploaded, setUploaded] = useState(null),
    [emojiOpen, setEmojiOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const sendAttempt = useRef(null),
    sendLock = useRef(false);
  const imageInput = useRef(null),
    audioInput = useRef(null);
  function chooseFile(event) {
    const value = event.target.files?.[0];
    event.target.value = "";
    if (!value) return;
    if (value.size > (value.type.startsWith("image/") ? 8 : 12) * 1024 * 1024) {
      setError("Selecione uma imagem de até 8 MB ou áudio de até 12 MB.");
      return;
    }
    setFile(value);
    setUploaded(null);
    setError("");
  }

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      api
        .get(`${CHAT_URL}/users`, { signal: controller.signal })
        .then((r) => {
          if (controller.signal.aborted) return;
          setUsers(r.data.filter((u) => u.id !== user.id));
          setSelected((current) => current ? r.data.find((u) => u.id === current.id) || current : r.data.find(u=>u.id===Number(new URLSearchParams(window.location.search).get("with"))) || null);
        })
        .catch((e) => {
          if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
        });
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user.id]);
  useEffect(() => {
    if (!selected) return;
    setSearchOpen(false);
    setConversationSearch("");
    setEmojiOpen(false);
    followBottom.current = true;
    setConnected(false);
    setMessages([]);
    setText("");
    setFile(null);
    setUploaded(null);
    sendAttempt.current = null;
    setError("");
    setMore(false);
    const connection = io(CHAT_URL, {
      auth: async (callback) => {
        try {
          callback({ token: (await ensureSession())?.token || "" });
        } catch {
          callback({ token: "" });
        }
      },
      transports: ["polling", "websocket"],
    });
    setSocket(connection);
    connection.on("connect", () => {
      setConnected(true);
      setError("");
      connection.emit("load_messages", { recipient: selected.id }, (result) =>
        setMore(!!result?.hasMore),
      );
    });
    connection.on("disconnect", () => setConnected(false));
    connection.on("connect_error", () =>
      setError("Não foi possível conectar ao chat."),
    );
    connection.on("all_messages", (loaded) =>
      setMessages((previous) => mergeMessages(loaded, previous)),
    );
    connection.on("receive_message", (message) => {
      const contact =
        message.sender === user.id ? message.recipient : message.sender;
      setUsers((previous) =>
        previous
          .map((item) =>
            item.id === contact
              ? {
                  ...item,
                  lastMessage: message.text,
                  lastMessageAt: message.timestamp,
                  lastAttachmentMime: message.attachment?.mime,
                }
              : item,
          )
          .sort(
            (a, b) =>
              (Date.parse(b.lastMessageAt) || 0) -
                (Date.parse(a.lastMessageAt) || 0) ||
              a.nome.localeCompare(b.nome),
          ),
      );
      if (message.sender === selected.id || message.recipient === selected.id)
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev, message],
        );
    });
    return () => connection.disconnect();
  }, [selected?.id, user.id]);
  function older() {
    if (!socket?.connected || !messages.length) return;
    historyAnchor.current = log.current?.scrollHeight;
    socket
      .timeout(10000)
      .emit(
        "load_messages",
        { recipient: selected.id, before: messages[0].id },
        (timeout, result) => {
          if (timeout || !result?.success) {
            historyAnchor.current = null;
            setError("Não foi possível carregar o histórico.");
          } else setMore(!!result.hasMore);
        },
      );
  }
  async function send(event) {
    event.preventDefault();
    if (sendLock.current || !socket?.connected || (!text.trim() && !file))
      return;
    followBottom.current = true;
    sendLock.current = true;
    setBusy(true);
    setError("");
    try {
      let attachment = uploaded;
      if (file && !attachment) {
        const data = new FormData();
        data.append("recipient", selected.id);
        data.append("file", file);
        attachment = (
          await api.post(CHAT_URL + "/attachments", data, { timeout: 30000 })
        ).data;
        setUploaded(attachment);
      }
      const signature = JSON.stringify([
        selected.id,
        text.trim(),
        attachment?.id || "",
      ]);
      if (sendAttempt.current?.signature !== signature)
        sendAttempt.current = { id: createUuid(), signature };
      const result = await new Promise((resolve, reject) =>
        socket.timeout(15000).emit(
          "send_message",
          {
            recipient: selected.id,
            text: text.trim(),
            attachmentId: attachment?.id,
            clientId: sendAttempt.current.id,
          },
          (timeout, result) =>
            timeout
              ? reject(new Error("O envio não foi confirmado."))
              : resolve(result),
        ),
      );
      if (!result?.success)
        throw new Error(result?.error || "Falha ao enviar mensagem.");
      setText("");
      setFile(null);
      setUploaded(null);
      setEmojiOpen(false);
      sendAttempt.current = null;
    } catch (error) {
      setError(
        (error.response ? errorMessage(error) : error.message) +
          " Sua mensagem foi mantida para tentar novamente.",
      );
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  }

  useLayoutEffect(() => {
    const node = log.current;
    if (!node) return;
    if (historyAnchor.current != null) {
      node.scrollTop += node.scrollHeight - historyAnchor.current;
      historyAnchor.current = null;
    } else if (followBottom.current) node.scrollTop = node.scrollHeight;
  }, [messages, selected?.id]);
  const filteredUsers = users.filter((item) =>
    item.nome
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const shown = messages.filter(
    (message) =>
      !conversationSearch ||
      (message.text || "")
        .toLocaleLowerCase("pt-BR")
        .includes(conversationSearch.toLocaleLowerCase("pt-BR")),
  );
  const hasContent = !!text.trim() || !!file;
  return (
    <Paper
      aria-label="Mensagens da equipe"
      sx={{
        height: { xs: "calc(100dvh - 92px)", md: "calc(100dvh - 128px)" },
        minHeight: 440,
        maxHeight: 1000,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0,1fr)", md: "310px minmax(0,1fr)" },
        borderColor: "divider",
        overflow: "hidden",
        borderRadius: "18px",
      }}
    >
      <Box
        component="aside"
        aria-label="Conversas da equipe"
        sx={{
          display: { xs: selected ? "none" : "flex", md: "flex" },
          flexDirection: "column",
          minHeight: 0,
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2.5,
            height: 72,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            component="h1"
            sx={{ fontSize: 23, fontWeight: 600, letterSpacing: "-.5px" }}
          >
            Mensagens
          </Typography>
          <Action
            label="Iniciar conversa"
            onClick={() => {
              setQuery("");
              searchInput.current?.focus();
            }}
          >
            <ChatBubbleOutlineOutlined />
          </Action>
        </Stack>
        <Box
          sx={{
            mx: 2,
            mb: 2,
            px: 1.5,
            minHeight: 42,
            bgcolor: "#F1F2F5",
            borderRadius: "22px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SearchOutlined sx={{ fontSize: 20, color: "text.secondary" }} />
          <InputBase
            inputRef={searchInput}
            placeholder="Pesquisar ou iniciar conversa"
            inputProps={{ "aria-label": "Buscar pessoa" }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ flex: 1, fontSize: 13, minWidth: 0 }}
          />
          {query && (
            <Action label="Limpar busca" onClick={() => setQuery("")}>
              <CloseOutlined sx={{ fontSize: 18 }} />
            </Action>
          )}
        </Box>
        <List disablePadding sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {filteredUsers.map((contact) => (
            <ListItemButton
              key={contact.id}
              selected={selected?.id === contact.id}
              disabled={busy || recording}
              onClick={() => setSelected(contact)}
              aria-label={contact.nome}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 0,
                minHeight: 84,
                gap: 1.5,
                "&.Mui-selected": {
                  bgcolor: "#E6F1FD",
                  "&:hover": { bgcolor: "#DDEBFA" },
                },
                "&:hover": { bgcolor: "#F6F7F9" },
              }}
            >
              <ContactAvatar
                photoUrl={contact.photoUrl}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#E9ECF1",
                  color: "#626974",
                  fontSize: 16,
                }}
              >
                {chatInitials(contact.nome)}
              </ContactAvatar>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: 0.5,
                  borderBottom: "1px solid #F0F1F4",
                }}
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", gap: 1, mb: 0.5 }}
                >
                  <Typography
                    noWrap
                    sx={{ fontSize: 15, fontWeight: 500, flex: 1 }}
                  >
                    {contact.nome}
                  </Typography>
                  {contact.lastMessageAt && (
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "text.secondary",
                        flexShrink: 0,
                      }}
                    >
                      {chatDay(contact.lastMessageAt) ===
                      chatDay(new Date().toISOString())
                        ? chatTime(contact.lastMessageAt)
                        : chatDate(contact.lastMessageAt)}
                    </Typography>
                  )}
                </Stack>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {contact.lastAttachmentMime?.startsWith("image/") ? (
                    <PhotoOutlined sx={{ fontSize: 15 }} />
                  ) : contact.lastAttachmentMime?.startsWith("audio/") ? (
                    <MicOutlined sx={{ fontSize: 15 }} />
                  ) : null}
                  <Box
                    component="span"
                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {chatPreview(contact)}
                  </Box>
                </Typography>
              </Box>
            </ListItemButton>
          ))}
        </List>
        {!filteredUsers.length && (
          <Typography
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            {query
              ? "Nenhum contato encontrado."
              : "Nenhum contato disponível na sua sede."}
          </Typography>
        )}
      </Box>
      {selected ? (
        <Box
          component="section"
          aria-label={"Conversa com " + selected.nome}
          sx={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            bgcolor: "#EEF2F6",
            backgroundImage: wallpaper,
          }}
        >
          <Stack
            direction="row"
            sx={{
              px: { xs: 1, sm: 2.5 },
              minHeight: 68,
              flexShrink: 0,
              alignItems: "center",
              gap: 1.25,
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #E8E8ED",
            }}
          >
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <Action
                label="Voltar às conversas"
                disabled={busy || recording}
                onClick={() => setSelected(null)}
              >
                <ArrowBackOutlined />
              </Action>
            </Box>
            <ContactAvatar
              photoUrl={selected.photoUrl}
              sx={{
                width: 42,
                height: 42,
                bgcolor: "#E6F1FD",
                color: "#45454D",
                fontSize: 15,
              }}
            >
              {chatInitials(selected.nome)}
            </ContactAvatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 600 }}>
                {selected.nome}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {connected ? "Equipe da sua sede" : "Conectando…"}
              </Typography>
            </Box>
            <Action
              label="Buscar na conversa"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <SearchOutlined />
            </Action>
            <Action
              label="Opções da conversa"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MoreVert />
            </Action>
          </Stack>
          {searchOpen && (
            <Stack
              direction="row"
              sx={{
                px: 2,
                py: 1,
                bgcolor: "white",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InputBase
                autoFocus
                placeholder="Buscar nesta conversa"
                inputProps={{ "aria-label": "Buscar nesta conversa" }}
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                sx={{ flex: 1, fontSize: 14 }}
              />
              <Action
                label="Fechar busca na conversa"
                onClick={() => {
                  setSearchOpen(false);
                  setConversationSearch("");
                }}
              >
                <CloseOutlined />
              </Action>
            </Stack>
          )}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ m: 1, borderRadius: "10px" }}
            >
              {error}
            </Alert>
          )}
          <Box
            ref={log}
            role="log"
            aria-label="Histórico da conversa"
            aria-live="polite"
            onScroll={(event) => {
              const node = event.currentTarget;
              followBottom.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 100;
            }}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 1.5, sm: 4 },
              py: 2,
              overscrollBehavior: "contain",
            }}
          >
            {more && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Button
                  size="small"
                  onClick={older}
                  sx={{
                    bgcolor: "white",
                    borderRadius: "18px",
                    boxShadow: "0 1px 2px #00000010",
                  }}
                >
                  Carregar mensagens anteriores
                </Button>
              </Box>
            )}
            {!shown.length && (
              <Typography
                sx={{
                  mx: "auto",
                  mt: 3,
                  maxWidth: 320,
                  bgcolor: "#FFFFFFDC",
                  borderRadius: "10px",
                  p: 1.5,
                  fontSize: 13,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                {conversationSearch
                  ? "Nenhuma mensagem encontrada."
                  : "Envie uma mensagem para começar a conversa."}
              </Typography>
            )}
            {shown.map((message, index) => {
              const mine = message.sender === user.id,
                first =
                  index === 0 ||
                  chatDay(message.timestamp) !==
                    chatDay(shown[index - 1].timestamp);
              return (
                <Box key={message.id}>
                  {first && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                        mt: index ? 2 : 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          color: "#626974",
                          py: 0.6,
                          px: 1.5,
                          bgcolor: "#FFFFFFE8",
                          borderRadius: "8px",
                          boxShadow: "0 1px 2px #0000000A",
                        }}
                      >
                        {chatDate(message.timestamp)}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      mb:
                        shown[index + 1]?.sender === message.sender ? 0.5 : 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        bgcolor: mine ? "#E6F1FD" : "#FFFFFF",
                        py: 0.8,
                        px: 1.25,
                        borderRadius: mine ? "9px 0 9px 9px" : "0 9px 9px 9px",
                        maxWidth: { xs: "90%", sm: "78%" },
                        minWidth: 90,
                        boxShadow: "0 1px 1px #172B4D12",
                        overflowWrap: "anywhere",
                        "&:before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          [mine ? "right" : "left"]: -7,
                          width: 8,
                          height: 10,
                          bgcolor: mine ? "#E6F1FD" : "#FFFFFF",
                          clipPath: mine
                            ? "polygon(0 0,100% 0,0 100%)"
                            : "polygon(0 0,100% 0,100% 100%)",
                        },
                      }}
                    >
                      {message.attachment && (
                        <ChatMedia attachment={message.attachment} />
                      )}
                      {!!message.text && (
                        <Typography
                          sx={{
                            whiteSpace: "pre-wrap",
                            fontSize: 14,
                            lineHeight: 1.55,
                          }}
                        >
                          {message.text}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.2,
                        }}
                      >
                        <Typography sx={{ fontSize: 10.5, color: "#78808B" }}>
                          {chatTime(message.timestamp)}
                        </Typography>
                        {mine && (
                          <DoneOutlined
                            aria-label="Mensagem enviada"
                            sx={{ fontSize: 15, color: "#78808B" }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              py: 1.25,
              bgcolor: "#F7F8FA",
              flexShrink: 0,
              borderTop: "1px solid #E4E8EF",
            }}
          >
            {file && (
              <Stack
                direction="row"
                sx={{
                  gap: 1,
                  alignItems: "center",
                  mb: 1,
                  p: 1,
                  bgcolor: "white",
                  borderRadius: "12px",
                }}
              >
                {file.type.startsWith("image/") ? (
                  <PhotoOutlined sx={{ color: "text.secondary" }} />
                ) : (
                  <HeadphonesOutlined sx={{ color: "text.secondary" }} />
                )}
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    overflowWrap: "anywhere",
                  }}
                >
                  {file.name}
                </Typography>
                <Action
                  label="Remover anexo"
                  disabled={busy}
                  onClick={() => {
                    setFile(null);
                    setUploaded(null);
                  }}
                >
                  <CloseOutlined />
                </Action>
              </Stack>
            )}
            {recording ? (
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "white",
                  borderRadius: "26px",
                  px: 1,
                  py: 0.5,
                }}
              >
                <Action
                  label="Cancelar gravação"
                  onClick={() => stopRecording(true)}
                >
                  <DeleteOutlineOutlined />
                </Action>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                  }}
                />
                <Typography sx={{ flex: 1, fontSize: 14 }}>
                  Gravando · {Math.floor(seconds / 60)}:
                  {String(seconds % 60).padStart(2, "0")}
                </Typography>
                <Action
                  label="Concluir gravação"
                  onClick={() => stopRecording()}
                >
                  <StopCircleOutlined sx={{ color: "error.main" }} />
                </Action>
              </Stack>
            ) : (
              <Stack
                component="form"
                onSubmit={send}
                direction="row"
                sx={{
                  alignItems: "flex-end",
                  gap: 0.5,
                  bgcolor: "white",
                  borderRadius: "26px",
                  px: 0.5,
                  py: 0.25,
                  border: "1px solid #EDF0F3",
                }}
              >
                <Action
                  label="Emojis"
                  disabled={busy}
                  onClick={() => setEmojiOpen((value) => !value)}
                  sx={{ width: 42, minWidth: 42, minHeight: 46 }}
                >
                  <InsertEmoticonOutlined />
                </Action>
                <Action
                  label="Adicionar anexo"
                  disabled={busy}
                  onClick={(event) => setAttachmentAnchor(event.currentTarget)}
                  sx={{ width: 42, minWidth: 42, minHeight: 46 }}
                >
                  <AttachFileOutlined />
                </Action>
                <InputBase
                  inputRef={composerInput}
                  fullWidth
                  multiline
                  maxRows={5}
                  placeholder="Digite uma mensagem"
                  inputProps={{ "aria-label": "Sua mensagem", maxLength: 4000 }}
                  value={text}
                  disabled={busy}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      send(event);
                    }
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 15,
                    minHeight: 46,
                    py: 1,
                    pr: 0.5,
                  }}
                />
                {hasContent ? (
                  <Action
                    label="Enviar"
                    type="submit"
                    disabled={busy || !connected}
                    sx={{
                      bgcolor: "#1C1C1C",
                      color: "white",
                      width: 44,
                      minWidth: 44,
                      minHeight: 44,
                      m: 0.25,
                      "&:hover": { bgcolor: "#38383E" },
                      "&.Mui-disabled": { bgcolor: "#E8E8ED" },
                    }}
                  >
                    <SendOutlined sx={{ fontSize: 21 }} />
                  </Action>
                ) : (
                  <Action
                    label="Gravar áudio"
                    disabled={busy}
                    onClick={startRecording}
                    sx={{ width: 44, minWidth: 44, minHeight: 46 }}
                  >
                    <MicOutlined />
                  </Action>
                )}
              </Stack>
            )}
            {emojiOpen && !recording && (
              <EmojiPicker disabled={busy} onSelect={(value) => {
                const input = composerInput.current;
                const start = input?.selectionStart ?? text.length;
                const end = input?.selectionEnd ?? start;
                const next = text.slice(0,start) + value + text.slice(end);
                if (next.length > 4000) return;
                setText(next);
                requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + value.length, start + value.length); });
              }} />
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 5,
            bgcolor: "#F5F7FA",
            backgroundImage: wallpaper,
          }}
        >
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: "#E6F1FD",
              color: "#626974",
              mb: 3,
            }}
          >
            <ChatBubbleOutlineOutlined sx={{ fontSize: 42 }} />
          </Avatar>
          <Typography
            sx={{ fontSize: 27, fontWeight: 500, letterSpacing: "-.5px" }}
          >
            Sua equipe, mais perto
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 14,
              maxWidth: 370,
              mt: 1,
              lineHeight: 1.8,
            }}
          >
            Escolha uma conversa para trocar mensagens, imagens e áudios com as
            pessoas da sua sede.
          </Typography>
        </Box>
      )}
      <input
        ref={imageInput}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        onChange={chooseFile}
        aria-label="Selecionar imagem"
      />
      <input
        ref={audioInput}
        type="file"
        hidden
        accept="audio/*"
        onChange={chooseFile}
        aria-label="Selecionar áudio"
      />
      <Menu
        anchorEl={attachmentAnchor}
        open={!!attachmentAnchor}
        onClose={() => setAttachmentAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setAttachmentAnchor(null);
            imageInput.current?.click();
          }}
        >
          <PhotoOutlined sx={{ mr: 1.5, color: "text.secondary" }} />
          Adicionar imagem
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAttachmentAnchor(null);
            audioInput.current?.click();
          }}
        >
          <HeadphonesOutlined sx={{ mr: 1.5, color: "text.secondary" }} />
          Adicionar áudio
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDetailsOpen(true);
          }}
        >
          Dados do contato
        </MenuItem>
        <MenuItem
          disabled={busy || recording}
          onClick={() => {
            setMenuAnchor(null);
            setSelected(null);
          }}
        >
          Fechar conversa
        </MenuItem>
      </Menu>
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Dados do contato</DialogTitle>
        <DialogContent>
          <Stack sx={{ alignItems: "center", py: 2, gap: 2 }}>
            <ContactAvatar
              photoUrl={selected?.photoUrl}
              sx={{
                width: 72,
                height: 72,
                bgcolor: "#E6F1FD",
                color: "#45454D",
              }}
            >
              {chatInitials(selected?.nome || "")}
            </ContactAvatar>
            <Typography sx={{ fontWeight: 600 }}>{selected?.nome}</Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Pessoa da sua equipe no Inteliagent.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
