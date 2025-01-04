import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Conectar ao servidor WebSocket
const socket = io('http://localhost:5000');

// Componente principal
function Mensagens() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [id, setId] = useState(2); // ID do usuário (a ser fornecido, alterado de uuid para id)

  // Carregar usuários do servidor
  useEffect(() => {
    axios.get('http://localhost:5000/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Erro ao carregar usuários:', error));
  }, []);

  // Carregar mensagens de um usuário
  useEffect(() => {
    if (id) {
      socket.emit('load_messages', { id }); // Passando id ao invés de uuid
      socket.on('all_messages', (loadedMessages) => {
        // Adicionar apenas mensagens que ainda não estão no estado
        setMessages(loadedMessages);
      });

      // Ouvindo o evento de nova mensagem
      socket.on('receive_message', (message) => {
        // Adicionar mensagem se ela não estiver duplicada
        setMessages(prevMessages => {
          const exists = prevMessages.some(msg => msg.timestamp === message.timestamp);
          if (!exists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      });
    }
    console.log(messages);
  }, [id]);

  // Enviar mensagem
  const sendMessage = () => {
    if (message && selectedUser) {
        const data = {
            sender: id,
            recipient: selectedUser.id,
            text: message,
            timestamp: new Date().toISOString(),
        };

        socket.emit('send_message', data); // Emitindo a mensagem para o servidor
        setMessages(prevMessages => [
            ...prevMessages
        ]);
        setMessage('');
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.chatContainer}>
        <div style={styles.userList}>
          <h2>Usuários</h2>
          {users.map(user => (
            user && user.id != id &&
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                ...styles.userBtn,
                ...(selectedUser && selectedUser.id == user.id ? styles.userBtnSelected : {}),
              }}
            >
              {user.nome}
            </button>
          ))}
        </div>

        {selectedUser && (
          <div style={styles.chatBox}>
            <h2>Conversando com: {selectedUser.nome}</h2>
            <div style={styles.messageList}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.message,
                    ...(msg.sender == id ? styles.sent : styles.received),
                  }}
                >
                  <strong>{msg.sender == id ? 'Você' : selectedUser.nome}:</strong> {msg.text}
                  <span style={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div style={styles.inputContainer}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem..."
                style={styles.messageInput}
              />
              <button
                onClick={sendMessage}
                style={{
                  ...styles.sendBtn,
                  ':hover': styles.sendBtnHover,
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: 0,
  },
  app: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90vh',
    width: '90vw',
  },
  chatContainer: {
    display: 'flex',
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  userList: {
    width: '30%',
    padding: '20px',
    backgroundColor: '#A9007A',
    color: 'white',
    overflowY: 'auto',
  },
  userBtn: {
    backgroundColor: '#A9007A',
    color: 'white',
    border: 'none',
    padding: '10px',
    width: '100%',
    margin: '5px 0',
    cursor: 'pointer',
    borderRadius: '5px',
    textAlign: 'left',
    transition: 'background-color 0.3s',
  },
  userBtnHover: {
    backgroundColor: '#8e0060',
  },
  userBtnSelected: {
    backgroundColor: '#9d0077',
  },
  chatBox: {
    width: '70%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  messageList: {
    flexGrow: 1,
    marginBottom: '20px',
    paddingRight: '10px',
    overflowY: 'auto',
  },
  message: {
    marginBottom: '15px',
  },
  sent: {
    textAlign: 'right',
  },
  received: {
    textAlign: 'left',
  },
  timestamp: {
    fontSize: '0.8em',
    color: '#888',
    marginLeft: '10px',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  messageInput: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    resize: 'none',
    minHeight: '50px',
  },
  sendBtn: {
    backgroundColor: '#A9007A',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  sendBtnHover: {
    backgroundColor: '#8e0060',
  },
};

export default Mensagens;
