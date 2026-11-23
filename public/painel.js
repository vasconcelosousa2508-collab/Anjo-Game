const params = new URLSearchParams(window.location.search);
const participanteId = params.get('id');

const PainelUtils = window.PainelUtils;
const CATALOGO_ENFEITES = PainelUtils.CATALOGO_ENFEITES;

let mensagensRecebidas = [];
let mensagensEnviadas = [];
let arvoreAtualRecebidos = 1;
let arvoreAtualEnviados = 1;

if (!participanteId || sessionStorage.getItem('participanteId') !== participanteId) {
  alert('Sessão inválida! Faça login novamente.');
  window.location.href = '/';
} else {
  montarSeletorEnfeites();
  carregarDados();
  conectarTempoReal();

  ativarSwipeArvore('areaSwipeRecebidos', function(direcao) {
    const total = PainelUtils.obterMaiorArvore(mensagensRecebidas);
    const proxima = arvoreAtualRecebidos + direcao;
    if (proxima >= 1 && proxima <= total) {
      arvoreAtualRecebidos = proxima;
      atualizarTelaMensagens('recebidas');
    }
  });

  ativarSwipeArvore('areaSwipeEnviados', function(direcao) {
    const total = PainelUtils.obterMaiorArvore(mensagensEnviadas);
    const proxima = arvoreAtualEnviados + direcao;
    if (proxima >= 1 && proxima <= total) {
      arvoreAtualEnviados = proxima;
      atualizarTelaMensagens('enviadas');
    }
  });
}

document.getElementById('formRecado').addEventListener('submit', enviarMensagemReal);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') fecharPopupCartao();
});

function montarSeletorEnfeites() {
  const fieldset = document.getElementById('containerSeletorEnfeite');
  const grade = document.createElement('div');
  grade.className = 'grade-enfeites';

  CATALOGO_ENFEITES.forEach(function(item, index) {
    const label = document.createElement('label');
    label.className = 'opcao-enfeite';
    label.title = item.nome;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'enfeite';
    input.value = item.id;
    if (index === 0) input.checked = true;

    const caixa = document.createElement('span');
    caixa.className = 'caixa-enfeite';

    const icone = document.createElement('img');
    icone.src = '/assets/' + item.id + '.svg';
    icone.alt = item.nome;
    caixa.appendChild(icone);

    const legenda = document.createElement('span');
    legenda.className = 'legenda-enfeite';
    legenda.textContent = item.nome;

    label.append(input, caixa, legenda);
    grade.appendChild(label);
  });

  fieldset.appendChild(grade);
}

function navegarPara(idTela) {
  document.querySelectorAll('.tela').forEach(function(tela) {
    tela.classList.remove('ativa');
  });
  document.getElementById(idTela).classList.add('ativa');
}

function trocarAbaMobile(grupo, abaAlvo) {
  const layoutId = grupo === 'perfil' ? 'layoutPerfil' : 'layoutProtegido';
  const layout = document.getElementById(layoutId);
  if (layout) layout.dataset.abaAtiva = abaAlvo;

  document.querySelectorAll('.tab-btn[data-grupo="' + grupo + '"]').forEach(function(btn) {
    btn.classList.toggle('ativa', btn.dataset.alvo === abaAlvo);
  });
}

async function carregarDados() {
  try {
    const resposta = await fetch('/api/participantes/' + participanteId);
    const dados = await resposta.json();
    if (resposta.ok) {
      document.getElementById('nomeJogador').textContent = dados.nome;
      document.getElementById('perfilNome').textContent = dados.nome || 'Não informado';
      document.getElementById('perfilNomeDesktop').textContent = dados.nome || 'Não informado';
    }

    const respostaProtegido = await fetch('/api/participantes/' + participanteId + '/protegido');
    const protegido = await respostaProtegido.json();
    const nomeProt = (respostaProtegido.ok && protegido.nome) ? protegido.nome : (protegido.erro || 'Não definido');
    document.getElementById('nomeProtegido').textContent = nomeProt;
    document.getElementById('nomeProtegidoDesktop').textContent = nomeProt;

    await carregarMensagens();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

function conectarTempoReal() {
  if (typeof io === 'undefined') return;
  const socket = io();

  socket.on('connect', function() {
    socket.emit('entrar_sala', participanteId);
  });

  socket.on('nova_mensagem', function(novaMsg) {
    if (mensagensRecebidas.some(function(m) { return m.id === novaMsg.id; })) return;
    mensagensRecebidas.push(novaMsg);
    arvoreAtualRecebidos = PainelUtils.obterMaiorArvore(mensagensRecebidas);
    atualizarBadgeMenu();
    atualizarTelaMensagens('recebidas');
  });

  socket.on('mensagem_lida', function(dados) {
    const msg = mensagensRecebidas.find(function(m) { return m.id === dados.id; });
    if (msg && !msg.lida) {
      msg.lida = true;
      atualizarBadgeMenu();
      atualizarTelaMensagens('recebidas');
    }
  });
}

function ativarSwipeArvore(elementoId, aoDeslizar) {
  const el = document.getElementById(elementoId);
  if (!el) return;
  let inicioX = 0;
  let inicioY = 0;

  el.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    inicioX = e.touches[0].clientX;
    inicioY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', function(e) {
    if (e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - inicioX;
    const deltaY = e.changedTouches[0].clientY - inicioY;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      aoDeslizar(deltaX < 0 ? 1 : -1);
    }
  }, { passive: true });
}

