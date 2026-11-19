window.PainelUtils = (function() {
  const ENFEITE_PADRAO = 'bola-vermelha';

  const CATALOGO_ENFEITES = [
    { id: 'bola-amarela', nome: 'bola amarela' },
    // { id: 'bola-azul', nome: 'bola azul' },
    { id: 'bola-laranja', nome: 'bola laranja' },
    { id: 'bola-roxa', nome: 'bola roxa' },
    { id: 'bola-verde', nome: 'bola verde' },
    { id: 'bola-vermelha', nome: 'bola vermelha' },
    { id: 'floco', nome: 'floco' }
  ];

  const POSICOES_ENFEITES = [
    [21, 63], [88, 80], [45, 22], [12, 80], [76, 45],
    [54, 59], [24, 44], [82, 62], [32, 77], [65, 30],
    [37, 54], [68, 79], [51, 39], [50, 72], [30, 28]
  ];

  function formatarDataHora(timestamp) {
    if (!timestamp) return '';
    const data = new Date(timestamp);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return dia + '/' + mes + ' às ' + hora + ':' + min;
  }

  function normalizarTipoEnfeite(tipo) {
    if (!tipo) return ENFEITE_PADRAO;
    return tipo === 'bola' ? ENFEITE_PADRAO : tipo;
  }

  function obterMaiorArvore(mensagens) {
    if (!mensagens || mensagens.length === 0) return 1;
    return mensagens.reduce(function(max, msg) {
      const num = msg.arvoreNumero || 1;
      return num > max ? num : max;
    }, 1);
  }

  function obterPosicaoEnfeite(mensagem, indice) {
    const vaga = (typeof mensagem.posicao === 'number') ? mensagem.posicao : indice;
    return POSICOES_ENFEITES[vaga % POSICOES_ENFEITES.length];
  }

  function carregarImagemParaCanvas(src) {
    return new Promise(function(resolve, reject) {
      const img = new Image();
      img.onload = function() { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  return {
    CATALOGO_ENFEITES,
    POSICOES_ENFEITES,
    ENFEITE_PADRAO,
    formatarDataHora,
    normalizarTipoEnfeite,
    obterMaiorArvore,
    obterPosicaoEnfeite,
    carregarImagemParaCanvas
  };
})();
