import { Chess } from 'chess.js';
import { sanitizeIncomingPlayer } from './security.js';

// Central de Armazenamento de Salas em Memória
// (Pode ser substituído por Redis em arquiteturas distribuídas)
export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Gera um código aleatório de 6 caracteres maiúsculos (letras e números)
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removido O, 0, 1, I para evitar ambiguidades
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostPlayer, config = {}) {
    const roomCode = this.generateRoomCode();
    const timeControlMinutes = config.timeControl || 10;
    const initialSeconds = timeControlMinutes * 60;

    const room = {
      code: roomCode,
      createdAt: Date.now(),
      status: 'waiting', // waiting, playing, finished
      chess: new Chess(),
      timeControlMinutes,
      turn: 'w',
      timers: {
        w: initialSeconds,
        b: initialSeconds,
        lastTimestamp: null
      },
      timerInterval: null,
      players: {
        w: null,
        b: null
      },
      spectators: [],
      score: {
        w: 0,
        b: 0,
        draws: 0
      },
      drawOfferFrom: null,
      takebackRequestFrom: null,
      disconnectTimeout: null,
      disconnectedColor: null,
      rematchRequestFrom: null
    };

    // Determina a cor do criador (Host)
    let hostColor = config.preferredColor || 'w';
    if (hostColor === 'random') {
      hostColor = Math.random() < 0.5 ? 'w' : 'b';
    }

    const safeHost = sanitizeIncomingPlayer(hostPlayer);
    room.players[hostColor] = {
      id: hostPlayer.id,
      socketId: hostPlayer.socketId || null,
      name: safeHost.name,
      rating: safeHost.rating,
      avatar: safeHost.avatar,
      avatarImage: safeHost.avatarImage,
      connected: true,
      color: hostColor
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase());
  }

  joinRoom(roomCode, player) {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error('Sala não encontrada ou não existe.');
    }

    // Verifica se o jogador já está na sala (reconexão)
    if (room.players.w && room.players.w.id === player.id) {
      room.players.w.connected = true;
      if (player.socketId) room.players.w.socketId = player.socketId;
      if (room.disconnectedColor === 'w') this.cancelDisconnectTimeout(room);
      return { room, role: 'w', reconnect: true };
    }
    if (room.players.b && room.players.b.id === player.id) {
      room.players.b.connected = true;
      if (player.socketId) room.players.b.socketId = player.socketId;
      if (room.disconnectedColor === 'b') this.cancelDisconnectTimeout(room);
      return { room, role: 'b', reconnect: true };
    }

    // Acha a vaga de jogador disponível
    let assignedRole = null;
    if (!room.players.w) {
      assignedRole = 'w';
    } else if (!room.players.b) {
      assignedRole = 'b';
    }

    if (assignedRole) {
      const safe = sanitizeIncomingPlayer(player);
      room.players[assignedRole] = {
        id: player.id,
        socketId: player.socketId || null,
        name: safe.name,
        rating: safe.rating,
        avatar: safe.avatar || (assignedRole === 'w' ? 'king' : 'queen'),
        avatarImage: safe.avatarImage,
        connected: true,
        color: assignedRole
      };

      // Se ambos os jogadores estão preenchidos, a partida inicia
      if (room.players.w && room.players.b && room.status === 'waiting') {
        this.startGame(room);
      }

      return { room, role: assignedRole, reconnect: false };
    } else {
      // Se a sala já tem 2 jogadores, entra como espectador
      const spec = { id: player.id, name: player.name || 'Espectador', connected: true };
      room.spectators.push(spec);
      return { room, role: 'spectator', reconnect: false };
    }
  }

  startGame(room) {
    room.status = 'playing';
    room.chess.reset();
    room.turn = 'w';
    const initialSeconds = room.timeControlMinutes * 60;
    room.timers = {
      w: initialSeconds,
      b: initialSeconds,
      lastTimestamp: Date.now()
    };
    room.drawOfferFrom = null;
    room.takebackRequestFrom = null;
  }

  cancelDisconnectTimeout(room) {
    if (room.disconnectTimeout) {
      clearTimeout(room.disconnectTimeout);
      room.disconnectTimeout = null;
    }
    room.disconnectedColor = null;
  }

  removeRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (room && room.timerInterval) {
      clearInterval(room.timerInterval);
    }
    this.rooms.delete(roomCode?.toUpperCase());
  }
}
