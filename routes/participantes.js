const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');

// 1. GET: Perfil do participante
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

// 2. GET: Informações do Protegido (Amigo Secreto tirado)
router.get('/:id/protegido', async (req, res) => {
  // Rota declarada para entrega - Retorna dados simulados do protegido
  res.json({
    protegidoId: 'prot_123',
    nome: 'Clara (Simulado)',
    desejos: ['Livro de Fantasia', 'Caneca do Harry Potter'],
    statusSorteio: 'Sorteio Realizado'
  });
});

// 3. GET: Mensagens trocadas (Enviadas e Recebidas)
router.get('/:id/mensagens', async (req, res) => {
  // Rota declarada para entrega - Retorna mensagens simuladas
  res.json({
    enviadas: [
      { id: 'm1', texto: 'Olá, seu anjo passou por aqui!', data: '2026-10-05T14:00:00Z' }
    ],
    recebidas: [
      { id: 'm2', texto: 'Obrigado anjo! Adorei a dica!', data: '2026-10-05T15:30:00Z' }
    ]
  });
});

// 4. POST: Enviar nova mensagem para o protegido/anjo
router.post('/:id/mensagens', async (req, res) => {
  const { texto, destinatario } = req.body;
  if (!texto) {
    return res.status(400).json({ erro: 'Texto da mensagem é obrigatório.' });
  }

  // Resposta mock confirmando a estrutura da rota
  res.status(201).json({
    mensagem: 'Mensagem enviada com sucesso! (Estrutura de Rota)',
    detalhes: { texto, destinatario, data: new Date() }
  });
});

module.exports = router;