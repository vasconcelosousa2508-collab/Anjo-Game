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

<img width="1919" height="1070" alt="Captura de tela de 2026-11-26 14-09-10" src="https://github.com/user-attachments/assets/e9fbecf1-e30b-4c37-9930-5194392f7507" />
<img width="1919" height="1070" alt="image" src="https://github.com/user-attachments/assets/abf4906c-c648-41ad-9074-a6dec9d07109" />
<img width="1907" height="1069" alt="image" src="https://github.com/user-attachments/assets/04c57ab4-b422-40a8-82b2-1ed8d42ae44d" />
<img width="739" height="734" alt="image" src="https://github.com/user-attachments/assets/877d7ea8-9efb-439b-8ed3-9798d834e0fc" />
<img width="1919" height="1068" alt="image" src="https://github.com/user-attachments/assets/d79c040d-c2a7-4434-b33f-37ed4534c134" />
<img width="1919" height="1069" alt="image" src="https://github.com/user-attachments/assets/0b503fdd-f081-4b35-9668-9ee0fc8010c7" />
<img width="1904" height="1065" alt="image" src="https://github.com/user-attachments/assets/d6f3d6c1-4b4d-4c53-b095-e8af48500fb2" />
<img width="1902" height="1070" alt="image" src="https://github.com/user-attachments/assets/ec0fb0e8-a48e-4ba8-bc0e-442cd1e9b539" />
<img width="1905" height="1063" alt="image" src="https://github.com/user-attachments/assets/41a7aa60-0033-4730-b0a0-ab866a31fd1a" />
<img width="1123" height="791" alt="image" src="https://github.com/user-attachments/assets/302b71d9-176f-476a-b508-fd05d1466e8f" />
<img width="1121" height="789" alt="image" src="https://github.com/user-attachments/assets/f19f1581-467e-4059-8932-c7d8d52b34e7" />



---
## Tecnologias Planejadas & Arquitetura

* **Frontend:** HTML5, CSS3 estruturado (foco em responsividade, acessibilidade e design acolhedor) e JavaScript Vanilla (puro) para manipulação de estado e interações na tela.
* **Backend:** **Node.js** com **Express** para gerenciamento de rotas, controle das salas de jogo e execução da lógica segura do sorteio.
* **Banco de Dados & Websockets:** **Firebase (Firestore / Socket.io)** para armazenar o estado do jogo e atualizar as ações dos jogadores instantaneamente sem necessidade de atualizar a página.
* **Hospedagem/Deploy (Planejado):** **Netlify** (para o Frontend) e **Render** (para o backend em Node.js).
