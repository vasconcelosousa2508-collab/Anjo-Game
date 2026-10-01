const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');

// GET: Buscar participante por ID
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
    console.error('Erro ao buscar participante:', error);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

module.exports = router;