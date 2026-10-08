import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { ChatMessage, GameMode, GameOverInfo, Player, RoomState } from '../../types/chess';
import { AIService, BotDifficulty } from '../../services/aiService';
import { ProfileService } from '../../services/profileService';
import { sound } from '../../services/soundService';
import { ChessBoard } from './ChessBoard';
import { PlayerCard } from './PlayerCard';
import { MoveHistory } from './MoveHistory';
import { ChatPanel } from './ChatPanel';
import { ControlsPanel } from './ControlsPanel';
import { GameOverModal } from './GameOverModal';
import { CapturedPieces } from './CapturedPieces';
import { ShieldAlert, Users, Copy, Check, Eye } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
import { useI18n } from '../../services/i18n';

interface ActiveRoomViewProps {
  roomState: RoomState;
  gameMode: GameMode;
  myRole: 'w' | 'b' | 'spectator';
  onMakeMove: (move: { from: string; to: string; promotion?: string }) => void;
  onSendMessage: (text: string) => void;
  chatMessages: ChatMessage[];
  onRequestTakeback: () => void;
  onRespondTakeback: (accepted: boolean) => void;
  onOfferDraw: () => void;
  onRespondDraw: (accepted: boolean) => void;
  onResign: () => void;
  onRequestRematch: () => void;
  onLeave: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  botDifficulty?: BotDifficulty;
  botColor?: 'w' | 'b';
}

// Initial counts of pieces
const initialPieceCounts: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

