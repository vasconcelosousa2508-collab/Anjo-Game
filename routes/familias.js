const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');

function gerarCodigo() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Embaralhamento seguro que garante que NINGUÉM tire a si mesmo
function realizarSorteioAleatorio(listaOriginal) {
  let sorteados = [...listaOriginal];
  let valido = false;

  // Tenta embaralhar até que nenhum elemento fique na sua posição original
  while (!valido) {
    // Embaralha (Fisher-Yates)
    for (let i = sorteados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sorteados[i], sorteados[j]] = [sorteados[j], sorteados[i]];
    }

    // Checa se alguém tirou a si mesmo
    valido = true;
    for (let i = 0; i < listaOriginal.length; i++) {
      if (listaOriginal[i].id === sorteados[i].id) {
        valido = false; // Se alguém se tirou, refaz o embaralhamento
        break;
      }
    }
  }

  return sorteados;
}

// 1. ROTA: Criar Família, Participantes e Sortear
router.post('/', async (req, res) => {
  try {
    const { nomeFamilia, participantes } = req.body;

    if (!nomeFamilia || !participantes || !Array.isArray(participantes) || participantes.length < 2) {
      return res.status(400).json({ erro: 'Informe o nome da família e pelo menos 2 participantes.' });
    }

    const familiaRef = await db.collection('familias').add({
      nomeFamilia: nomeFamilia,
      criadoEm: new Date()
    });

    const participantesPreparados = [];
    for (let nome of participantes) {
      const nomeLimpo = String(nome).trim();
      if (!nomeLimpo) continue;

      const primeiroNome = nomeLimpo.split(' ')[0].toUpperCase();
      const codigoAcesso = primeiroNome + '-' + gerarCodigo();
      const docRef = db.collection('participantes').doc();

      participantesPreparados.push({
        ref: docRef,
        id: docRef.id,
        nome: nomeLimpo,
        codigoAcesso: codigoAcesso
      });
    }

    if (participantesPreparados.length < 2) {
      return res.status(400).json({ erro: 'Pelo menos 2 participantes válidos são necessários.' });
    }

    // Gera a lista de protegidos de forma imprevisível
    const listaProtegidos = realizarSorteioAleatorio(participantesPreparados);
    const resumoCodigos = [];

    for (let i = 0; i < participantesPreparados.length; i++) {
      const anjo = participantesPreparados[i];
      const protegido = listaProtegidos[i];

      await anjo.ref.set({
        familiaId: familiaRef.id,
        nome: anjo.nome,
        codigoAcesso: anjo.codigoAcesso,
        protegidoId: protegido.id
      });

      resumoCodigos.push({ nome: anjo.nome, codigo: anjo.codigoAcesso });
    }

    res.status(201).json({
      familiaId: familiaRef.id,
      mensagem: 'Jogo criado e sorteio realizado com sucesso!',
      codigos: resumoCodigos
    });

  } catch (error) {
    console.error('ERRO DETALHADO NO FIREBASE:', error);
    res.status(500).json({ erro: 'Erro ao salvar no banco de dados.' });
  }
});

// 2. ROTA: Login
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