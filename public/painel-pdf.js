const PainelUtilsPDF = window.PainelUtils;

async function gerarDataUrlEnfeite(tipo) {
  const nomeArquivo = PainelUtilsPDF.normalizarTipoEnfeite(tipo);
  const img = await PainelUtilsPDF.carregarImagemParaCanvas('/assets/' + nomeArquivo + '.svg');
  const canvas = document.createElement('canvas');
  canvas.width = 72;
  canvas.height = 86;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 72, 86);
  return canvas.toDataURL('image/png');
}

async function gerarDataUrlArvore(mensagensDaArvore, imgArvore) {
  const largura = 560;
  const proporcao = (imgArvore.naturalHeight || 1000) / (imgArvore.naturalWidth || 840);
  const altura = Math.round(largura * proporcao);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgArvore, 0, 0, largura, altura);

  const larguraEnfeite = largura * (36 / 280);
  const alturaEnfeite = larguraEnfeite * (43 / 36);

  for (let i = 0; i < mensagensDaArvore.length; i++) {
    const mensagem = mensagensDaArvore[i];
    const tipo = PainelUtilsPDF.normalizarTipoEnfeite(mensagem.enfeite);
    const posicao = PainelUtilsPDF.obterPosicaoEnfeite(mensagem, i);
    const imgEnfeite = await PainelUtilsPDF.carregarImagemParaCanvas('/assets/' + tipo + '.svg');
    const x = (posicao[0] / 100) * largura - (larguraEnfeite * 0.5);
    const y = (posicao[1] / 100) * altura - (alturaEnfeite * 0.12);
    ctx.drawImage(imgEnfeite, x, y, larguraEnfeite, alturaEnfeite);
  }

  return { dataUrl: canvas.toDataURL('image/png'), proporcao };
}

async function baixarRecordacaoPDF() {
  if (!mensagensRecebidas || mensagensRecebidas.length === 0) {
    alert('Ainda não há mensagens recebidas para gerar a recordação.');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const larguraPagina = 297;
    const alturaPagina = 210;
    const margemX = 14;
    const topoTituloY = 16;

    const nomePessoa = document.getElementById('perfilNome').textContent.trim() || 'Amigo';
    const titulo = nomePessoa + ', lembre como você foi amado esse ano:';
    const imgArvore = await PainelUtilsPDF.carregarImagemParaCanvas('/assets/arvore-natal.svg');
    const cacheIcones = {};
    const totalArvores = PainelUtilsPDF.obterMaiorArvore(mensagensRecebidas);

    const arvoresRenderizadas = [];
    for (let num = 1; num <= totalArvores; num++) {
      const msgsArvore = mensagensRecebidas.filter(function(m) {
        return (m.arvoreNumero || 1) === num;
      });
      arvoresRenderizadas.push(await gerarDataUrlArvore(msgsArvore, imgArvore));
    }

    const numColunas = 5;
    const gapColuna = 4;
    const gapLinha = 3.5;
    const areaUtilX = larguraPagina - margemX * 2;
    const larguraCartao = (areaUtilX - gapColuna * (numColunas - 1)) / numColunas;
    const maxArvoresPorLinha = 4;
    const alturaArvoreMM = 56;
    const larguraArvoreMM = alturaArvoreMM / arvoresRenderizadas[0].proporcao;
    const gapArvore = 12;

    let indiceArvore = 0;
    let indiceMsg = 0;
    let numeroPagina = 0;

    while (indiceMsg < mensagensRecebidas.length || indiceArvore < arvoresRenderizadas.length) {
      if (numeroPagina > 0) doc.addPage();
      numeroPagina++;

      doc.setFontSize(14);
      doc.setTextColor(35, 35, 35);
      doc.text(titulo, margemX, topoTituloY);

      let inicioCartoesY = 24;

      if (indiceArvore < arvoresRenderizadas.length) {
        const qtdNestaLinha = Math.min(maxArvoresPorLinha, arvoresRenderizadas.length - indiceArvore);
        const larguraTotalFileira = qtdNestaLinha * larguraArvoreMM + (qtdNestaLinha - 1) * gapArvore;
        let xArvore = (larguraPagina - larguraTotalFileira) / 2;
        const yArvore = 22;

        for (let a = 0; a < qtdNestaLinha; a++) {
          doc.addImage(arvoresRenderizadas[indiceArvore].dataUrl, 'PNG', xArvore, yArvore, larguraArvoreMM, alturaArvoreMM);
          xArvore += larguraArvoreMM + gapArvore;
          indiceArvore++;
        }

        inicioCartoesY = yArvore + alturaArvoreMM + 7;
      }

      const limiteInferiorY = alturaPagina - 12;

      for (let col = 0; col < numColunas; col++) {
        if (indiceMsg >= mensagensRecebidas.length) break;

        const xCartao = margemX + col * (larguraCartao + gapColuna);
        let cursorY = inicioCartoesY;

        while (indiceMsg < mensagensRecebidas.length) {
          const msg = mensagensRecebidas[indiceMsg];
          const tipo = PainelUtilsPDF.normalizarTipoEnfeite(msg.enfeite);
          if (!cacheIcones[tipo]) {
            cacheIcones[tipo] = await gerarDataUrlEnfeite(tipo);
          }

          const larguraTexto = larguraCartao - 12;
          doc.setFontSize(7.5);
          const linhasTexto = doc.splitTextToSize(msg.texto, larguraTexto);
          const alturaCartao = Math.max(13, 8 + linhasTexto.length * 3.4);

          if (cursorY + alturaCartao > limiteInferiorY) break;

          doc.setDrawColor(218, 228, 222);
          doc.setFillColor(248, 251, 249);
          doc.roundedRect(xCartao, cursorY, larguraCartao, alturaCartao, 1.8, 1.8, 'FD');
          doc.addImage(cacheIcones[tipo], 'PNG', xCartao + 2.2, cursorY + 2.5, 5.5, 6.5);

          doc.setFontSize(6.2);
          doc.setTextColor(130, 130, 130);
          const metaTxt = 'Seu Anjo • ' + PainelUtilsPDF.formatarDataHora(msg.criadoEm);
          doc.text(metaTxt, xCartao + 9.2, cursorY + 5);

          doc.setFontSize(7.5);
          doc.setTextColor(35, 35, 35);
          doc.text(linhasTexto, xCartao + 9.2, cursorY + 8.8);

          cursorY += alturaCartao + gapLinha;
          indiceMsg++;
        }
      }
    }

    const slug = nomePessoa.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    doc.save('recordacao-anjo-' + slug + '.pdf');
  } catch (err) {
    console.error('Erro ao gerar PDF de recordação:', err);
    alert('Não foi possível gerar o PDF de recordação.');
  }
}
