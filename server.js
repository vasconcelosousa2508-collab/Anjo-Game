// server.js
const express = require('express');
const cors = require('cors');
const db = require('./firebaseConfig');

const app = express();
app.use(express.json());
app.use(cors());

// Serve os arquivos estáticos da pasta "public"
app.use(express.static('public'));

// ROTA 1: Criar uma nova sala (salvar o nome no Firestore)
app.post('/api/salas', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'O nome é obrigatório' });
    }

    // Grava na coleção "salas" usando a API nativa do Firestore
    const docRef = await db.collection('salas').add({
      nome: nome,
      criadoEm: new Date()
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ erro: 'Erro ao criar sala no banco de dados' });
  }
});

// ROTA 2: Buscar dados de uma sala específica pelo ID
app.get('/api/salas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('salas').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Sala não encontrada' });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    res.status(500).json({ erro: 'Erro ao buscar sala' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});