const PainelUtilsPDF = window.PainelUtils;

async function carregarFundoInvernoDataUrl() {
  const imgFundo = await PainelUtilsPDF.carregarImagemParaCanvas('/assets/fundo-inverno.png');
  const largura = 1485;
  const altura = 1050;
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#9ed9ec';
  ctx.fillRect(0, 0, largura, altura);

  const iw = imgFundo.naturalWidth || largura;
  const ih = imgFundo.naturalHeight || altura;
  const escala = Math.max(largura / iw, altura / ih);
  const dw = iw * escala;
  const dh = ih * escala;
  const dx = (largura - dw) / 2;
  const dy = altura - dh;
  ctx.drawImage(imgFundo, dx, dy, dw, dh);

  return canvas.toDataURL('image/jpeg', 0.9);
}

function desenharCaminhoArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function gerarMolduraCandyCaneDataUrl(larguraMM, alturaMM) {
  const escala = 12;
  const w = Math.max(1, Math.round(larguraMM * escala));
  const h = Math.max(1, Math.round(alturaMM * escala));
  const borda = Math.round(1.35 * escala);
  const raioExterno = Math.round(3.8 * escala);
  const raioInterno = Math.max(2, raioExterno - borda);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // 1. Moldura listrada inclinada (-45deg) igual ao CSS --candy-cane-borda
  ctx.save();
  desenharCaminhoArredondado(ctx, 0, 0, w, h, raioExterno);
  ctx.clip();

  const cores = ['#e63946', '#ffffff', '#16988d', '#ffffff'];
  const larguras = [26, 18, 26, 18];
  const diagonal = w + h;

  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 4);
  let pos = -diagonal;
  let idx = 0;
  while (pos < diagonal) {
    ctx.fillStyle = cores[idx % cores.length];
    ctx.fillRect(pos, -diagonal, larguras[idx % larguras.length] + 1, diagonal * 2);
    pos += larguras[idx % larguras.length];
    idx++;
  }
  ctx.restore();

  // 2. Miolo creme (#f6efe2)
  ctx.fillStyle = '#f6efe2';
  desenharCaminhoArredondado(ctx, borda, borda, w - borda * 2, h - borda * 2, raioInterno);
  ctx.fill();

  // 3. Selo circular branco no cabeçalho do cartão
  const cx = Math.round(7.6 * escala);
  const cy = Math.round(7.4 * escala);
  const raioSelo = Math.round(4.1 * escala);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, raioSelo, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL('image/png');
}

function carregarImagemEnfeite(tipo, cacheImagens) {
  const nomeArquivo = PainelUtilsPDF.normalizarTipoEnfeite(tipo);
  if (!cacheImagens.has(nomeArquivo)) {
    cacheImagens.set(nomeArquivo, PainelUtilsPDF.carregarImagemParaCanvas('/assets/enfeites/' + nomeArquivo + '.svg'));
  }
  return cacheImagens.get(nomeArquivo);
}

async function gerarDataUrlEnfeite(tipo, cacheImagens) {
  const img = await carregarImagemEnfeite(tipo, cacheImagens);
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 114;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 96, 114);
  return canvas.toDataURL('image/png');
}

