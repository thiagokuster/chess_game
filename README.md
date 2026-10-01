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
- Interface disponível em português, inglês, espanhol, chinês simplificado, hindi e árabe
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
