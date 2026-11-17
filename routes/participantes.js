const express = require('express');
const router = express.Router();
const db = require('../firebaseConfig');

const CAPACIDADE_ARVORE = 15; // Máximo de enfeites por árvore

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

// 2. GET: Informações do Protegido vindo do Banco
router.get('/:id/protegido', async (req, res) => {
  try {
    const { id } = req.params;
    const docAnjo = await db.collection('participantes').doc(id).get();

    if (!docAnjo.exists) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const dadosAnjo = docAnjo.data();

    if (!dadosAnjo.protegidoId) {
      return res.status(400).json({ erro: 'Sorteio ainda não realizado para este jogador.' });
    }

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

// 3. GET: Buscar Mensagens Reais (Enviadas e Recebidas)
router.get('/:id/mensagens', async (req, res) => {
  try {
    const { id } = req.params;

    const snapEnviadas = await db.collection('mensagens')
      .where('remetenteId', '==', id)
      .get();

    const snapRecebidas = await db.collection('mensagens')
      .where('destinatarioId', '==', id)
      .get();

    const formatarDoc = (doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        texto: d.texto,
        enfeite: d.enfeite,
        posicao: d.posicao ?? 0,
        arvoreNumero: d.arvoreNumero ?? 1,
        lida: d.lida ?? false,
        criadoEm: d.criadoEm ? d.criadoEm.toMillis() : 0
      };
    };

    const enviadas = snapEnviadas.docs.map(formatarDoc).sort((a, b) => a.criadoEm - b.criadoEm);
    const recebidas = snapRecebidas.docs.map(formatarDoc).sort((a, b) => a.criadoEm - b.criadoEm);

    res.json({ enviadas, recebidas });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ erro: 'Erro ao carregar mensagens.' });
  }
});

// 4. POST: Salvar Nova Mensagem e Enfeite no Firestore
router.post('/:id/mensagens', async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, enfeite } = req.body;

    if (!texto || !String(texto).trim()) {
      return res.status(400).json({ erro: 'O texto da mensagem é obrigatório.' });
    }

    const docAnjo = await db.collection('participantes').doc(id).get();
    if (!docAnjo.exists) {
      return res.status(404).json({ erro: 'Remetente não encontrado.' });
    }

    const dadosAnjo = docAnjo.data();
    const destinatarioId = dadosAnjo.protegidoId;

    if (!destinatarioId) {
      return res.status(400).json({ erro: 'Você ainda não possui um protegido sorteado.' });
    }

    const snapExistentes = await db.collection('mensagens')
      .where('destinatarioId', '==', destinatarioId)
      .get();

    const totalExistentes = snapExistentes.size;
    const posicao = totalExistentes % CAPACIDADE_ARVORE;
    const arvoreNumero = Math.floor(totalExistentes / CAPACIDADE_ARVORE) + 1;

    const novaMensagem = {
      familiaId: dadosAnjo.familiaId,
      remetenteId: id,
      destinatarioId: destinatarioId,
      texto: String(texto).trim(),
      enfeite: enfeite || 'bola-vermelha',
      posicao: posicao,
      arvoreNumero: arvoreNumero,
      lida: false,
      criadoEm: new Date()
    };

    const docRef = await db.collection('mensagens').add(novaMensagem);

    res.status(201).json({
      id: docRef.id,
      ...novaMensagem,
      criadoEm: novaMensagem.criadoEm.getTime()
    });

  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
});

// 5. PATCH: Marcar mensagem recebida como lida
router.patch('/:id/mensagens/:msgId/lida', async (req, res) => {
  try {
    const { id, msgId } = req.params;
    const msgRef = db.collection('mensagens').doc(msgId);
    const doc = await msgRef.get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Mensagem não encontrada.' });
    }

    if (doc.data().destinatarioId !== id) {
      return res.status(403).json({ erro: 'Sem permissão para alterar esta mensagem.' });
    }

    await msgRef.update({ lida: true });
    res.json({ id: msgId, lida: true });

  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status da mensagem.' });
  }
});

module.exports = router;