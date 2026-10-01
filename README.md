# Royale Chess

Jogo de xadrez para navegador com partidas contra a IA, modo local para dois jogadores e salas multiplayer online. Inclui regras oficiais, controles de tempo, chat e histórico exportável.

## 🚀 Demo
Ainda não publicado. O link da aplicação será adicionado quando houver um deploy.

## 🛠️ Tecnologias
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Node.js, Express e Socket.IO
- `chess.js`

## ✨ Funcionalidades
- Partidas multiplayer em salas com código e salas públicas
- Partidas contra a IA em três níveis de dificuldade
- Modo local para dois jogadores no mesmo dispositivo
- Regras oficiais de xadrez, incluindo roque, en passant, promoção e empates
- Relógio com controles de tempo configuráveis
- Chat durante a partida
- Histórico de lances e exportação em PGN
- Perfil local com rating Elo e estatísticas
- Reconexão e validação de lances no servidor Socket.IO
- Fallback de multiplayer entre abas do mesmo navegador via `BroadcastChannel`

## 📦 Como rodar localmente

Clone o repositório publicado e entre na pasta do projeto:

```bash
git clone https://github.com/thiagokuster/chess_game.git
cd chess_game
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

Para habilitar o servidor multiplayer Socket.IO, abra outro terminal na pasta do projeto e execute:

```bash
cd server
npm install
npm run dev
```

O servidor estará disponível em `http://localhost:3001`. Sem ele, o modo de fallback sincroniza partidas entre abas do mesmo navegador; para jogadores em dispositivos diferentes, configure o frontend com `VITE_SERVER_URL` apontando para o servidor publicado e defina `CORS_ORIGIN` no servidor.

## 🌐 Publicar para outras pessoas jogarem

O GitHub guarda o código, mas não hospeda a aplicação. Para partidas entre dispositivos diferentes, publique o servidor Socket.IO e o frontend em serviços separados. Este roteiro usa Render para o servidor e Vercel para o frontend.

### 1. Publicar o servidor no Render

1. Crie uma conta em [render.com](https://render.com) e escolha **New > Web Service**.
2. Conecte o repositório `thiagokuster/chess_game`.
3. Configure **Root Directory** como `server`, **Build Command** como `npm install` e **Start Command** como `npm start`.
4. Crie o serviço e copie a URL pública gerada, por exemplo `https://chess-game-api.onrender.com`.

O servidor já usa a variável `PORT` fornecida pela hospedagem. A variável `CORS_ORIGIN` será configurada depois que o endereço do frontend estiver disponível.

### 2. Publicar o frontend na Vercel

1. Em [vercel.com](https://vercel.com), importe o mesmo repositório do GitHub.
2. Use a raiz do repositório como **Root Directory**, `npm run build` como comando de build e `dist` como diretório de saída.
3. Antes de publicar, adicione a variável de ambiente `VITE_SERVER_URL` com a URL do servidor Render, sem barra no final, por exemplo `https://chess-game-api.onrender.com`.
4. Faça o deploy e copie a URL pública gerada para o frontend.

### 3. Liberar a conexão entre frontend e servidor

1. No painel do serviço Render, adicione ou atualize `CORS_ORIGIN` com a URL exata da aplicação Vercel, incluindo `https://` e sem barra no final.
2. Salve e faça um novo deploy/restart do serviço Render.
3. Abra `https://SUA-URL-DO-SERVIDOR/api/status`. A resposta deve conter `"status":"online"`.
4. Abra o frontend em dois dispositivos ou navegadores diferentes, crie uma sala e entre nela usando o código. O selo do app deve indicar que o servidor está conectado.

Depois do deploy, substitua o aviso da seção Demo pela URL pública do frontend. O servidor mantém as salas em memória; partidas em andamento podem ser perdidas quando o serviço reiniciar ou for atualizado.
