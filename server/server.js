import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager.js';
import {
  getOpponentColor,
  getPlayerColorBySocket,
  isBotPlayerId,
  resolveChatSenderName,
  sanitizeChatText,
  sanitizeIncomingPlayer,
  playerControlsSocket
} from './security.js';

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  })
);
app.use(express.json({ limit: '100kb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();

// Endpoint simples de verificação do status do servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    activeRooms: roomManager.rooms.size,
    timestamp: Date.now()
  });
});

// Endpoint para listar salas abertas/públicas
app.get('/api/rooms', (req, res) => {
  const publicRooms = [];
  roomManager.rooms.forEach((room, code) => {
    // Retorna salas que estão em espera
    if (room.status === 'waiting') {
      publicRooms.push({
        code,
        host: room.players.w ? room.players.w.name : (room.players.b ? room.players.b.name : 'Host'),
        hostRating: room.players.w ? room.players.w.rating : 1200,
        timeControl: room.timeControlMinutes,
        createdAt: room.createdAt
      });
    }
  });
  res.json(publicRooms);
});

// Função auxiliar para enviar o estado formatado da sala aos clientes
function emitRoomState(room, ioInstance) {
  if (!room) return;
  const gameState = {
    code: room.code,
    status: room.status,
    fen: room.chess.fen(),
    pgn: room.chess.pgn(),
    history: room.chess.history({ verbose: true }),
    turn: room.chess.turn(),
    timeControl: room.timeControlMinutes,
    timers: room.timers,
    players: room.players,
    spectators: room.spectators,
    score: room.score,
    drawOfferFrom: room.drawOfferFrom,
    takebackRequestFrom: room.takebackRequestFrom,
    disconnectedColor: room.disconnectedColor,
    rematchRequestFrom: room.rematchRequestFrom || null
  };

  ioInstance.to(room.code).emit('gameState', gameState);
}

