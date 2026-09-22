# Anjo de Natal
## Jogo online

> Uma aplicação web simples e acolhedora projetada para conectar famílias que moram longe, resgatando a tradição das cartinhas e do "Anjo" durante a época natalina.

---

## Sobre o Projeto


Este projeto nasceu com um propósito muito especial: **presentear minha família no Natal e manter viva uma das nossas tradições mais queridas.**


Desde sempre, nossa família teve o costume de se reunir na casa da nossa avó para celebrar e se divertir com jogos natalinos. Porém, o tempo passou e a vida nos espalhou por diferentes cidades, estados e países. Embora o esforço para passar a noite de Natal juntos continue o mesmo, a distância física tornou algumas de nossas brincadeiras favoritas quase impossíveis de serem realizadas.


O **Anjo Online** é a adaptação digital da nossa brincadeira de "Anjo", criada sob medida para romper as barreiras geográficas. Ele foi desenvolvido para que, independentemente de onde cada membro da família esteja no mundo, possamos nos conectar, reviver essa tradição e nos sentirmos mais próximos uns dos outros.

Este site foi idealizado para que a brincadeira comece semanas antes do encontro físico. Ele funciona como um "Amigo Secreto de Mensagens", onde cada participante se torna o "Anjo" (protetor) de alguém e deve enviar mensagens anônimas de carinho, apoio e brincadeiras, preparando o clima para a grande revelação na noite de Natal.

---

## Objetivo

* **Conectar e Aproximar:** Manter a família em contato diário nas semanas que antecedem o Natal.
* **Acessibilidade Total:** Garantir uma interface extremamente simples, sem necessidade de cadastros complexos (como e-mail, senha ou confirmações), permitindo que desde os avós até as crianças consigam jogar sem barreiras tecnológicas.
* **Resgatar a Tradição:** Estimular o envio de mensagens escritas de afeto e carinho dentro do núcleo familiar.

---

## Regras do Jogo

1. **O Anonimato é Sagrado:** O Anjo deve enviar mensagens para seu protegido sem revelar sua verdadeira identidade em momento algum.
2. **Foco no Afeto:** As mensagens podem conter votos de bom dia, lembranças do passado, piadas internas da família ou dicas sutis de quem é o anjo.
3. **Cuidado Diário:** O papel do Anjo é alegrar o dia do seu protegido através das palavras.
4. **A Grande Revelação:** No dia de Natal, quando a família finalmente se reunir, cada um revela quem era o seu anjo de forma presencial em uma dinamica de "Amigo Secreto".

---

## Funcionamento da Plataforma

O sistema foi desenhado para ser o mais fluido e seguro possível, dividindo-se em duas grandes etapas:

### 1. Visão do Organizador (Criação do Ambiente)
* O organizador acessa o site e cadastra o nome da família (ex: *Família Maciel*).
* Em seguida, adiciona o nome de cada participante que vai jogar.
* Ao finalizar, o sistema realiza o sorteio interno automaticamente e gera um **Link Único da Família** junto com uma tabela de **Códigos de Acesso Individuais**.
* **Segurança e Praticidade:** Para que o organizador não perca esses dados, a plataforma disponibiliza o download imediato de um arquivo unificado contendo o link e as senhas de cada um. O organizador é responsável por distribuir cada código ao seu respectivo dono de forma privada (via WhatsApp, por exemplo).

### 2. Visão do Jogador (O Espaço do Jogo)
* O familiar clica no link recebido e digita o seu código de acesso exclusivo.
* Na tela inicial do jogador, ele se depara com uma interface limpa contendo duas opções principais:
  * **Meu Perfil:** Espaço onde o jogador pode personalizar seu nome, alterar sua foto de perfil e, o mais importante, acessar sua **Caixa de Entrada** para ler todas as cartinhas que o seu Anjo anônimo lhe enviou.
  * **Meu Protegido:** Ao clicar neste botão misterioso, o painel revela quem é a pessoa que ele tirou (Nome e Foto). Logo abaixo, há um campo de texto simples para que ele digite e envie suas mensagens anônimas para o seu protegido.

---
## Tecnologias Planejadas & Arquitetura

* **Frontend:** HTML5, CSS3 estruturado (foco em responsividade, acessibilidade e design acolhedor) e JavaScript Vanilla (puro) para manipulação de estado e interações na tela.
* **Backend:** **Node.js** com **Express** para gerenciamento de rotas, controle das salas de jogo e execução da lógica segura do sorteio.
* **Banco de Dados & Realtime:** **Firebase (Firestore / Realtime Database)** para armazenar o estado do jogo e atualizar as ações dos jogadores instantaneamente sem necessidade de atualizar a página.
* **Hospedagem/Deploy (Planejado):** **Netlify** (para o Frontend) e **Render** (para o backend em Node.js).