async function gerarDataUrlArvore(mensagensDaArvore, imgArvore, cacheImagens) {
  const larguraArvore = 560;
  const proporcao = (imgArvore.naturalHeight || 1000) / (imgArvore.naturalWidth || 840);
  const alturaArvore = Math.round(larguraArvore * proporcao);
  const respiro = 85;

  const canvas = document.createElement('canvas');
  canvas.width = larguraArvore + respiro * 2;
  canvas.height = alturaArvore + respiro * 2;
  const ctx = canvas.getContext('2d');

  // 1. Névoa luminosa ampla e bem esfumada por trás da árvore (sem forma recortada)
  const centroX = canvas.width / 2;
  const centroY = canvas.height * 0.54;
  const raioExterno = Math.max(canvas.width, canvas.height) * 0.52;

  const nevoa = ctx.createRadialGradient(centroX, centroY, 20, centroX, centroY, raioExterno);
  nevoa.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  nevoa.addColorStop(0.45, 'rgba(255, 255, 255, 0.34)');
  nevoa.addColorStop(0.78, 'rgba(255, 255, 255, 0.08)');
  nevoa.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = nevoa;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Contorno esfumado acompanhando a silhueta da árvore
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 42;
  ctx.drawImage(imgArvore, respiro, respiro, larguraArvore, alturaArvore);
  ctx.restore();

  const larguraEnfeite = larguraArvore * (36 / 280);
  const alturaEnfeite = larguraEnfeite * (43 / 36);

  for (let i = 0; i < mensagensDaArvore.length; i++) {
    const mensagem = mensagensDaArvore[i];
    const tipo = PainelUtilsPDF.normalizarTipoEnfeite(mensagem.enfeite);
    const posicao = PainelUtilsPDF.obterPosicaoEnfeite(mensagem, i);
    const imgEnfeite = await carregarImagemEnfeite(tipo, cacheImagens);
    const x = respiro + (posicao[0] / 100) * larguraArvore - (larguraEnfeite * 0.5);
    const y = respiro + (posicao[1] / 100) * alturaArvore - (alturaEnfeite * 0.12);
    ctx.drawImage(imgEnfeite, x, y, larguraEnfeite, alturaEnfeite);
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    proporcao: canvas.height / canvas.width
  };
}