// Loop de timer do servidor executado a cada 1 segundo
setInterval(() => {
  const now = Date.now();
  roomManager.rooms.forEach((room) => {
    if (room.status === 'playing' && room.timers.lastTimestamp) {
      const elapsed = (now - room.timers.lastTimestamp) / 1000;
      room.timers.lastTimestamp = now;

      const activeColor = room.chess.turn(); // 'w' ou 'b'
      room.timers[activeColor] -= elapsed;

      // Se o tempo esgotar
      if (room.timers[activeColor] <= 0) {
        room.timers[activeColor] = 0;
        room.status = 'finished';

        // Determina vencedor ou empate por falta de material
        const winnerColor = activeColor === 'w' ? 'b' : 'w';
        // Atualiza placar
        if (winnerColor === 'w') room.score.w += 1;
        else room.score.b += 1;

        io.to(room.code).emit('gameOver', {
          reason: 'timeout',
          winner: winnerColor,
          message: `Tempo esgotado! ${winnerColor === 'w' ? 'Brancas' : 'Pretas'} vencem por tempo.`
        });
      }

      // Emite atualização do timer a cada 1s para sincronia
      io.to(room.code).emit('timersUpdate', room.timers);
    }
  });
}, 1000);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

  // Criar sala
  socket.on('createRoom', ({ player, config }, callback) => {
    try {
      const safe = sanitizeIncomingPlayer(player);
      const stableId = player?.id && typeof player.id === 'string' ? player.id.slice(0, 128) : socket.id;
      const room = roomManager.createRoom({ id: stableId, socketId: socket.id, ...safe }, config);
      socket.join(room.code);
      console.log(`[Sala] ${socket.id} criou a sala ${room.code}`);
      
      callback({ success: true, roomCode: room.code });
      emitRoomState(room, io);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      callback({ success: false, error: err.message });
    }
  });

  // Entrar na sala
  socket.on('joinRoom', ({ roomCode, player }, callback) => {
    try {
      const safe = sanitizeIncomingPlayer(player);
      const stableId = player?.id && typeof player.id === 'string' ? player.id.slice(0, 128) : socket.id;
      const { room, role, reconnect } = roomManager.joinRoom(roomCode, {
        id: stableId,
        socketId: socket.id,
        ...safe
      });
      socket.join(room.code);
      console.log(`[Sala] ${socket.id} entrou na sala ${room.code} como ${role}`);

      callback({ success: true, roomCode: room.code, role, reconnect });

      // Emite notificação no chat da sala
      const joinMsg = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `${player.name || 'Um jogador'} ${reconnect ? 'reconectou-se à' : 'entrou na'} partida.`,
        system: true,
        timestamp: Date.now()
      };
      io.to(room.code).emit('chatMessage', joinMsg);

      if (room.status === 'playing' && !room.timers.lastTimestamp) {
        room.timers.lastTimestamp = Date.now();
      }

      emitRoomState(room, io);
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // Fazer uma jogada (Move)
  socket.on('makeMove', ({ roomCode, move }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') {
      if (callback) callback({ success: false, error: 'O jogo não está em andamento.' });
      return;
    }

    // Identifica se quem está fazendo o movimento é o jogador do turno correto
    const turnColor = room.chess.turn();
    const activePlayer = room.players[turnColor];
    const moverColor = getPlayerColorBySocket(room, socket.id);
    if (!activePlayer || !moverColor) {
      if (callback) callback({ success: false, error: 'Você não é um jogador desta sala.' });
      return;
    }

    let allowed = playerControlsSocket(activePlayer, socket.id);
    if (!allowed && isBotPlayerId(activePlayer.id)) {
      const human = room.players[getOpponentColor(turnColor)];
      allowed = playerControlsSocket(human, socket.id);
    }
    if (!allowed) {
      if (callback) callback({ success: false, error: 'Não é sua vez de jogar.' });
      return;
    }

    try {
      // Valida o movimento no xadrez do servidor
      const moveResult = room.chess.move(move);
      if (!moveResult) {
        if (callback) callback({ success: false, error: 'Movimento ilegal.' });
        return;
      }

      // Se fez movimento com sucesso, atualiza o timestamp do timer
      room.timers.lastTimestamp = Date.now();
      room.takebackRequestFrom = null;
      room.drawOfferFrom = null;

      if (callback) callback({ success: true });

      // Verifica condições de fim de jogo
      if (room.chess.isGameOver()) {
        room.status = 'finished';
        let reason = 'checkmate';
        let winner = null;
        let message = 'Partida encerrada.';

        if (room.chess.isCheckmate()) {
          winner = turnColor;
          message = `Xeque-mate! ${winner === 'w' ? 'Brancas' : 'Pretas'} vencem a partida!`;
          if (winner === 'w') room.score.w += 1;
          else room.score.b += 1;
        } else if (room.chess.isStalemate()) {
          reason = 'stalemate';
          message = 'Empate por Rei Afogado (Stalemate)!';
          room.score.draws += 1;
        } else if (room.chess.isThreefoldRepetition()) {
          reason = 'repetition';
          message = 'Empate por repetição tripla de posição!';
          room.score.draws += 1;
        } else if (room.chess.isInsufficientMaterial()) {
          reason = 'insufficient';
          message = 'Empate por material insuficiente para xeque-mate!';
          room.score.draws += 1;
        } else if (room.chess.isDraw()) {
          reason = '50moves';
          message = 'Empate pela regra dos 50 movimentos sem captura ou avanço de peão!';
          room.score.draws += 1;
        }

        io.to(room.code).emit('gameOver', { reason, winner, message });
      }

      emitRoomState(room, io);
    } catch (err) {
      if (callback) callback({ success: false, error: 'Erro ao processar jogada: ' + err.message });
    }
  });

  // Chat
  socket.on('sendMessage', ({ roomCode, text }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const safeText = sanitizeChatText(text);
    if (!safeText) return;

    const chatMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sender: resolveChatSenderName(room, socket.id),
      text: safeText,
      system: false,
      timestamp: Date.now()
    };

    io.to(room.code).emit('chatMessage', chatMsg);
  });

  // Desfazer jogada (Takeback)
  socket.on('requestTakeback', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') return;

    // Acha a cor de quem está pedindo
    const requesterColor = getPlayerColorBySocket(room, socket.id);
    if (!requesterColor) return;

    room.takebackRequestFrom = requesterColor;
    emitRoomState(room, io);

    io.to(room.code).emit('chatMessage', {
      id: 'sys_' + Date.now(),
      sender: 'Sistema',
      text: `${requesterColor === 'w' ? 'Brancas' : 'Pretas'} solicitaram para desfazer o último lance.`,
      system: true,
      timestamp: Date.now()
    });
  });

  socket.on('respondTakeback', ({ roomCode, accepted }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing' || !room.takebackRequestFrom) return;

    const responderColor = getPlayerColorBySocket(room, socket.id);
    const requester = room.takebackRequestFrom;
    if (!responderColor || responderColor === requester) return;
    room.takebackRequestFrom = null;

    if (accepted) {
      // Volta uma ou duas jogadas para retornar à vez do solicitante
      room.chess.undo();
      if (room.chess.turn() !== requester) {
        room.chess.undo();
      }
      io.to(room.code).emit('chatMessage', {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: 'Pedido de voltar jogada foi aceito.',
        system: true,
        timestamp: Date.now()
      });
    } else {
      io.to(room.code).emit('chatMessage', {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: 'Pedido de voltar jogada foi recusado.',
        system: true,
        timestamp: Date.now()
      });
    }

    emitRoomState(room, io);
  });

  // Oferecer Empate (Draw Offer)
  socket.on('offerDraw', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') return;

    const offereeColor = getPlayerColorBySocket(room, socket.id);
    if (!offereeColor) return;

    room.drawOfferFrom = offereeColor;
    emitRoomState(room, io);

    io.to(room.code).emit('chatMessage', {
      id: 'sys_' + Date.now(),
      sender: 'Sistema',
      text: `${offereeColor === 'w' ? 'Brancas' : 'Pretas'} ofereceram empate.`,
      system: true,
      timestamp: Date.now()
    });
  });

  socket.on('respondDraw', ({ roomCode, accepted }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing' || !room.drawOfferFrom) return;

    const responderColor = getPlayerColorBySocket(room, socket.id);
    const offerer = room.drawOfferFrom;
    if (!responderColor || responderColor === offerer) return;
    room.drawOfferFrom = null;

    if (accepted) {
      room.status = 'finished';
      room.score.draws += 1;
      io.to(room.code).emit('gameOver', {
        reason: 'agreed',
        winner: null,
        message: 'Partida encerrada em empate por comum acordo.'
      });
    } else {
      io.to(room.code).emit('chatMessage', {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: 'A oferta de empate foi recusada.',
        system: true,
        timestamp: Date.now()
      });
    }

    emitRoomState(room, io);
  });

  // Desistir (Resign)
  socket.on('resignGame', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'playing') return;

    const ressignerColor = getPlayerColorBySocket(room, socket.id);
    if (!ressignerColor) return;

    const winnerColor = ressignerColor === 'w' ? 'b' : 'w';
    room.status = 'finished';
    if (winnerColor === 'w') room.score.w += 1;
    else room.score.b += 1;

    io.to(room.code).emit('gameOver', {
      reason: 'resignation',
      winner: winnerColor,
      message: `${ressignerColor === 'w' ? 'Brancas' : 'Pretas'} desistiram da partida. ${winnerColor === 'w' ? 'Brancas' : 'Pretas'} vencem!`
    });

    emitRoomState(room, io);
  });

  // Propor Revanche (Rematch)
  socket.on('requestRematch', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'finished') return;

    const requesterColor = getPlayerColorBySocket(room, socket.id);
    if (!requesterColor) return;

    if (!room.rematchRequestFrom) {
      room.rematchRequestFrom = requesterColor;
      io.to(room.code).emit('chatMessage', {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `${requesterColor === 'w' ? 'Brancas' : 'Pretas'} propuseram revanche. Aguardando o oponente.`,
        system: true,
        timestamp: Date.now()
      });
      emitRoomState(room, io);
      return;
    }

    if (room.rematchRequestFrom === requesterColor) return;

    room.rematchRequestFrom = null;
    const tempW = room.players.w;
    room.players.w = room.players.b;
    room.players.b = tempW;
    if (room.players.w) room.players.w.color = 'w';
    if (room.players.b) room.players.b.color = 'b';

    roomManager.startGame(room);

    io.to(room.code).emit('chatMessage', {
      id: 'sys_' + Date.now(),
      sender: 'Sistema',
      text: 'Revanche aceita! Cores invertidas. Boa partida!',
      system: true,
      timestamp: Date.now()
    });

    emitRoomState(room, io);
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);

    roomManager.rooms.forEach((room) => {
      let disconnectedColor = null;
      if (room.players.w && playerControlsSocket(room.players.w, socket.id)) {
        room.players.w.connected = false;
        disconnectedColor = 'w';
      } else if (room.players.b && playerControlsSocket(room.players.b, socket.id)) {
        room.players.b.connected = false;
        disconnectedColor = 'b';
      }

      if (disconnectedColor && room.status === 'playing') {
        room.disconnectedColor = disconnectedColor;
        const oppColor = disconnectedColor === 'w' ? 'b' : 'w';

        io.to(room.code).emit('chatMessage', {
          id: 'sys_' + Date.now(),
          sender: 'Sistema',
          text: `Atenção: ${disconnectedColor === 'w' ? 'Brancas' : 'Pretas'} se desconectaram. Aguardando reconexão (60s)...`,
          system: true,
          timestamp: Date.now()
        });

        // Configura um timeout de 60s para declarar vitória ao oponente
        room.disconnectTimeout = setTimeout(() => {
          if (room && room.status === 'playing' && room.disconnectedColor === disconnectedColor) {
            room.status = 'finished';
            if (oppColor === 'w') room.score.w += 1;
            else room.score.b += 1;

            io.to(room.code).emit('gameOver', {
              reason: 'abandonment',
              winner: oppColor,
              message: `Oponente abandonou a partida por desconexão. ${oppColor === 'w' ? 'Brancas' : 'Pretas'} vencem!`
            });
            emitRoomState(room, io);
          }
        }, 60000);

        emitRoomState(room, io);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Servidor Royale Chess] Executando na porta ${PORT}`);
});
