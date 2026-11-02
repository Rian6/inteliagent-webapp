import { laboratoryErrors } from "../../../reports/daily-summary";
import VisitReportFields from "../../../components/VisitReportFields";
import { reportMetadata } from "../../../reports/pncd";
import { uuid as createUuid } from "../../../tools/uuid";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Add,
  ArrowUpward,
  ArrowDownward,
  DeleteOutlined,
  EditOutlined,
  RouteOutlined,
  DescriptionOutlined,
  Close,
  MapOutlined,
  Search,
} from "@mui/icons-material";
import { api, errorMessage } from "../../../services/api";
import { getSession } from "../../../services/session";
import { SERVIDOR_MAIN } from "../../../tools/config";
import RouteMap from "../../../components/RouteMap";
import AddressSearch from "../../../components/AddressSearch";
import VisitDetails from "../../../components/VisitDetails";
import { ActionButton, Disclosure } from "../../../components/ui";
const empty = {
  nome: "",
  numero: "",
  cep: "",
  lat: "",
  lng: "",
  tipoVisita: "N",
  complemento: "",
  lado: "",
  boletimJson: "{}",
  tipoImovel: "",
};
export default function Visitas() {
  const { uuid } = useParams(),
    admin = getSession()?.role === "ADMIN",
    canAdd = !!getSession()?.permissions?.addVisits,
    canReorder = !!getSession()?.permissions?.reorderVisits;
  const [rows, setRows] = useState([]),
    [draft, setDraft] = useState(empty),
    [editing, setEditing] = useState(""),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [postalBusy, setPostalBusy] = useState(false);
  const [details, setDetails] = useState(""),
    [deleting, setDeleting] = useState(null);
  const [dragged, setDragged] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false),
    [mapOpen, setMapOpen] = useState(false),
    [visitQuery, setVisitQuery] = useState(""),
    [dirty, setDirty] = useState(false);
  const [editorError, setEditorError] = useState("");
  const lookupSequence = useRef(0),
    skipCep = useRef("");
  useEffect(() => {
    const c = new AbortController();
    api
      .get(SERVIDOR_MAIN + "/api/visitas-list/" + uuid, {
        signal: c.signal,
      })
      .then((r) => setRows(r.data))
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(errorMessage(e));
      });
    return () => c.abort();
  }, [uuid]);
  useEffect(() => {
    const cep = draft.cep.replace(/\D/g, "");
    if (cep.length !== 8 || cep === skipCep.current) return;
    const controller = new AbortController();
    const timer = setTimeout(() => lookupCep(cep, controller.signal), 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
      setPostalBusy(false);
    };
  }, [draft.cep]);
  async function lookupCep(cep, signal) {
    const ticket = ++lookupSequence.current,
      originalName = draft.nome,
      originalLat = draft.lat,
      originalLng = draft.lng;
    setPostalBusy(true);
    setEditorError("");
    try {
      const response = await fetch(
        "https://viacep.com.br/ws/" + cep + "/json/",
        {
          signal,
        },
      );
      if (!response.ok) throw new Error("Consulta de CEP indisponível.");
      const address = await response.json();
      if (address.erro)
        throw new Error(
          "CEP não encontrado. Confira os dígitos ou preencha o endereço manualmente.",
        );
      if (signal?.aborted || ticket !== lookupSequence.current) return;
      setDraft((previous) =>
        previous.cep.replace(/\D/g, "") === cep
          ? {
              ...previous,
              nome:
                previous.nome === originalName
                  ? address.logradouro || previous.nome
                  : previous.nome,
            }
          : previous,
      );
      skipCep.current = cep;
      // CEP coordinates describe the street; the agent can refine the pin on the map.
      try {
        const geoResponse = await fetch(
          "https://brasilapi.com.br/api/cep/v2/" + cep,
          {
            signal,
          },
        );
        if (geoResponse.ok) {
          const geo = await geoResponse.json(),
            point = geo.location?.coordinates;
          if (
            !signal?.aborted &&
            ticket === lookupSequence.current &&
            point?.latitude &&
            point?.longitude
          )
            setDraft((previous) =>
              previous.cep.replace(/\D/g, "") === cep &&
              previous.lat === originalLat &&
              previous.lng === originalLng
                ? {
                    ...previous,
                    lat: String(point.latitude),
                    lng: String(point.longitude),
                  }
                : previous,
            );
        }
      } catch {
        /* A missing geocode never blocks address registration. */
      }
    } catch (failure) {
      if (!signal?.aborted)
        setEditorError(failure.message || "Não foi possível consultar o CEP.");
    } finally {
      if (!signal?.aborted && ticket === lookupSequence.current)
        setPostalBusy(false);
    }
  }
  function chooseAddress(option) {
    skipCep.current = "";
    setDraft((previous) => ({
      ...previous,
      nome: option.logradouro,
      cep: option.cep,
      lat: "",
      lng: "",
    }));
  }
  function edit(row) {
    setSelected(row.id);
    if (!admin && !(row.pending && canAdd)) return;
    setEditorError("");
    skipCep.current = String(row.cep || "").replace(/\D/g, "");
    setEditing(row.id);
    setDraft({
      ...empty,
      ...row,
      nome: row.nome || "",
      numero: row.numero || "",
      cep: row.cep || "",
      lat: row.lat == null ? "" : String(row.lat),
      lng: row.lng == null ? "" : String(row.lng),
    });
    setEditorOpen(true);
  }
  function add(event) {
    if (editing ? !admin && !rows.find(row => row.id === editing)?.pending : !canAdd) { event?.preventDefault(); return; }
    const labErrors = laboratoryErrors(reportMetadata(draft.boletimJson));
    if (Object.keys(labErrors).length) {
      event?.preventDefault();
      setEditorError(Object.values(labErrors).join(" "));
      return;
    }
    event.preventDefault();
    if (!draft.nome.trim()) return;
    for (const [field, label, min, max] of [
      ["lat", "Latitude", -90, 90],
      ["lng", "Longitude", -180, 180],
    ]) {
      if (
        draft[field] !== "" &&
        (!Number.isFinite(Number(draft[field])) ||
          Number(draft[field]) < min ||
          Number(draft[field]) > max)
      ) {
        setEditorError(`${label}: informe um valor entre ${min} e ${max}.`);
        return;
      }
    }
    setEditorError("");
    const value = {
      ...draft,
      nome: draft.nome.trim(),
      id: editing || createUuid(),
      sequencia: editing
        ? rows.find((row) => row.id === editing)?.sequencia
        : null,
      lat: draft.lat === "" ? null : Number(draft.lat),
      lng: draft.lng === "" ? null : Number(draft.lng),
      pending: editing
        ? !!rows.find((row) => row.id === editing)?.pending
        : true,
    };
    setRows((previous) =>
      editing
        ? previous.map((row) =>
            row.id === editing
              ? {
                  ...row,
                  ...value,
                }
              : row,
          )
        : [...previous, value],
    );
    setDraft(empty);
    setEditing("");
    skipCep.current = "";
    setSelected("");
    setEditorOpen(false);
    setDirty(true);
    setNotice(
      "Visita " +
        (editing ? "atualizada" : "adicionada") +
        " na lista. Salve as visitas para confirmar.",
    );
  }
  function move(index, delta) {
    if (!canReorder) return;
    setRows((previous) => {
      const next = [...previous];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
    setDirty(true);
  }
  function drop(index) {
    if (!canReorder || dragged == null || dragged === index) return;
    setRows((previous) => {
      const next = [...previous],
        [row] = next.splice(dragged, 1);
      next.splice(index, 0, row);
      return next;
    });
    setDragged(null);
    setDirty(true);
  }
  async function remove(row) {
    setError("");
    if (!row.pending) {
      try {
        await api.delete(SERVIDOR_MAIN + "/api/visita/" + row.id);
      } catch (e) {
        setError(errorMessage(e));
        return;
      }
    }
    setRows((previous) => previous.filter((item) => item.id !== row.id));
    setDirty(true);
    if (editing === row.id) {
      setEditing("");
      setDraft(empty);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const editable = rows.filter((row) => (row.pending ? canAdd : admin));
      if (editable.length)
        await api.post(
          SERVIDOR_MAIN + "/api/visita/salvar",
          editable.map((row) => ({
            ...row,
            uuid: row.id,
            idPlanejamento: uuid,
            sequencia: row.sequencia ?? null,
          })),
        );
      // Mark confirmed inserts before reordering, so a retry cannot insert duplicates.
      setRows((previous) =>
        previous.map((row) => ({ ...row, pending: false })),
      );
      if (canReorder)
        await api.post(SERVIDOR_MAIN + "/api/visita/reordenar", {
          idPlanejamento: uuid,
          ids: rows.map((row) => row.id),
        });
      const fresh = await api.get(SERVIDOR_MAIN + "/api/visitas-list/" + uuid);
      setRows(fresh.data);

      setDirty(false);
      setNotice(
        "Visitas salvas. O aplicativo recebe as atualizações automaticamente.",
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function optimize() {
    if (!canReorder) return;
    if (rows.some((row) => row.lat == null || row.lng == null)) {
      setError("Marque a posição das visitas no mapa para ordenar a rota.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        SERVIDOR_MAIN + "/api/optimize-route",
        rows.map((row, i) => ({
          id: i + 1,
          lat: row.lat,
          lng: row.lng,
        })),
      );
      setRows(data.map((item) => rows[Number(item.id) - 1]));
      setDirty(true);
      setNotice("Ordem por proximidade calculada. Salve para confirmar.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const mapVisits = [
    ...rows,
    ...(draft.lat !== "" && draft.lng !== ""
      ? [
          {
            ...draft,
            id: "draft",
          },
        ]
      : []),
  ];
  const visible = rows
    .map((row, index) => ({
      row,
      index,
    }))
    .filter(({ row }) =>
      `${row.nome || ""} ${row.numero || ""} ${row.cep || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(visitQuery.toLocaleLowerCase("pt-BR")),
    );
  return (
    <Stack spacing={2}>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      <Paper
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          sx={{
            alignItems: {
              sm: "center",
            },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6">
              Visitas da rota{" "}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                ({rows.length})
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize os imóveis e consulte os atendimentos.
            </Typography>
          </Box>
          <Stack
            direction="row"
            sx={{
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <ActionButton
              variant="outline"
              startIcon={<MapOutlined fontSize="small" />}
              onClick={() => setMapOpen((value) => !value)}
            >
              {mapOpen ? "Ocultar mapa" : "Ver mapa"}
            </ActionButton>
            {canAdd && (
              <ActionButton
                startIcon={<Add fontSize="small" />}
                disabled={busy}
                onClick={() => setEditorOpen(true)}
              >
                {draft.nome || editing
                  ? "Continuar cadastro"
                  : "Adicionar visita"}
              </ActionButton>
            )}
          </Stack>
        </Stack>
        <TextField
          fullWidth
          size="small"
          label="Buscar visita por endereço, número ou CEP"
          value={visitQuery}
          onChange={(event) => setVisitQuery(event.target.value)}
          sx={{
            mb: 1,
          }}
        />
        <List disablePadding>
          {visible.map(({ row, index: i }) => (
            <ListItem
              key={row.id}
              divider
              draggable={canReorder && !busy}
              onDragStart={() => setDragged(i)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => drop(i)}
              onDragEnd={() => setDragged(null)}
              sx={{
                px: 0,
                py: 1.5,
                flexWrap: "wrap",
                gap: 1,
                bgcolor: row.id === selected ? "#EDF6F2" : undefined,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "primary.light",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.dark",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </Box>
              <ListItemText
                sx={{
                  minWidth: 150,
                  flex: "1 1 180px",
                }}
                primary={
                  i +
                  1 +
                  ". " +
                  (row.nome || "Visita") +
                  ", " +
                  (row.numero || "s/n")
                }
                secondary={[
                  row.cep,
                  row.tipoVisita === "R" ? "Retorno" : "Normal",
                  row.pending ? "Aguardando salvar" : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  ml: "auto",
                }}
              >
                {!row.pending && (
                  <Tooltip title="Consultar ficha">
                    <IconButton
                      aria-label={"Consultar ficha da visita " + (i + 1)}
                      onClick={() => setDetails(row.id)}
                    >
                      <DescriptionOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {(admin || canAdd || canReorder) && (
                  <>
                    {(admin || (row.pending && canAdd)) && (
                      <Tooltip title="Editar imóvel">
                        <IconButton
                          aria-label={"Editar visita " + (i + 1)}
                          disabled={busy}
                          onClick={() => edit(row)}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canReorder && (
                      <>
                        <Tooltip title="Mover para cima">
                          <span>
                            <IconButton
                              aria-label={
                                "Mover visita " + (i + 1) + " para cima"
                              }
                              disabled={i === 0 || busy}
                              onClick={() => move(i, -1)}
                            >
                              <ArrowUpward fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Mover para baixo">
                          <span>
                            <IconButton
                              aria-label={
                                "Mover visita " + (i + 1) + " para baixo"
                              }
                              disabled={i === rows.length - 1 || busy}
                              onClick={() => move(i, 1)}
                            >
                              <ArrowDownward fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                    {(admin || (row.pending && canAdd)) && (
                      <Tooltip title="Excluir visita">
                        <IconButton
                          aria-label={"Excluir visita " + (i + 1)}
                          disabled={busy}
                          onClick={() => setDeleting(row)}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
        {!visible.length && (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">
              {visitQuery
                ? "Nenhuma visita corresponde à busca."
                : "Nenhuma visita nesta rota."}
            </Typography>
            {canAdd && !visitQuery && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Use Adicionar visita para cadastrar o primeiro imóvel.
              </Typography>
            )}
          </Box>
        )}
        {(admin || canAdd || canReorder) && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              alignItems: {
                sm: "center",
              },
              justifyContent: "space-between",
              gap: 2,
              pt: 2,
            }}
          >
            <Typography
              variant="body2"
              color={dirty ? "primary.dark" : "text.secondary"}
            >
              {dirty
                ? "Há alterações na rota para salvar."
                : "A ordem da lista define a sequência das visitas."}
            </Typography>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              sx={{
                gap: 1,
              }}
            >
              {canReorder && (
                <ActionButton
                  variant="ghost"
                  startIcon={<RouteOutlined fontSize="small" />}
                  disabled={busy || rows.length < 2}
                  onClick={optimize}
                >
                  Ordenar por proximidade
                </ActionButton>
              )}
              <ActionButton
                disabled={busy || !dirty || !rows.length}
                onClick={save}
              >
                {busy ? "Salvando…" : "Salvar visitas"}
              </ActionButton>
            </Stack>
          </Stack>
        )}
      </Paper>
      {mapOpen && (
        <Paper
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Mapa e ordem das visitas</Typography>
            <RouteMap
              visits={mapVisits}
              selected={selected}
              onSelect={(row) => {
                if (admin || (row.pending && canAdd)) edit(row);
                else if (!row.pending) setDetails(row.id);
              }}
              onMapClick={
                canAdd && !busy
                  ? (lat, lng) => {
                      setDraft((previous) => ({
                        ...previous,
                        lat: String(lat),
                        lng: String(lng),
                      }));
                      setEditorOpen(true);
                    }
                  : undefined
              }
            />
            <Typography variant="body2" color="text.secondary">
              Selecione um imóvel para editar ou clique no mapa para marcar um
              novo ponto.
            </Typography>
          </Stack>
        </Paper>
      )}
      <Dialog
        open={
          editorOpen &&
          (editing
            ? admin ||
              (rows.find((row) => row.id === editing)?.pending && canAdd)
            : canAdd)
        }
        onClose={() => setEditorOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {editing ? "Editar visita" : "Adicionar visita"}
          <IconButton
            aria-label="Fechar cadastro de visita"
            onClick={() => setEditorOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Box
          component="form"
          id="visit-editor"
          onSubmit={add}
          sx={{
            display: "contents",
          }}
        >
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {editorError && <Alert severity="error">{editorError}</Alert>}
              <TextField
                required
                autoFocus
                fullWidth
                label="Endereço"
                value={draft.nome}
                disabled={busy}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    nome: event.target.value,
                  })
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 255,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Número do imóvel"
                value={draft.numero}
                disabled={busy}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    numero: event.target.value,
                  })
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 32,
                  },
                }}
              />
              <Disclosure
                title="Buscar endereço"
                summary={draft.cep || "Consultar CEP ou pesquisar uma rua"}
              >
                <Stack
                  spacing={2}
                  sx={{
                    pt: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    label="CEP"
                    value={draft.cep}
                    disabled={busy}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        cep: event.target.value
                          .replace(/[^0-9-]/g, "")
                          .slice(0, 9),
                      })
                    }
                    helperText={
                      postalBusy ? "Buscando endereço e posição…" : undefined
                    }
                  />
                  <AddressSearch onSelect={chooseAddress} disabled={busy} />
                </Stack>
              </Disclosure>
              <Disclosure
                title="Dados do boletim"
                summary="Quarteirão, identificação e horário"
              >
                <VisitReportFields draft={draft} onChange={setDraft} />
              </Disclosure>
              <Disclosure
                title="Dados complementares"
                summary={draft.complemento || "Complemento e tipo da visita"}
              >
                <Stack
                  spacing={2}
                  sx={{
                    pt: 1,
                  }}
                >
                  <TextField
                    label="Complemento"
                    value={draft.complemento || ""}
                    disabled={busy}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        complemento: event.target.value,
                      })
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength: 255,
                      },
                    }}
                  />
                  <TextField
                    select
                    label="Tipo da visita"
                    value={draft.tipoVisita || "N"}
                    disabled={busy}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        tipoVisita: event.target.value,
                      })
                    }
                  >
                    <MenuItem value="N">Normal</MenuItem>
                    <MenuItem value="R">Retorno</MenuItem>
                  </TextField>
                </Stack>
              </Disclosure>
              <Disclosure
                title="Localização no mapa"
                summary={
                  draft.lat !== "" && draft.lng !== ""
                    ? "Ponto definido · Ajustar localização"
                    : "Opcional · Marcar ou informar coordenadas"
                }
              >
                <Stack
                  spacing={2}
                  sx={{
                    pt: 1,
                  }}
                >
                  <RouteMap
                    visits={mapVisits}
                    selected={
                      draft.lat !== "" && draft.lng !== "" ? "draft" : selected
                    }
                    height={280}
                    onMapClick={(lat, lng) =>
                      setDraft((previous) => ({
                        ...previous,
                        lat: String(lat),
                        lng: String(lng),
                      }))
                    }
                  />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      gap: 2,
                    }}
                  >
                    {[
                      ["lat", "Latitude", -90, 90],
                      ["lng", "Longitude", -180, 180],
                    ].map(([field, label, min, max]) => (
                      <TextField
                        key={field}
                        type="number"
                        label={label}
                        disabled={busy}
                        value={draft[field]}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            [field]: event.target.value,
                          })
                        }
                        slotProps={{
                          htmlInput: {
                            min,
                            max,
                            step: "any",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Stack>
              </Disclosure>
            </Stack>
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => {
                if (editing) {
                  setEditing("");
                  setDraft(empty);
                  skipCep.current = "";
                }
                setEditorOpen(false);
              }}
            >
              {editing ? "Cancelar edição" : "Fechar"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={editing ? <EditOutlined /> : <Add />}
              disabled={busy || postalBusy}
            >
              {editing ? "Atualizar visita na lista" : "Adicionar à lista"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <VisitDetails id={details} onClose={() => setDetails("")} />
      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Excluir visita da rota?</DialogTitle>
        <DialogContent>
          O imóvel {deleting?.nome}, {deleting?.numero || "s/n"} será removido
          da rota. A exclusão será recebida pelos aparelhos.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancelar</Button>
          <Button
            color="error"
            onClick={async () => {
              await remove(deleting);
              setDeleting(null);
            }}
          >
            Excluir visita
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