export const ActiveRoomView: React.FC<ActiveRoomViewProps> = ({
  roomState,
  gameMode,
  myRole,
  onMakeMove,
  onSendMessage,
  chatMessages,
  onRequestTakeback,
  onRespondTakeback,
  onOfferDraw,
  onRespondDraw,
  onResign,
  onRequestRematch,
  onLeave,
  soundEnabled,
  onToggleSound,
  botDifficulty = 'medium',
  botColor = 'b'
}) => {
  const { t } = useI18n();
  const [chess] = useState<Chess>(() => new Chess());
  const [isFlipped, setIsFlipped] = useState<boolean>(() => myRole === 'b');
  const [copiedCode, setCopiedCode] = useState(false);
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);

  // Sync internal chess instance with the actual incoming FEN from roomState
  useEffect(() => {
    try {
      if (roomState.fen && roomState.fen !== chess.fen()) {
        chess.load(roomState.fen);
      }
    } catch (e) {
      console.warn('Sync FEN fail', e);
    }
  }, [roomState.fen, chess]);

  // Keep Flipped state synchronized if user role changes initially
  useEffect(() => {
    setIsFlipped(myRole === 'b');
  }, [myRole]);

  // Check if game ended
  useEffect(() => {
    if (roomState.status === 'finished') {
      // Find game over info
      let reason: GameOverInfo['reason'] = 'checkmate';
      let winner: 'w' | 'b' | null = null;
      let msg = t('matchFinished');

      if (chess.isCheckmate()) {
        winner = chess.turn() === 'w' ? 'b' : 'w';
        msg = t('checkmateResult').replace('{color}', winner === 'w' ? t('white') : t('black'));
      } else if (chess.isStalemate()) {
        reason = 'stalemate';
        msg = t('stalemateResult');
      } else if (chess.isThreefoldRepetition()) {
        reason = 'repetition';
        msg = t('repetitionResult');
      } else if (chess.isInsufficientMaterial()) {
        reason = 'insufficient';
        msg = t('insufficientResult');
      } else if (chess.isDraw()) {
        reason = '50moves';
        msg = t('fiftyMoveResult');
      }

      const info: GameOverInfo = { reason, winner, message: msg };
      setGameOverInfo(info);
      sound.victory();

      // Record profile results if I am a player
      if (myRole === 'w' || myRole === 'b') {
        const myRes = winner === myRole ? 'win' : winner === null ? 'draw' : 'loss';
        ProfileService.recordGameResult(myRes);
      }
    } else {
      setGameOverInfo(null);
    }
  }, [roomState.status, chess, myRole]);

  // Bot move trigger
  useEffect(() => {
    if (gameMode === 'bot' && roomState.status === 'playing' && roomState.turn === botColor) {
      const timer = setTimeout(() => {
        const bestMove = AIService.getBestMove(chess, botDifficulty);
        if (bestMove) {
          sound.move();
          onMakeMove(bestMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [roomState.status, roomState.turn, gameMode, botColor, botDifficulty, chess, onMakeMove]);

  // Compute captured pieces helper
  const computeCapturedAndAdvantage = () => {
    const board = chess.board();
    const currentCounts: Record<'w' | 'b', Record<string, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    let wTotalVal = 0;
    let bTotalVal = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'k') {
          currentCounts[p.color][p.type] = (currentCounts[p.color][p.type] || 0) + 1;
          const val = pieceValues[p.type] || 0;
          if (p.color === 'w') wTotalVal += val;
          else bTotalVal += val;
        }
      }
    }

    // What pieces did White capture? Missing from Black's initial counts
    const whiteCaptured: string[] = [];
    Object.entries(initialPieceCounts).forEach(([pType, initialCnt]) => {
      const bHas = currentCounts.b[pType] || 0;
      for (let i = 0; i < initialCnt - bHas; i++) {
        whiteCaptured.push(pType);
      }
    });

    // What pieces did Black capture? Missing from White's initial counts
    const blackCaptured: string[] = [];
    Object.entries(initialPieceCounts).forEach(([pType, initialCnt]) => {
      const wHas = currentCounts.w[pType] || 0;
      for (let i = 0; i < initialCnt - wHas; i++) {
        blackCaptured.push(pType);
      }
    });

    return {
      whiteCaptured,
      blackCaptured,
      wAdvantage: Math.max(0, wTotalVal - bTotalVal),
      bAdvantage: Math.max(0, bTotalVal - wTotalVal)
    };
  };

  const { whiteCaptured, blackCaptured, wAdvantage, bAdvantage } = computeCapturedAndAdvantage();

  // Find actual Player info to display
  let topPlayer: Player | null = roomState.players.b;
  let bottomPlayer: Player | null = roomState.players.w;
  let topColor: 'w' | 'b' = 'b';
  let bottomColor: 'w' | 'b' = 'w';

  // If board is flipped or I am Black, bottom is Black
  if (isFlipped) {
    topPlayer = roomState.players.w;
    bottomPlayer = roomState.players.b;
    topColor = 'w';
    bottomColor = 'b';
  }

  // Handle local code copy
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find last move
  const lastHistoryItem = roomState.history[roomState.history.length - 1];
  const lastMove = lastHistoryItem ? { from: lastHistoryItem.from, to: lastHistoryItem.to } : undefined;

  // Determine active turn for cards
  const isTopTurn = roomState.turn === topColor && roomState.status === 'playing';
  const isBottomTurn = roomState.turn === bottomColor && roomState.status === 'playing';

  return (
    <div className="flex flex-col min-h-screen bg-[var(--rc-page)] text-[var(--rc-text)] select-none">
      <header className="sticky top-0 z-40 bg-[var(--rc-page)]/90 backdrop-blur-md border-b border-[var(--rc-border)] px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-sm sm:text-base tracking-tight">{t('privateRoom')}</span>
          </div>
          <div className="flex items-center gap-2 font-mono bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-semibold hidden sm:inline">{t('code')}</span>
            <span className="text-amber-400 font-bold tracking-widest text-sm">{roomState.code}</span>
            <button
              onClick={handleCopyCode}
              className="ml-1 p-1 hover:text-white text-slate-400 hover:bg-slate-800 rounded transition-all"
              title={t('copyRoomCode')}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <LanguageSelector />
          <ThemeToggle />
          {roomState.spectators.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200">{roomState.spectators.length}</span>
              <span className="hidden sm:inline">{t('spectators')}</span>
            </div>
          )}

          {/* Role display */}
          <div className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl font-bold text-xs text-indigo-300">
            {myRole === 'w' ? t('roleWhite') : myRole === 'b' ? t('roleBlack') : t('roleSpectator')}
          </div>
        </div>
      </header>

      {/* Disconnect or Requests Alert Banner */}
      {roomState.disconnectedColor && roomState.status === 'playing' && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2.5 text-amber-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{t('disconnectedAlert').replace('{color}', roomState.disconnectedColor === 'w' ? t('white') : t('black'))}</span>
        </div>
      )}

      {roomState.takebackRequestFrom && roomState.takebackRequestFrom !== myRole && myRole !== 'spectator' && (
        <div className="bg-indigo-600 border-b border-indigo-500 px-4 py-2.5 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top duration-200">
          <span>{t('opponentTakeback')}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRespondTakeback(true)}
              className="px-3 py-1 bg-white text-indigo-950 rounded-lg hover:bg-slate-100 transition-all active:scale-95 text-xs"
            >
              {t('accept')}
            </button>
            <button
              onClick={() => onRespondTakeback(false)}
              className="px-3 py-1 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-all active:scale-95 text-xs"
            >
              {t('decline')}
            </button>
          </div>
        </div>
      )}

      {roomState.drawOfferFrom && roomState.drawOfferFrom !== myRole && myRole !== 'spectator' && (
        <div className="bg-amber-600 border-b border-amber-500 px-4 py-2.5 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top duration-200">
          <span>{t('opponentDraw')}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRespondDraw(true)}
              className="px-3 py-1 bg-white text-amber-950 rounded-lg hover:bg-slate-100 transition-all active:scale-95 text-xs"
            >
              {t('acceptDraw')}
            </button>
            <button
              onClick={() => onRespondDraw(false)}
              className="px-3 py-1 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-all active:scale-95 text-xs"
            >
              {t('continueGame')}
            </button>
          </div>
        </div>
      )}

      {/* Main Board and Utility Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Chess Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Top Player Card */}
          <PlayerCard
            player={topPlayer}
            color={topColor}
            roleLabel={topColor === 'w' ? t('white') : t('black')}
            isTurn={isTopTurn}
            timerSeconds={roomState.timers[topColor]}
            timeControlMinutes={roomState.timeControl}
            scoreAdvantage={topColor === 'w' ? wAdvantage : bAdvantage}
            capturedPiecesComponent={
              <CapturedPieces
                captured={topColor === 'w' ? whiteCaptured : blackCaptured}
                capturedColor={topColor === 'w' ? 'b' : 'w'}
                scoreAdvantage={topColor === 'w' ? wAdvantage : bAdvantage}
              />
            }
          />

          {/* Central Interactive Chess Board */}
          <ChessBoard
            chess={chess}
            onMakeMove={(move) => {
              // Only trigger normal socket transmission or state update
              onMakeMove(move);
            }}
            playerColor={myRole}
            isFlipped={isFlipped}
            isGameActive={roomState.status === 'playing'}
            lastMove={lastMove}
          />

          {/* Bottom Player Card */}
          <PlayerCard
            player={bottomPlayer}
            color={bottomColor}
            roleLabel={bottomColor === 'w' ? t('white') : t('black')}
            isTurn={isBottomTurn}
            timerSeconds={roomState.timers[bottomColor]}
            timeControlMinutes={roomState.timeControl}
            scoreAdvantage={bottomColor === 'w' ? wAdvantage : bAdvantage}
            capturedPiecesComponent={
              <CapturedPieces
                captured={bottomColor === 'w' ? whiteCaptured : blackCaptured}
                capturedColor={bottomColor === 'w' ? 'b' : 'w'}
                scoreAdvantage={bottomColor === 'w' ? wAdvantage : bAdvantage}
              />
            }
          />

          {/* Controls Bar */}
          <ControlsPanel
            onTakeback={onRequestTakeback}
            onDraw={onOfferDraw}
            onResign={onResign}
            onFlipBoard={() => setIsFlipped(!isFlipped)}
            onLeave={onLeave}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            gameStatus={roomState.status}
          />
        </div>

        {/* Right Side Utility Panels (Move History + Live Chat) (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-[500px] lg:max-h-[820px]">
          {/* Waiting Room Banner if 2nd player hasn't joined */}
          {roomState.status === 'waiting' && (
            <div className="bg-indigo-600/20 border-2 border-indigo-500/50 rounded-2xl p-5 text-center shadow-xl">
              <Users className="w-10 h-10 text-indigo-400 mx-auto mb-2 animate-pulse" />
              <h3 className="font-black text-lg text-white mb-1">{t('waitingSecondPlayer')}</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {t('shareRoomCode').replace('{code}', roomState.code)}
              </p>
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl text-xs transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{t('copyMatchCode')}</span>
              </button>
            </div>
          )}

          {/* PGN Move History Panel */}
          <div className="flex-1 min-h-[220px]">
            <MoveHistory history={roomState.history} pgn={roomState.pgn} />
          </div>

          {/* Live Match Chat Panel */}
          <div className="flex-1 min-h-[260px]">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={onSendMessage}
              currentUser={myRole === 'w' ? roomState.players.w?.name || t('white') : myRole === 'b' ? roomState.players.b?.name || t('black') : t('roleSpectator')}
            />
          </div>
        </div>
      </main>

      {/* Game Over Outcome Modal Overlay */}
      {gameOverInfo && (
        <GameOverModal
          info={gameOverInfo}
          playerColor={myRole}
          onRematch={onRequestRematch}
          onLeave={onLeave}
          pgn={chess.pgn()}
        />
      )}
    </div>
  );
};
