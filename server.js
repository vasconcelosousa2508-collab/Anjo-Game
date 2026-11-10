// dependencias
const express = require('express');
const cors = require('cors'); // permissão de acesso

// rotas
const familiasRoutes = require('./routes/familias');
const participantesRoutes = require('./routes/participantes'); 

// configurações do servidor
const app = express(); // cria

app.use(express.json()); // prepara p recepção de dados JSON
app.use(cors()); // habilita permisoes de acessos externos
app.use(express.static('public')); // os arquivos na pasta public são visiveis ao navegador

// ativa rotas
app.use('/api/familias', familiasRoutes); 
app.use('/api/participantes', participantesRoutes); // <-- ADICIONE ESTA LINHA

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});