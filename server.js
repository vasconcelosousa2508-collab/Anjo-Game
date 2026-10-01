const express = require('express');
const cors = require('cors');

const familiasRoutes = require('./routes/familias');
const participantesRoutes = require('./routes/participantes'); // <-- ADICIONE ESTA LINHA

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use('/api/familias', familiasRoutes);
app.use('/api/participantes', participantesRoutes); // <-- ADICIONE ESTA LINHA

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});