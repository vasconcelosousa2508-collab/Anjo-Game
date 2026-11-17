// dependencias
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // permissão de acesso

// rotas
const familiasRoutes = require('./routes/familias');
const participantesRoutes = require('./routes/participantes');

// configurações do servidor
const app = express(); // cria
const server = http.createServer(app);
const io = new Server(server);

app.set('io', io); // deixa o Socket.IO disponível nas rotas

app.use(express.json()); // prepara p recepção de dados JSON
app.use(cors()); // habilita permisoes de acessos externos
app.use(express.static('public')); // os arquivos na pasta public são visiveis ao navegador

// ativa rotas
app.use('/api/familias', familiasRoutes);
app.use('/api/participantes', participantesRoutes);

// conexão em tempo real por sala de participante
io.on('connection', (socket) => {
  socket.on('entrar_sala', (participanteId) => {
    if (participanteId) {
      socket.join('participante_' + participanteId);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});