function atualizarBadgeMenu() {
  const badge = document.getElementById('badgeMenuNovas');
  const naoLidas = mensagensRecebidas.filter(function(m) { return !m.lida; }).length;
  if (naoLidas > 0) {
    badge.textContent = naoLidas + (naoLidas === 1 ? ' nova' : ' novas');
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

async function carregarMensagens() {
  try {
    const resposta = await fetch('/api/participantes/' + participanteId + '/mensagens');
    const dados = await resposta.json();

    if (resposta.ok) {
      mensagensRecebidas = dados.recebidas || [];
      mensagensEnviadas = dados.enviadas || [];

      arvoreAtualRecebidos = PainelUtils.obterMaiorArvore(mensagensRecebidas);
      arvoreAtualEnviados = PainelUtils.obterMaiorArvore(mensagensEnviadas);

      atualizarBadgeMenu();
      atualizarTelaMensagens('recebidas');
      atualizarTelaMensagens('enviadas');
    }
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err);
  }
}

function atualizarTelaMensagens(tipo) {
  const recebidas = tipo === 'recebidas';
  const mensagens = recebidas ? mensagensRecebidas : mensagensEnviadas;
  const arvoreSelecionada = recebidas ? arvoreAtualRecebidos : arvoreAtualEnviados;
  const paginacaoId = recebidas ? 'paginacaoRecebidos' : 'paginacaoEnviados';
  const listaId = recebidas ? 'listaRecebidas' : 'listaEnviadas';
  const arvoreId = recebidas ? 'arvoreRecebidos' : 'arvoreEnviados';
  const autor = recebidas ? 'Seu anjo' : 'Você';

  renderizarPaginacao(mensagens, arvoreSelecionada, paginacaoId, recebidas, function(novaArvore) {
    if (recebidas) {
      arvoreAtualRecebidos = novaArvore;
    } else {
      arvoreAtualEnviados = novaArvore;
    }
    atualizarTelaMensagens(tipo);
  });
  renderizarMensagens(mensagens, arvoreSelecionada, listaId, arvoreId, autor, recebidas);
}

function renderizarPaginacao(mensagens, arvoreSelecionada, containerId, checarNaoLidas, aoTrocar) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  const totalArvores = PainelUtils.obterMaiorArvore(mensagens);
  if (totalArvores <= 1) return;

  const btnAnt = document.createElement('button');
  btnAnt.type = 'button';
  btnAnt.className = 'btn-seta-arvore';
  btnAnt.textContent = '<';
  btnAnt.setAttribute('aria-label', 'Árvore anterior');
  btnAnt.disabled = arvoreSelecionada <= 1;
  btnAnt.onclick = function() {
    if (arvoreSelecionada > 1) aoTrocar(arvoreSelecionada - 1);
  };

  const temNovaEmOutra = checarNaoLidas && mensagens.some(function(m) {
    return (m.arvoreNumero || 1) !== arvoreSelecionada && !m.lida;
  });

  const indicador = document.createElement('span');
  indicador.className = 'contador-arvore' + (temNovaEmOutra ? ' tem-nova' : '');
  indicador.textContent = arvoreSelecionada + '/' + totalArvores;

  const btnProx = document.createElement('button');
  btnProx.type = 'button';
  btnProx.className = 'btn-seta-arvore';
  btnProx.textContent = '>';
  btnProx.setAttribute('aria-label', 'Próxima árvore');
  btnProx.disabled = arvoreSelecionada >= totalArvores;
  btnProx.onclick = function() {
    if (arvoreSelecionada < totalArvores) aoTrocar(arvoreSelecionada + 1);
  };

  container.append(btnAnt, indicador, btnProx);
}

