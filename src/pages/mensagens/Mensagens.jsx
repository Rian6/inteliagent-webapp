import React, { useState } from "react";
import { Box, Typography, TextField, IconButton, List, ListItem, ListItemText, Avatar } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

function Mensagens() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState("João");

  // Simulando o envio de mensagem (você vai substituir por código de WebSocket)
  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "Você" }]);
      setMessage("");
    }
  };

  // Simulando a seleção de um contato
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    // Resetando as mensagens ao trocar de contato
    setMessages([]);
  };

  return (
    <Box sx={styles.container}>
      {/* Sidebar de Contatos */}
      <Box sx={styles.sidebar}>
        <Typography sx={styles.title}>Contatos</Typography>
        <List>
          {["João", "Maria", "Lucas"].map((contact) => (
            <ListItem button key={contact} onClick={() => handleSelectContact(contact)}>
              <Avatar sx={styles.avatar}>{contact.charAt(0)}</Avatar>
              <ListItemText primary={contact} sx={styles.listItemText} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Área de Chat */}
      <Box sx={styles.chatArea}>
        <Typography variant="h6" sx={styles.chatTitle}>
          {selectedContact}
        </Typography>
        <Box sx={styles.messagesContainer}>
          {/* Lista de Mensagens */}
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                ...styles.message,
                alignSelf: msg.sender === "Você" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "Você" ? "#dcf8c6" : "#fff",
              }}
            >
              <Typography>{msg.text}</Typography>
            </Box>
          ))}
        </Box>

        {/* Campo de Entrada de Mensagem */}
        <Box sx={styles.inputContainer}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Digite uma mensagem"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={styles.input}
          />
          <IconButton onClick={handleSendMessage} sx={styles.sendButton}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "80vh",
    width: '90vw',
    backgroundColor: "#f0f0f0",
  },
  sidebar: {
    width: "25%",
    backgroundColor: "#fff",
    borderRight: "1px solid #ddd",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "20px",
  },
  avatar: {
    backgroundColor: "#A9007A",
  },
  listItemText: {
    paddingLeft: "10px",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: "20px",
    height: "100%",
  },
  chatTitle: {
    fontSize: "1.25rem",
    marginBottom: "15px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    maxWidth: "70%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    borderRadius: "20px",
    padding: "10px",
  },
  sendButton: {
    backgroundColor: "#A9007A",
    color: "#fff",
    borderRadius: "50%",
    padding: "10px",
    "&:hover": {
      backgroundColor: "#128c7e",
    },
  },
};

export default Mensagens;