async function baixarRecordacaoPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const larguraPagina = 297;
    const alturaPagina = 210;
    const alturaFaixaTopo = 18;
    const margemX = 15;

    const nomePessoa = document.getElementById('perfilNome').textContent.trim() || 'Amigo';
    const titulo = nomePessoa + ', lembre como você foi amado esse ano:';

    const fundoInvernoUrl = await carregarFundoInvernoDataUrl();
    const imgArvore = await PainelUtilsPDF.carregarImagemParaCanvas('/assets/arvore-natal.svg');
    const cacheIcones = {};
    const cacheImagensEnfeites = new Map();
    const tiposEnfeites = [...new Set(mensagensRecebidas.map(function(mensagem) {
      return PainelUtilsPDF.normalizarTipoEnfeite(mensagem.enfeite);
    }))];
    await Promise.all(tiposEnfeites.map(function(tipo) {
      return carregarImagemEnfeite(tipo, cacheImagensEnfeites);
    }));
    const totalArvores = PainelUtilsPDF.obterMaiorArvore(mensagensRecebidas);

    const arvoresRenderizadas = [];
    for (let num = 1; num <= totalArvores; num++) {
      const msgsArvore = mensagensRecebidas.filter(function(m) {
        return (m.arvoreNumero || 1) === num;
      });
      arvoresRenderizadas.push(await gerarDataUrlArvore(msgsArvore, imgArvore, cacheImagensEnfeites));
    }

    // 3 colunas largas estilo alvenaria (masonry)
    const numColunas = 3;
    const gapColuna = 6;
    const gapLinha = 5;
    const areaUtilX = larguraPagina - margemX * 2;
    const larguraCartao = (areaUtilX - gapColuna * (numColunas - 1)) / numColunas;

    const maxArvoresPorLinha = 3;
    const alturaArvoreMM = 84;
    const larguraArvoreMM = alturaArvoreMM / arvoresRenderizadas[0].proporcao;
    const gapArvore = 8;

    let indiceArvore = 0;
    let indiceMsg = 0;
    let numeroPagina = 0;

    while (indiceMsg < mensagensRecebidas.length || indiceArvore < arvoresRenderizadas.length) {
      if (numeroPagina > 0) doc.addPage();
      numeroPagina++;

      // 1. Plano de fundo de inverno
      doc.addImage(fundoInvernoUrl, 'JPEG', 0, 0, larguraPagina, alturaPagina);

      // 2. Faixa superior igual à .barra-topo-inverno (#6ec4de)
      doc.setFillColor(110, 196, 222);
      doc.rect(0, 0, larguraPagina, alturaFaixaTopo, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(0, alturaFaixaTopo, larguraPagina, alturaFaixaTopo);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(titulo, margemX, 11.5);

      let inicioCartoesY = alturaFaixaTopo + 7;

      // 3. Árvores centralizadas com névoa esfumada
      if (indiceArvore < arvoresRenderizadas.length) {
        const qtdNestaLinha = Math.min(maxArvoresPorLinha, arvoresRenderizadas.length - indiceArvore);
        const larguraTotalFileira = qtdNestaLinha * larguraArvoreMM + (qtdNestaLinha - 1) * gapArvore;
        let xArvore = (larguraPagina - larguraTotalFileira) / 2;
        const yArvore = alturaFaixaTopo + 1;

        for (let a = 0; a < qtdNestaLinha; a++) {
          doc.addImage(arvoresRenderizadas[indiceArvore].dataUrl, 'PNG', xArvore, yArvore, larguraArvoreMM, alturaArvoreMM);
          xArvore += larguraArvoreMM + gapArvore;
          indiceArvore++;
        }

        inicioCartoesY = yArvore + alturaArvoreMM + 2;
      }

      // 4. Distribui os cartões nas 3 colunas sempre escolhendo a coluna mais curta
      const limiteInferiorY = alturaPagina - 11;
      const cursoresY = [inicioCartoesY, inicioCartoesY, inicioCartoesY];

      while (indiceMsg < mensagensRecebidas.length) {
        let colAlvo = 0;
        for (let c = 1; c < numColunas; c++) {
          if (cursoresY[c] < cursoresY[colAlvo]) colAlvo = c;
        }

        const msg = mensagensRecebidas[indiceMsg];
        const tipo = PainelUtilsPDF.normalizarTipoEnfeite(msg.enfeite);
        if (!cacheIcones[tipo]) {
          cacheIcones[tipo] = await gerarDataUrlEnfeite(tipo, cacheImagensEnfeites);
        }

        const larguraTexto = larguraCartao - 7.6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.2);
        const linhasTexto = doc.splitTextToSize(msg.texto, larguraTexto);
        const alturaCartao = Math.max(21, 14.8 + linhasTexto.length * 4.1);

        if (cursoresY[colAlvo] + alturaCartao > limiteInferiorY) break;

        const xCartao = margemX + colAlvo * (larguraCartao + gapColuna);
        const yCartao = cursoresY[colAlvo];

        const molduraUrl = gerarMolduraCandyCaneDataUrl(larguraCartao, alturaCartao);
        doc.addImage(molduraUrl, 'PNG', xCartao, yCartao, larguraCartao, alturaCartao);

        // Ícone do enfeite centralizado dentro do círculo branco
        doc.addImage(cacheIcones[tipo], 'PNG', xCartao + 5.1, yCartao + 4.4, 5.0, 6.0);

        // Cabeçalho do cartão ("Seu Anjo" + data) ao lado do selo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(43, 38, 32);
        doc.text('Seu Anjo', xCartao + 13.4, yCartao + 6.8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.0);
        doc.setTextColor(125, 115, 101);
        doc.text(PainelUtilsPDF.formatarDataHora(msg.criadoEm), xCartao + 13.4, yCartao + 10.2);

        // Corpo da mensagem abaixo do cabeçalho
        doc.setFontSize(9.2);
        doc.setTextColor(43, 38, 32);
        doc.text(linhasTexto, xCartao + 3.8, yCartao + 15.8);

        cursoresY[colAlvo] += alturaCartao + gapLinha;
        indiceMsg++;
      }
    }

    const slug = nomePessoa.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    doc.save('recordacao-anjo-' + slug + '.pdf');
  } catch (err) {
    console.error('Erro ao gerar PDF de recordação:', err);
    alert('Não foi possível gerar o PDF de recordação.');
  }
}