function criarIconeEnfeite(tipo) {
  const nomeArquivo = PainelUtils.normalizarTipoEnfeite(tipo);
  const img = document.createElement('img');
  img.src = '/assets/' + nomeArquivo + '.svg';
  img.alt = nomeArquivo;
  return img;
}

function destacarPar(mensagemId, enfeiteEl, recadoEl) {
  document.querySelectorAll('.destaque-ativo').forEach(function(el) {
    el.classList.remove('destaque-ativo');
  });

  if (enfeiteEl) enfeiteEl.classList.add('destaque-ativo');
  if (recadoEl) recadoEl.classList.add('destaque-ativo');
}

function abrirPopupCartao(mensagem, rotuloAutor) {
  const overlay = document.getElementById('overlayCartao');
  const conteudo = document.getElementById('conteudoPopupCartao');
  const tipo = PainelUtils.normalizarTipoEnfeite(mensagem.enfeite);
  const dataTxt = PainelUtils.formatarDataHora(mensagem.criadoEm);

  conteudo.replaceChildren();

  const topo = document.createElement('div');
  topo.className = 'popup-cartao-topo';

  const selo = document.createElement('span');
  selo.className = 'popup-cartao-icone';
  selo.appendChild(criarIconeEnfeite(tipo));

  const info = document.createElement('div');
  info.className = 'popup-cartao-info';

  const autorEl = document.createElement('strong');
  autorEl.textContent = rotuloAutor;
  info.appendChild(autorEl);

  if (dataTxt) {
    const dataEl = document.createElement('small');
    dataEl.className = 'popup-cartao-data';
    dataEl.textContent = dataTxt;
    info.appendChild(dataEl);
  }

  topo.append(selo, info);

  const corpo = document.createElement('p');
  corpo.className = 'popup-cartao-corpo';
  corpo.textContent = mensagem.texto;

  conteudo.append(topo, corpo);
  overlay.hidden = false;
}

function fecharPopupCartao() {
  const overlay = document.getElementById('overlayCartao');
  overlay.hidden = true;
  document.querySelectorAll('.destaque-ativo').forEach(function(el) {
    el.classList.remove('destaque-ativo');
  });
}

async function marcarComoLida(mensagem, enfeiteEl, recadoEl) {
  if (mensagem.lida) return;

  mensagem.lida = true;
  if (enfeiteEl) enfeiteEl.classList.remove('nao-lida');
  if (recadoEl) {
    recadoEl.classList.remove('nao-lida');
    const tagNova = recadoEl.querySelector('.tag-nova');
    if (tagNova) tagNova.remove();
  }
  atualizarBadgeMenu();

  renderizarPaginacao(mensagensRecebidas, arvoreAtualRecebidos, 'paginacaoRecebidos', true, function(novaArvore) {
    arvoreAtualRecebidos = novaArvore;
    atualizarTelaMensagens('recebidas');
  });

  try {
    await fetch('/api/participantes/' + participanteId + '/mensagens/' + mensagem.id + '/lida', {
      method: 'PATCH'
    });
  } catch (err) {
    console.error('Erro ao marcar mensagem como lida:', err);
  }
}

