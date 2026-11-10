const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');

// GET: Perfil do participante
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('participantes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const dados = doc.data();
    res.json({
      id: doc.id,
      nome: dados.nome,
      familiaId: dados.familiaId
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
});

// GET: Informações do Protegido vindo do Banco
router.get('/:id/protegido', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca participante logado
    const docAnjo = await db.collection('participantes').doc(id).get();

    if (!docAnjo.exists) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const dadosAnjo = docAnjo.data();

    if (!dadosAnjo.protegidoId) {
      return res.status(400).json({ erro: 'Sorteio ainda não realizado para este jogador.' });
    }

    // Busca protegido usando o ID armazenado no sorteio
    const docProtegido = await db.collection('participantes').doc(dadosAnjo.protegidoId).get();

    if (!docProtegido.exists) {
      return res.status(404).json({ erro: 'Protegido não encontrado.' });
    }

    const dadosProtegido = docProtegido.data();

    res.json({
      protegidoId: docProtegido.id,
      nome: dadosProtegido.nome
    });

  } catch (error) {
    console.error('Erro ao buscar protegido:', error);
    res.status(500).json({ erro: 'Erro ao buscar seu protegido.' });
  }
});

// GET: Mensagens trocadas (Simulado)
router.get('/:id/mensagens', async (req, res) => {
  res.json({
    enviadas: [],
    recebidas: []
  });
});

// POST: Enviar nova mensagem
router.post('/:id/mensagens', async (req, res) => {
  const { texto, destinatario } = req.body;
  if (!texto) {
    return res.status(400).json({ erro: 'Texto da mensagem é obrigatório.' });
  }

  res.status(201).json({
    mensagem: 'Mensagem enviada com sucesso! (Estrutura de Rota)',
    detalhes: { texto, destinatario, data: new Date() }
  });
});

module.exports = router;