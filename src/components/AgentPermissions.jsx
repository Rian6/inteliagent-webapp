import { AUTH_URL } from "../tools/config";
import { useState, useEffect, useRef } from "react";
import {
  Stack,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  TextField,
  Chip,
  LinearProgress,
  Box,
  Avatar,
  List,
  ListItemButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  SearchOutlined,
  PeopleOutlineOutlined,
  AssignmentOutlined,
  RouteOutlined,
  CheckCircleOutlined,
  ChevronRight,
  InfoOutlined,
} from "@mui/icons-material";
import { api, errorMessage } from "../services/api";
import { updatePermissions } from "../services/session";

const groups = [
  {
    title: "Planejamentos",
    icon: AssignmentOutlined,
    description: "Defina quem pode organizar o trabalho da equipe.",
    items: [
      {
        key: "createPlanning",
        label: "Cadastrar planejamentos",
        description:
          "Criar um planejamento com localidade, período e dados do boletim.",
      },
      {
        key: "editPlanning",
        label: "Editar planejamentos existentes",
        description:
          "Alterar os dados de um planejamento já cadastrado. Não libera a criação de novos.",
      },
    ],
  },
  {
    title: "Visitas e rota",
    icon: RouteOutlined,
    description: "Controle a inclusão de imóveis e a sequência do percurso.",
    items: [
      {
        key: "addVisits",
        label: "Adicionar visitas a planejamentos",
        description:
          "Incluir novos imóveis em um planejamento. Sem acesso para reordenar, eles entram no fim da rota.",
      },
      {
        key: "reorderVisits",
        label: "Alterar a ordem das visitas",
        description:
          "Reorganizar a sequência da rota. No web, também permite ordenar por proximidade. Não libera novas visitas.",
      },
    ],
  },
];
const keys = groups.flatMap((group) => group.items.map((item) => item.key));
const flags = (row) => Object.fromEntries(keys.map((key) => [key, !!row[key]]));
const count = (row) => keys.filter((key) => row[key]).length;
const normalized = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
const initials = (name) =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function PlanningPermissions() {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(""),
    [saveError, setSaveError] = useState(""),
    [notice, setNotice] = useState(""),
    [sede, setSede] = useState(null),
    [query, setQuery] = useState(""),
    [retry, setRetry] = useState(0),
    [selectedId, setSelectedId] = useState(null),
    [draft, setDraft] = useState(null),
    [busy, setBusy] = useState(false),
    [pendingUser, setPendingUser] = useState(null);
  const saveLock = useRef(false);
  const selected = rows.find((row) => row.id === selectedId);
  const dirty =
    !!selected && !!draft && keys.some((key) => draft[key] !== !!selected[key]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    Promise.all([
      api.get(AUTH_URL + "/api/user/planning-permissions", {
        signal: controller.signal,
      }),
      api.get(AUTH_URL + "/api/user/sede-info", { signal: controller.signal }),
    ])
      .then(([users, headquarters]) => {
        if (controller.signal.aborted) return;
        setRows(users.data.map((row) => ({ ...row, ...flags(row) })));
        setSede(headquarters.data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function select(row) {
    setSelectedId(row.id);
    setDraft(flags(row));
    setSaveError("");
    setNotice("");
    setPendingUser(null);
  }
  function requestSelection(row) {
    if (busy || row.id === selectedId) return;
    if (dirty) setPendingUser(row);
    else select(row);
  }
  async function save() {
    if (!selected || !dirty || saveLock.current) return false;
    const user = selected,
      submitted = { ...draft };
    saveLock.current = true;
    setBusy(true);
    setSaveError("");
    setNotice("");
    try {
      await api.put(
        AUTH_URL + "/api/user/planning-permissions/" + user.id,
        submitted,
      );
      setRows((current) =>
        current.map((row) =>
          row.id === user.id ? { ...row, ...submitted } : row,
        ),
      );
      updatePermissions(user.id, submitted);
      setNotice("Permissões salvas para " + user.nome + ".");
      return true;
    } catch (error) {
      setSaveError(errorMessage(error));
      return false;
    } finally {
      saveLock.current = false;
      setBusy(false);
    }
  }
  const filtered = rows.filter((row) =>
    normalized(row.nome + " " + row.email).includes(normalized(query)),
  );
  return (
    <Box component="section" aria-label="Permissões por usuário">
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography component="h2" variant="h6">
          Permissões por usuário
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Selecione uma pessoa e escolha o que ela pode fazer no web e no
          aplicativo.
        </Typography>
        {sede && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Sede {sede.codigo} · {sede.nome}
          </Typography>
        )}
      </Stack>
      {loading && (
        <LinearProgress aria-label="Carregando permissões" sx={{ mb: 2 }} />
      )}
      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              onClick={() => setRetry((value) => value + 1)}
            >
              Tentar novamente
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "300px minmax(0, 1fr)",
          },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Paper
          component="aside"
          aria-label="Usuários da equipe"
          sx={{ p: 2, borderColor: "divider", minWidth: 0 }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ fontWeight: 600 }}
            >
              Equipe
            </Typography>
            <Chip
              size="small"
              label={
                rows.length + (rows.length === 1 ? " usuário" : " usuários")
              }
            />
          </Stack>
          <TextField
            label="Buscar usuário por nome ou email"
            placeholder="Nome ou email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={loading}
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <List
            aria-label="Selecionar usuário"
            disablePadding
            sx={{ mt: 1.5, maxHeight: { xs: 260, lg: 540 }, overflowY: "auto" }}
          >
            {filtered.map((row) => (
              <ListItemButton
                key={row.id}
                selected={row.id === selectedId}
                disabled={busy}
                component="button"
                aria-label={"Configurar permissões de " + row.email}
                aria-pressed={row.id === selectedId}
                onClick={() => requestSelection(row)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  gap: 1.25,
                  mb: 0.5,
                  py: 1.5,
                  px: 1.25,
                  border: "1px solid",
                  borderColor:
                    row.id === selectedId ? "#BCD8F6" : "transparent",
                  alignItems: "flex-start",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 13,
                    bgcolor: row.id === selectedId ? "#D1E5FB" : "#F1F1F4",
                    color: "text.primary",
                  }}
                >
                  {initials(row.nome)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"

                    sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                  >
                    {row.nome}
                  </Typography>
                  <Typography
                    variant="caption"

                    component="div"
                    noWrap
                    title={row.email}
                    sx={{ color: "text.secondary" }}
                  >
                    {row.email}
                  </Typography>
                  <Typography
                    variant="caption"

                    component="div"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {row.role === "ADMIN" ? "Administrador" : "Agente"} ·{" "}
                    {count(row)}/4 permissões
                  </Typography>
                </Box>
                <ChevronRight
                  fontSize="small"
                  sx={{ mt: 0.5, color: "text.secondary", flexShrink: 0 }}
                />
              </ListItemButton>
            ))}
          </List>
          {!loading && !filtered.length && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", py: 3, textAlign: "center" }}
            >
              {rows.length
                ? "Nenhum usuário encontrado. Tente outro nome ou email."
                : "Nenhum usuário aprovado nesta sede."}
            </Typography>
          )}
        </Paper>
        {selected && draft ? (
          <Paper
            component="article"
            aria-label={"Permissões de " + selected.email}
            sx={{ borderColor: "divider", overflow: "hidden", minWidth: 0 }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#E6F1FD",
                  color: "text.primary",
                  width: 44,
                  height: 44,
                  fontSize: 16,
                }}
              >
                {initials(selected.nome)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  component="h3"
                  variant="h6"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {selected.nome}
                </Typography>
                <Typography
                  variant="body2"

                  sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
                >
                  {selected.email}
                </Typography>
                <Chip
                  size="small"
                  label={selected.role === "ADMIN" ? "Administrador" : "Agente"}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
            <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
              {notice && (
                <Alert severity="success" role="status">
                  {notice}
                </Alert>
              )}
              {saveError && (
                <Alert severity="error">
                  {saveError} Suas alterações foram mantidas. Tente salvar
                  novamente.
                </Alert>
              )}
              {groups.map(({ title, icon: Icon, description, items }) => (
                <Box
                  component="fieldset"
                  key={title}
                  sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
                >
                  <Typography
                    component="legend"
                    variant="subtitle1"

                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 0,
                    }}
                  >
                    <Icon fontSize="small" />
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"

                    sx={{ color: "text.secondary", mt: 0.5, mb: 1.5 }}
                  >
                    {description}
                  </Typography>
                  <Stack spacing={1}>
                    {items.map(({ key, label, description: explanation }) => (
                      <Box
                        key={key}
                        sx={{
                          border: "1px solid",
                          borderColor: draft[key] ? "#C7DFF7" : "divider",
                          bgcolor: draft[key] ? "#F4F8FE" : "background.paper",
                          borderRadius: "14px",
                          px: { xs: 1.5, sm: 2 },
                          py: 1.25,
                        }}
                      >
                        <FormControlLabel
                          labelPlacement="start"
                          sx={{
                            m: 0,
                            width: "100%",
                            justifyContent: "space-between",
                            gap: 1.5,
                            alignItems: "flex-start",
                            ".MuiFormControlLabel-label": {
                              flex: 1,
                              minWidth: 0,
                            },
                          }}
                          label={
                            <Box>
                              <Typography
                                component="span"

                                variant="body2"

                                sx={{ display: "block", fontWeight: 600 }}
                              >
                                {label}
                              </Typography>
                              <Typography
                                component="span"

                                variant="body2"

                                id={key + "-description"}
                                sx={{
                                  color: "text.secondary",
                                  display: "block",
                                  mt: 0.5,
                                }}
                              >
                                {explanation}
                              </Typography>
                              <Typography
                                component="span"

                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: 0.75,
                                  fontWeight: 600,
                                  color: draft[key]
                                    ? "#236044"
                                    : "text.secondary",
                                }}
                              >
                                {draft[key] ? "Permitido" : "Não permitido"}
                              </Typography>
                            </Box>
                          }
                          control={
                            <Switch
                              checked={draft[key]}
                              disabled={busy}
                              slotProps={{
                                input: {
                                  "aria-label": label + " · " + selected.email,
                                  "aria-describedby": key + "-description",
                                },
                              }}
                              onChange={(event) => {
                                setDraft((current) => ({
                                  ...current,
                                  [key]: event.target.checked,
                                }));
                                setNotice("");
                                setSaveError("");
                              }}
                            />
                          }
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
              <Stack
                direction="row"
                spacing={1}
                sx={{ color: "text.secondary", alignItems: "flex-start" }}
              >
                <InfoOutlined fontSize="small" sx={{ mt: 0.25 }} />
                <Typography variant="caption">
                  Realizar visitas já cadastradas continua disponível. Estas
                  opções também valem para administradores e não retiram o
                  acesso deles às configurações.
                </Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "#FAFAFC",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { sm: "center" },
                }}
              >
                <Box role="status" aria-live="polite">
                  <Typography
                    variant="body2"

                    sx={{
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    {!dirty && (
                      <CheckCircleOutlined
                        sx={{ fontSize: 17, color: "#237345" }}
                      />
                    )}
                    {dirty
                      ? "Alterações não salvas"
                      : "Nenhuma alteração pendente"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {dirty
                      ? "Salve para aplicar ao usuário selecionado."
                      : "O aplicativo recebe as permissões quando estiver conectado."}
                  </Typography>
                </Box>
                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  spacing={1}
                >
                  <Button
                    disabled={!dirty || busy}
                    onClick={() => {
                      setDraft(flags(selected));
                      setSaveError("");
                      setNotice("");
                    }}
                  >
                    Descartar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!dirty || busy}
                    aria-label={"Salvar permissões de " + selected.nome}
                    onClick={save}
                  >
                    {busy ? "Salvando…" : "Salvar alterações"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: { xs: 3, sm: 6 },
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                bgcolor: "#E6F1FD",
                color: "text.primary",
                width: 56,
                height: 56,
              }}
            >
              <PeopleOutlineOutlined />
            </Avatar>
            <Typography variant="h6">Escolha um usuário</Typography>
            <Typography
              sx={{ color: "text.secondary", mt: 1, maxWidth: 360, mx: "auto" }}
            >
              Selecione alguém na lista da equipe para consultar ou ajustar as
              permissões de planejamentos e visitas.
            </Typography>
          </Paper>
        )}
      </Box>
      <Dialog
        open={!!pendingUser}
        onClose={() => {
          if (!busy) setPendingUser(null);
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="unsaved-permissions-title"
      >
        <DialogTitle id="unsaved-permissions-title">
          Salvar antes de trocar de usuário?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Você alterou as permissões de {selected?.nome}. Escolha o que fazer
            antes de abrir outro usuário.
          </Typography>
          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            "& > :not(style) ~ :not(style)": { ml: 0 },
            "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } },
          }}
        >
          <Button disabled={busy} onClick={() => setPendingUser(null)}>
            Continuar editando
          </Button>
          <Button disabled={busy} onClick={() => select(pendingUser)}>
            Descartar e trocar
          </Button>
          <Button
            disabled={busy}
            variant="contained"
            onClick={async () => {
              const next = pendingUser;
              if (await save()) select(next);
            }}
          >
            {busy ? "Salvando…" : "Salvar e trocar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