function renderizarMensagens(todasMensagens, arvoreSelecionada, listaId, arvoreId, autor, eRecebida) {
  const lista = document.getElementById(listaId);
  const arvore = document.getElementById(arvoreId);
  lista.replaceChildren();
  arvore.replaceChildren();

  const rotuloAutor = eRecebida ? 'De: Seu Anjo' : 'Para: Seu Protegido';

  if (todasMensagens.length === 0) {
    lista.innerHTML = '<p><small>Nenhuma mensagem ainda.</small></p>';
    return;
  }

  const mapaRecados = {};
  const mapaEnfeites = {};
  const totalArvores = PainelUtils.obterMaiorArvore(todasMensagens);

  // 1. Renderiza TODAS as mensagens juntas (mais recentes primeiro)
  const listaOrdenada = [...todasMensagens].reverse();
  listaOrdenada.forEach(function(mensagem) {
    const tipo = PainelUtils.normalizarTipoEnfeite(mensagem.enfeite);
    const naoLida = eRecebida && !mensagem.lida;

    const recado = document.createElement('div');
    recado.className = 'recado-simulado' + (naoLida ? ' nao-lida' : '');
    recado.dataset.msgId = mensagem.id;

    const selo = document.createElement('span');
    selo.className = 'selo-enfeite enfeite-' + tipo;
    selo.appendChild(criarIconeEnfeite(tipo));

    const conteudo = document.createElement('div');
    conteudo.className = 'recado-conteudo';

    const texto = document.createElement('span');
    texto.className = 'recado-texto';
    texto.textContent = mensagem.texto;

    const meta = document.createElement('small');
    meta.className = 'recado-meta';
    const dataTxt = PainelUtils.formatarDataHora(mensagem.criadoEm);
    const arvoreTxt = totalArvores > 1 ? ' • Árvore ' + (mensagem.arvoreNumero || 1) : '';
    meta.textContent = dataTxt + arvoreTxt;

    conteudo.append(texto, meta);
    recado.append(selo, conteudo);

    if (naoLida) {
      const tag = document.createElement('span');
      tag.className = 'tag-nova';
      tag.textContent = 'Nova';
      recado.appendChild(tag);
    }

    recado.onclick = function() {
      const arvoreDaMsg = mensagem.arvoreNumero || 1;
      if (arvoreDaMsg !== arvoreSelecionada) {
        if (eRecebida) {
          arvoreAtualRecebidos = arvoreDaMsg;
          atualizarTelaMensagens('recebidas');
        } else {
          arvoreAtualEnviados = arvoreDaMsg;
          atualizarTelaMensagens('enviadas');
        }
      }
      destacarPar(mensagem.id, mapaEnfeites[mensagem.id], recado);
      abrirPopupCartao(mensagem, rotuloAutor);
      if (eRecebida) marcarComoLida(mensagem, mapaEnfeites[mensagem.id], recado);
    };

    mapaRecados[mensagem.id] = recado;
    lista.appendChild(recado);
  });

  // 2. Renderiza na árvore apenas os enfeites da árvore selecionada
  const mensagensDaArvore = todasMensagens.filter(function(msg) {
    return (msg.arvoreNumero || 1) === arvoreSelecionada;
  });

  mensagensDaArvore.forEach(function(mensagem, indice) {
    const tipo = PainelUtils.normalizarTipoEnfeite(mensagem.enfeite);
    const posicao = PainelUtils.obterPosicaoEnfeite(mensagem, indice);
    const naoLida = eRecebida && !mensagem.lida;

    const enfeite = document.createElement('button');
    enfeite.type = 'button';
    enfeite.className = 'enfeite-na-arvore enfeite-' + tipo + (naoLida ? ' nao-lida' : '');
    enfeite.style.left = posicao[0] + '%';
    enfeite.style.top = posicao[1] + '%';
    enfeite.style.transform = 'translate(-50%, -12%)';
    enfeite.setAttribute('aria-label', autor + ' deixou ' + tipo);
    enfeite.appendChild(criarIconeEnfeite(tipo));

    enfeite.onclick = function() {
      const recadoAlvo = mapaRecados[mensagem.id];
      destacarPar(mensagem.id, enfeite, recadoAlvo);
      abrirPopupCartao(mensagem, rotuloAutor);
      if (eRecebida) marcarComoLida(mensagem, enfeite, recadoAlvo);
    };

    mapaEnfeites[mensagem.id] = enfeite;
    arvore.appendChild(enfeite);
  });
}

async function enviarMensagemReal(evento) {
  evento.preventDefault();
  const campoTexto = document.getElementById('msgTexto');
  const status = document.getElementById('statusRecado');
  const texto = campoTexto.value.trim();
  if (!texto) return;

  const enfeite = document.querySelector('input[name="enfeite"]:checked').value;
  status.textContent = 'Enviando...';

  try {
    const resposta = await fetch('/api/participantes/' + participanteId + '/mensagens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: texto, enfeite: enfeite })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      campoTexto.value = '';
      status.textContent = 'Mensagem e enfeite salvos!';
      await carregarMensagens();
    } else {
      status.textContent = dados.erro || 'Erro ao enviar.';
    }
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    status.textContent = 'Erro de conexão com o servidor.';
  }
}

function sair() {
  const idFamiliaSalvo = sessionStorage.getItem('familiaId');
  sessionStorage.removeItem('participanteId');
  sessionStorage.removeItem('familiaId');
  window.location.href = idFamiliaSalvo ? '/jogo.html?id=' + idFamiliaSalvo : '/';
}
