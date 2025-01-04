import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,  // Importando o Divider para as linhas horizontais
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GridViewIcon from "@mui/icons-material/GridView";
import Home from "./pages/Home/Home";
import Login from "./pages/login/Login";
import logoImage from "./assets/images/logo.png";
import Configuracao from "./pages/configuracao/Configuracao";
import Agentes from "./pages/agentes/Agentes";
import Planejamento from "./pages/planejamento/Planejamento";
import Mensagens from "./pages/mensagens/Mensagens";
import Control from "./pages/planejamento/abas/Control";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawerItems = [
    { text: "Home", path: "/home" },
    { text: "Mensagens", path: "/mensagens" },
    { text: "Planejamento", path: "/planejamento" },
    { text: "Agentes", path: "/agentes" },
  ];

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" style={{color: 'black', backgroundColor: "white" }}>
          <Toolbar>
            <IconButton
              color="black"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Prefeitura de Cascavel
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 280 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            {/* Cabeçalho do Drawer */}
            <div style={{ display: 'flex', marginLeft: 15, flexDirection: "row" }}>
              <img src={logoImage} alt="" style={{ marginTop: 22, marginRight: 10, width: 20, height: 20 }} />
              <h3>Prefeitura de Cascavel</h3>
            </div>

            {/* Linha horizontal após o cabeçalho */}
            <Divider sx={{ margin: '10px 0' }} />

            {/* Lista de Itens do Drawer */}
            <List>
              {drawerItems.map((item, index) => (
                <ListItem button key={index} component={Link} to={item.path} style={{ paddingTop: 0, paddingBottom: 0 }}>
                  <IconButton color="black" aria-label="open drawer" edge="start" sx={{ mr: 2 }}>
                    <GridViewIcon />
                  </IconButton>
                  <p style={{ color: "#666", fontSize: 15 }}>{item.text}</p>
                </ListItem>
              ))}
            </List>

            {/* Linha horizontal após a lista de itens */}
            <Divider sx={{ margin: '10px 0' }} />
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginTop: "64px", // To offset the AppBar
          }}
        >
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/planejamento" element={<Planejamento />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/login" element={<Login />} />
            <Route path="planejamento/cadastrar/:uuid" element={<Control/>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
