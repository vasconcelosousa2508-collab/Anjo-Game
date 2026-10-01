const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig'); // Note o '../' para voltar uma pasta e achar o firebaseConfig

// Função auxiliar para gerar código simples
function gerarCodigo() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 1. ROTA: Criar Família e Participantes
// (O caminho aqui fica '/' porque o prefixo '/api/familias' será definido no server.js)
router.post('/', async (req, res) => {
  try {
    const { nomeFamilia, participantes } = req.body;

    if (!nomeFamilia || !participantes || !Array.isArray(participantes) || participantes.length === 0) {
      return res.status(400).json({ erro: 'Informe o nome da família e ao menos 1 participante.' });
    }

    // Criar documento da Família
    const familiaRef = await db.collection('familias').add({
      nomeFamilia: nomeFamilia,
      criadoEm: new Date()
    });

    const resumoCodigos = [];

    // Criar cada participante
    for (let nome of participantes) {
      const nomeLimpo = String(nome).trim();
      if (!nomeLimpo) continue;

      const primeiroNome = nomeLimpo.split(' ')[0].toUpperCase();
      const codigoAcesso = primeiroNome + '-' + gerarCodigo();

      await db.collection('participantes').add({
        familiaId: familiaRef.id,
        nome: nomeLimpo,
        codigoAcesso: codigoAcesso
      });

      resumoCodigos.push({ nome: nomeLimpo, codigo: codigoAcesso });
    }

    res.status(201).json({
      familiaId: familiaRef.id,
      mensagem: 'Ambiente de jogo criado com sucesso!',
      codigos: resumoCodigos
    });

  } catch (error) {
    console.error('ERRO DETALHADO NO FIREBASE:', error);
    res.status(500).json({ erro: 'Erro ao salvar no banco de dados. Verifique o terminal do servidor.' });
  }
});

// 2. ROTA: Login do Participante na Família
router.post('/:id/login', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ erro: 'Digite seu código de acesso.' });
    }

    const snapshot = await db.collection('participantes')
      .where('familiaId', '==', id)
      .where('codigoAcesso', '==', String(codigo).trim().toUpperCase())
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ erro: 'Código de acesso inválido para esta família!' });
    }

    const participanteDoc = snapshot.docs[0];
    const dados = participanteDoc.data();

    res.json({
      id: participanteDoc.id,
      nome: dados.nome,
      codigoAcesso: dados.codigoAcesso
    });

  } catch (error) {
    console.error('ERRO NO LOGIN:', error);
    res.status(500).json({ erro: 'Erro ao tentar acessar.' });
  }
});

module.exports = router;