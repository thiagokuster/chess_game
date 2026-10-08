// Data structures and types for Royale Chess

export type GameMode = 'online' | 'bot' | 'local';

export type PieceColor = 'w' | 'b';

export type PlayerColorPreference = 'w' | 'b' | 'random';

export type TimeControl = 1 | 3 | 5 | 10 | 15 | 30 | 0; // 0 = sem tempo

export type ChessAvatar = 'king' | 'queen' | 'knight' | 'rook' | 'bishop' | 'pawn';

export interface Player {
  id: string;
  name: string;
  rating: number;
  avatar: ChessAvatar;
  avatarImage?: string | null;
  connected?: boolean;
  color?: PieceColor;
}

export interface TimersState {
  w: number; // segundos restantes
  b: number; // segundos restantes
  lastTimestamp: number | null;
}

export interface ScoreBoard {
  w: number;
  b: number;
  draws: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  system: boolean;
  timestamp: number;
}

export interface RoomState {
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  fen: string;
  pgn: string;
  history: Array<{
    color: 'w' | 'b';
    from: string;
    to: string;
    piece: string;
    san: string;
    flags?: string;
  }>;
  turn: 'w' | 'b';
  timeControl: TimeControl;
  timers: TimersState;
  players: {
    w: Player | null;
    b: Player | null;
  };
  spectators: Array<{ id: string; name: string }>;
  score: ScoreBoard;
  drawOfferFrom: PieceColor | null;
  takebackRequestFrom: PieceColor | null;
  disconnectedColor: PieceColor | null;
  rematchRequestFrom?: PieceColor | null;
}

export interface GameOverInfo {
  reason: 'checkmate' | 'stalemate' | 'repetition' | 'insufficient' | '50moves' | 'timeout' | 'resignation' | 'agreed' | 'abandonment';
  winner: PieceColor | null;
  message: string;
}

export interface UserProfile {
  name: string;
  rating: number;
  avatar: ChessAvatar;
  avatarImage?: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface PublicRoomInfo {
  code: string;
  host: string;
  hostRating: number;
  timeControl: number;
  createdAt: number;
}
