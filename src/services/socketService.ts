import { io, Socket } from 'socket.io-client';
import { ChatMessage, GameOverInfo, Player, RoomState } from '../types/chess';
import { Chess } from 'chess.js';

export interface ServerCallbacks {
  onGameState?: (state: RoomState) => void;
  onChatMessage?: (msg: ChatMessage) => void;
  onGameOver?: (info: GameOverInfo) => void;
  onTimersUpdate?: (timers: { w: number; b: number; lastTimestamp: number | null }) => void;
}

// In-Memory Simulation state for seamless browser-based multiplayer when backend Node is offline
interface MockRoom {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  chess: Chess;
  timeControlMinutes: number;
  timers: { w: number; b: number; lastTimestamp: number | null };
  players: { w: Player | null; b: Player | null };
  spectators: Array<{ id: string; name: string }>;
  score: { w: number; b: number; draws: number };
  drawOfferFrom: 'w' | 'b' | null;
  takebackRequestFrom: 'w' | 'b' | null;
  disconnectedColor: 'w' | 'b' | null;
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:3001';
  private callbacks: ServerCallbacks = {};
  public isRealSocketConnected: boolean = false;
  
  // Simulated P2P layer
  private channel: BroadcastChannel | null = null;
  private mockRooms: Map<string, MockRoom> = new Map();
  private mockTimerInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      this.channel = new BroadcastChannel('royale_chess_multiplayer_p2p_v1');
      this.channel.onmessage = (ev) => this.handleP2PMessage(ev.data);
    }
  }

  public setUrl(url: string) {
    this.serverUrl = url;
  }

  public registerCallbacks(callbacks: ServerCallbacks) {
    this.callbacks = callbacks;
  }

  public connect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 4000
      });

      this.socket.on('connect', () => {
        console.log('[SocketService] Connectado via real Socket.IO:', this.socket?.id);
        this.isRealSocketConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.warn('[SocketService] Desconectado do real Socket.IO');
        this.isRealSocketConnected = false;
      });

      this.socket.on('gameState', (state: RoomState) => {
        if (this.callbacks.onGameState) this.callbacks.onGameState(state);
      });

      this.socket.on('chatMessage', (msg: ChatMessage) => {
        if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(msg);
      });

      this.socket.on('gameOver', (info: GameOverInfo) => {
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(info);
      });

      this.socket.on('timersUpdate', (timers: { w: number; b: number; lastTimestamp: number | null }) => {
        if (this.callbacks.onTimersUpdate) this.callbacks.onTimersUpdate(timers);
      });
    } catch (e) {
      console.warn('[SocketService] Falha ao conectar ao servidor real, usando fallback em Mock P2P', e);
      this.isRealSocketConnected = false;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.mockTimerInterval) {
      clearInterval(this.mockTimerInterval);
      this.mockTimerInterval = null;
    }
  }

  // Helper to convert MockRoom to serializable RoomState
  private toRoomState(room: MockRoom): RoomState {
    const history = room.chess.history({ verbose: true }).map(h => ({
      color: h.color as 'w' | 'b',
      from: h.from,
      to: h.to,
      piece: h.piece,
      san: h.san,
      flags: h.flags
    }));

    return {
      code: room.code,
      status: room.status,
      fen: room.chess.fen(),
      pgn: room.chess.pgn(),
      history,
      turn: room.chess.turn(),
      timeControl: room.timeControlMinutes as 1 | 3 | 5 | 10 | 15 | 30 | 0,
      timers: room.timers,
      players: room.players,
      spectators: room.spectators,
      score: room.score,
      drawOfferFrom: room.drawOfferFrom,
      takebackRequestFrom: room.takebackRequestFrom,
      disconnectedColor: room.disconnectedColor
    };
  }

  private broadcastP2P(type: string, payload: unknown) {
    if (this.channel) {
      this.channel.postMessage({ type, payload });
    }
  }

  private handleP2PMessage(data: { type: string; payload: any }) {
    const { type, payload } = data;

    if (type === 'P2P_GAME_STATE' && this.callbacks.onGameState) {
      this.callbacks.onGameState(payload);
    } else if (type === 'P2P_CHAT_MESSAGE' && this.callbacks.onChatMessage) {
      this.callbacks.onChatMessage(payload);
    } else if (type === 'P2P_GAME_OVER' && this.callbacks.onGameOver) {
      this.callbacks.onGameOver(payload);
    } else if (type === 'P2P_TIMERS_UPDATE' && this.callbacks.onTimersUpdate) {
      this.callbacks.onTimersUpdate(payload);
    }
  }

  // --- Core Game Methods ---

  public createRoom(
    player: Player,
    config: { timeControl?: number; preferredColor?: 'w' | 'b' | 'random' },
    callback: (res: { success: boolean; roomCode?: string; error?: string }) => void
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('createRoom', { player, config }, callback);
    } else {
      // Fallback P2P / In Memory Mode
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const timeMinutes = config.timeControl || 10;
      let hostColor: 'w' | 'b' = (config.preferredColor === 'random' || !config.preferredColor) 
        ? (Math.random() < 0.5 ? 'w' : 'b') 
        : config.preferredColor;

      const newRoom: MockRoom = {
        code,
        status: 'waiting',
        chess: new Chess(),
        timeControlMinutes: timeMinutes,
        timers: { w: timeMinutes * 60, b: timeMinutes * 60, lastTimestamp: null },
        players: {
          w: hostColor === 'w' ? { ...player, color: 'w', connected: true } : null,
          b: hostColor === 'b' ? { ...player, color: 'b', connected: true } : null
        },
        spectators: [],
        score: { w: 0, b: 0, draws: 0 },
        drawOfferFrom: null,
        takebackRequestFrom: null,
        disconnectedColor: null
      };

      this.mockRooms.set(code, newRoom);
      callback({ success: true, roomCode: code });
      
      const rState = this.toRoomState(newRoom);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      this.startMockTimer(code);
    }
  }

  public joinRoom(
    roomCode: string,
    player: Player,
    callback: (res: { success: boolean; roomCode?: string; role?: string; reconnect?: boolean; error?: string }) => void
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('joinRoom', { roomCode, player }, callback);
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);

      if (!room) {
        callback({ success: false, error: 'Sala não existe ou código incorreto.' });
        return;
      }

      // Reconnection check
      if (room.players.w?.id === player.id) {
        room.players.w.connected = true;
        callback({ success: true, roomCode: code, role: 'w', reconnect: true });
        const rState = this.toRoomState(room);
        if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
        this.broadcastP2P('P2P_GAME_STATE', rState);
        return;
      }
      if (room.players.b?.id === player.id) {
        room.players.b.connected = true;
        callback({ success: true, roomCode: code, role: 'b', reconnect: true });
        const rState = this.toRoomState(room);
        if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
        this.broadcastP2P('P2P_GAME_STATE', rState);
        return;
      }

      // Assign slot
      let assignedRole: 'w' | 'b' | 'spectator' = 'spectator';
      if (!room.players.w) {
        assignedRole = 'w';
        room.players.w = { ...player, color: 'w', connected: true };
      } else if (!room.players.b) {
        assignedRole = 'b';
        room.players.b = { ...player, color: 'b', connected: true };
      } else {
        room.spectators.push({ id: player.id, name: player.name });
      }

      if (room.players.w && room.players.b && room.status === 'waiting') {
        room.status = 'playing';
        room.timers.lastTimestamp = Date.now();
      }

      callback({ success: true, roomCode: code, role: assignedRole, reconnect: false });

      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `${player.name} entrou na sala.`,
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  public makeMove(
    roomCode: string,
    move: { from: string; to: string; promotion?: string },
    callback?: (res: { success: boolean; error?: string }) => void
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('makeMove', { roomCode, move }, callback);
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);

      if (!room || room.status !== 'playing') {
        if (callback) callback({ success: false, error: 'Jogo não está em andamento.' });
        return;
      }

      try {
        const res = room.chess.move(move);
        if (!res) {
          if (callback) callback({ success: false, error: 'Movimento ilegal.' });
          return;
        }

        room.timers.lastTimestamp = Date.now();
        room.takebackRequestFrom = null;
        room.drawOfferFrom = null;

        if (callback) callback({ success: true });

        // Check endgame
        if (room.chess.isGameOver()) {
          room.status = 'finished';
          let reason: GameOverInfo['reason'] = 'checkmate';
          let winner: 'w' | 'b' | null = null;
          let msg = 'Partida encerrada.';

          if (room.chess.isCheckmate()) {
            winner = room.chess.turn() === 'w' ? 'b' : 'w';
            msg = `Xeque-mate! ${winner === 'w' ? 'Brancas' : 'Pretas'} vencem!`;
            if (winner === 'w') room.score.w += 1;
            else room.score.b += 1;
          } else if (room.chess.isStalemate()) {
            reason = 'stalemate';
            msg = 'Empate por Rei Afogado (Stalemate)!';
            room.score.draws += 1;
          } else if (room.chess.isThreefoldRepetition()) {
            reason = 'repetition';
            msg = 'Empate por repetição tripla!';
            room.score.draws += 1;
          } else if (room.chess.isInsufficientMaterial()) {
            reason = 'insufficient';
            msg = 'Empate por material insuficiente!';
            room.score.draws += 1;
          } else if (room.chess.isDraw()) {
            reason = '50moves';
            msg = 'Empate pela regra dos 50 lances!';
            room.score.draws += 1;
          }

          const gameOverInfo: GameOverInfo = { reason, winner, message: msg };
          if (this.callbacks.onGameOver) this.callbacks.onGameOver(gameOverInfo);
          this.broadcastP2P('P2P_GAME_OVER', gameOverInfo);
        }

        const rState = this.toRoomState(room);
        if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
        this.broadcastP2P('P2P_GAME_STATE', rState);

      } catch (err) {
        if (callback) callback({ success: false, error: (err as Error).message });
      }
    }
  }

  public sendMessage(roomCode: string, text: string, sender: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('sendMessage', { roomCode, text, sender });
    } else {
      const msg: ChatMessage = {
        id: 'msg_' + Date.now(),
        sender,
        text,
        system: false,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(msg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', msg);
    }
  }

  public requestTakeback(roomCode: string, requesterColor: 'w' | 'b'): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('requestTakeback', { roomCode });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'playing') return;

      room.takebackRequestFrom = requesterColor;
      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `${requesterColor === 'w' ? 'Brancas' : 'Pretas'} pediram para voltar a jogada.`,
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  public respondTakeback(roomCode: string, accepted: boolean): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('respondTakeback', { roomCode, accepted });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'playing' || !room.takebackRequestFrom) return;

      const requester = room.takebackRequestFrom;
      room.takebackRequestFrom = null;

      if (accepted) {
        room.chess.undo();
        if (room.chess.turn() !== requester) {
          room.chess.undo();
        }
      }

      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `Pedido de voltar jogada foi ${accepted ? 'aceito' : 'recusado'}.`,
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  public offerDraw(roomCode: string, offererColor: 'w' | 'b'): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('offerDraw', { roomCode });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'playing') return;

      room.drawOfferFrom = offererColor;
      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `${offererColor === 'w' ? 'Brancas' : 'Pretas'} propuseram empate.`,
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  public respondDraw(roomCode: string, accepted: boolean): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('respondDraw', { roomCode, accepted });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'playing' || !room.drawOfferFrom) return;

      room.drawOfferFrom = null;

      if (accepted) {
        room.status = 'finished';
        room.score.draws += 1;
        const info: GameOverInfo = {
          reason: 'agreed',
          winner: null,
          message: 'Partida encerrada em empate por acordo.'
        };
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(info);
        this.broadcastP2P('P2P_GAME_OVER', info);
      }

      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: `A oferta de empate foi ${accepted ? 'aceita' : 'recusada'}.`,
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  public resignGame(roomCode: string, ressignerColor: 'w' | 'b'): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('resignGame', { roomCode });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'playing') return;

      const winnerColor = ressignerColor === 'w' ? 'b' : 'w';
      room.status = 'finished';
      if (winnerColor === 'w') room.score.w += 1;
      else room.score.b += 1;

      const info: GameOverInfo = {
        reason: 'resignation',
        winner: winnerColor,
        message: `${ressignerColor === 'w' ? 'Brancas' : 'Pretas'} abandonaram. ${winnerColor === 'w' ? 'Brancas' : 'Pretas'} vencem!`
      };
      if (this.callbacks.onGameOver) this.callbacks.onGameOver(info);
      this.broadcastP2P('P2P_GAME_OVER', info);

      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);
    }
  }

  public requestRematch(roomCode: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('requestRematch', { roomCode });
    } else {
      const code = roomCode.toUpperCase();
      const room = this.mockRooms.get(code);
      if (!room || room.status !== 'finished') return;

      const temp = room.players.w;
      room.players.w = room.players.b;
      room.players.b = temp;
      if (room.players.w) room.players.w.color = 'w';
      if (room.players.b) room.players.b.color = 'b';

      room.status = 'playing';
      room.chess.reset();
      const timeSecs = room.timeControlMinutes * 60;
      room.timers = { w: timeSecs, b: timeSecs, lastTimestamp: Date.now() };

      const rState = this.toRoomState(room);
      if (this.callbacks.onGameState) this.callbacks.onGameState(rState);
      this.broadcastP2P('P2P_GAME_STATE', rState);

      const sysMsg: ChatMessage = {
        id: 'sys_' + Date.now(),
        sender: 'Sistema',
        text: 'Revanche iniciada! Cores invertidas. Boa partida!',
        system: true,
        timestamp: Date.now()
      };
      if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(sysMsg);
      this.broadcastP2P('P2P_CHAT_MESSAGE', sysMsg);
    }
  }

  private startMockTimer(code: string) {
    if (this.mockTimerInterval) return;
    this.mockTimerInterval = setInterval(() => {
      const room = this.mockRooms.get(code);
      if (room && room.status === 'playing' && room.timers.lastTimestamp && room.timeControlMinutes > 0) {
        const now = Date.now();
        const elapsed = (now - room.timers.lastTimestamp) / 1000;
        room.timers.lastTimestamp = now;

        const activeColor = room.chess.turn() as 'w' | 'b';
        room.timers[activeColor] -= elapsed;

        if (room.timers[activeColor] <= 0) {
          room.timers[activeColor] = 0;
          room.status = 'finished';
          const winnerColor = activeColor === 'w' ? 'b' : 'w';
          if (winnerColor === 'w') room.score.w += 1;
          else room.score.b += 1;

          const gameOverInfo: GameOverInfo = {
            reason: 'timeout',
            winner: winnerColor,
            message: `Tempo esgotado! ${winnerColor === 'w' ? 'Brancas' : 'Pretas'} vencem por tempo.`
          };
          if (this.callbacks.onGameOver) this.callbacks.onGameOver(gameOverInfo);
          this.broadcastP2P('P2P_GAME_OVER', gameOverInfo);
        }

        if (this.callbacks.onTimersUpdate) this.callbacks.onTimersUpdate(room.timers);
        this.broadcastP2P('P2P_TIMERS_UPDATE', room.timers);
      }
    }, 1000);
  }
}

export const socketService = new SocketService();
