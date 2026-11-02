import { AUTH_URL } from "./tools/config";
import { api } from "./services/api";
import { updateProfile, updatePermissions } from "./services/session";
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Button,
  LinearProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  Menu,
  DashboardOutlined,
  ChatBubbleOutlined,
  RouteOutlined,
  GroupsOutlined,
  Logout,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  getSession,
  getSessionStatus,
  restoreSession,
  subscribe,
  logout,
} from "./services/session";
import Login from "./pages/login/Login";
import { design } from "./design";
const Perfil = lazy(() => import("./pages/perfil/Perfil"));
const Home = lazy(() => import("./pages/home/Home"));
const Mensagens = lazy(() => import("./pages/mensagens/Mensagens"));
const Planejamento = lazy(() => import("./pages/planejamento/Planejamento"));
const Agentes = lazy(() => import("./pages/agentes/Agentes"));
const Control = lazy(() => import("./pages/planejamento/abas/Control"));
const Configuracao = lazy(() => import("./pages/configuracao/Configuracao"));
const links = [
  ["Visão geral", "/home", DashboardOutlined],
  ["Planejamento", "/planejamento", RouteOutlined],
  ["Agentes", "/agentes", GroupsOutlined],
  ["Mensagens", "/mensagens", ChatBubbleOutlined],
];
function Shell() {
  const user = useSyncExternalStore(subscribe, getSession);
  const sessionStatus = useSyncExternalStore(subscribe, getSessionStatus);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (!user) return;
    let active = true;
    const refresh = () =>
      api
        .get(AUTH_URL + "/api/user/permissions")
        .then(({ data }) => {
          if (active)
            updatePermissions(user.id, {
              createPlanning: !!data.createPlanning,
              editPlanning: !!data.editPlanning,
              addVisits: !!data.addVisits,
              reorderVisits: !!data.reorderVisits,
            });
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [user?.id]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      api
        .get(AUTH_URL + "/api/user/me")
        .then(({ data }) => {
          if (active) updateProfile(data);
        })
        .catch(() => {});
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user?.id]);
  useEffect(() => {
    restoreSession();
  }, []);
  if (!sessionStatus.ready)
    return <LinearProgress aria-label="Restaurando sessão" />;
  if (!user && sessionStatus.error)
    return (
      <Stack
        sx={{
          p: 3,
          maxWidth: 600,
          mx: "auto",
          mt: 8,
        }}
        spacing={2}
      >
        <Alert severity="warning">{sessionStatus.error}</Alert>
        <Button onClick={restoreSession}>Tentar novamente</Button>
      </Stack>
    );
  if (!user) return <Login />;
  const navigation = (
    <Box
      sx={{
        p: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          px: 1,
          py: 2,
        }}
      >
        <Avatar
          sx={{
            background: "transparent",
            color: "#FFFFFF",
            fontFamily: "Ubuntu",
            fontWeight: 700,
            borderRadius: "14px",
          }}
        >
          <Box
            component="img"
            src="/brand/icon.svg"
            alt=""
            sx={{ width: 40, height: 40 }}
          />
        </Avatar>
        <Box>
          <Typography variant="h6">Inteliagent</Typography>
          <Typography variant="caption" color="text.secondary">
            Vigilância em saúde
          </Typography>
        </Box>
      </Stack>
      <Divider
        sx={{
          mb: 2,
        }}
      />
      <List aria-label="Navegação principal">
        {[
          ...links,
          ...(user.role === "ADMIN"
            ? [["Configuração", "/configuracao", SettingsOutlined]]
            : []),
        ].map(([title, path, Icon]) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            selected={location.pathname.startsWith(path)}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: "12px",
              mb: 1,
              "&.Mui-selected": {
                bgcolor: "#E6F1FD",
                color: "primary.dark",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: "inherit",
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary={title} />
          </ListItemButton>
        ))}
      </List>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          px: 2,
          mt: 4,
        }}
      >
        Inteliagent · Gestão de campo
      </Typography>
    </Box>
  );
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: 224,
          "& .MuiDrawer-paper": {
            width: 224,
            bgcolor: "background.paper",
            border: 0,
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {navigation}
      </Drawer>
      <Drawer
        aria-label="Navegação principal"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
          },
        }}
      >
        {navigation}
      </Drawer>
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid #E8E8ED",
            backgroundColor: "#FFFFFFF2",
            backdropFilter: "blur(12px)",
          }}
        >
          <Toolbar
            sx={{
              gap: 1,
              px: {
                xs: 2,
                sm: 3,
              },
              minHeight: {
                sm: 64,
              },
            }}
          >
            <IconButton
              aria-label="Abrir navegação"
              onClick={() => setOpen(true)}
              sx={{
                display: {
                  md: "none",
                },
                mr: 1,
              }}
            >
              <Menu />
            </IconButton>
            <Typography
              sx={{
                flexGrow: 1,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
              variant="body2"
              color="text.secondary"
            >
              Operações de campo
            </Typography>
            <IconButton component={Link} to="/perfil" aria-label="Meu perfil">
              <Avatar
                src={user.foto || undefined}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#E6F1FD",
                  color: "primary.dark",
                }}
              >
                {user.nome?.charAt(0)}
              </Avatar>
            </IconButton>
            <Button color="inherit" startIcon={<Logout />} onClick={logout}>
              Sair
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          id="conteudo"
          tabIndex={-1}
          sx={{
            p: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          <Suspense
            fallback={<LinearProgress aria-label="Carregando página" />}
          >
            <Routes>
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/home" element={<Home />} />
              <Route path="/mensagens" element={<Mensagens />} />
              <Route path="/planejamento" element={<Planejamento />} />
              <Route path="/agentes" element={<Agentes />} />
              <Route
                path="/configuracao"
                element={
                  user.role === "ADMIN" ? (
                    <Configuracao />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                }
              />
              <Route
                path="/planejamento/cadastrar/:uuid"
                element={<Control />}
              />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
