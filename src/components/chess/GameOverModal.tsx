import React, { useEffect } from 'react';
import { GameOverInfo } from '../../types/chess';
import confetti from 'canvas-confetti';
import { Trophy, Handshake, AlertTriangle, Download, RotateCw, ArrowLeft } from 'lucide-react';
import { useI18n, type TranslationKey } from '../../services/i18n';

interface GameOverModalProps {
  info: GameOverInfo;
  playerColor: 'w' | 'b' | 'spectator';
  onRematch: () => void;
  onLeave: () => void;
  pgn: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ info, playerColor, onRematch, onLeave, pgn }) => {
  const { t } = useI18n();
  const isWinner = info.winner === playerColor;
  const isDraw = info.winner === null;
  const winningColor = info.winner === 'w' ? t('white') : t('black');

  const resultMessages: Record<GameOverInfo['reason'], TranslationKey> = {
    checkmate: 'checkmateResult',
    stalemate: 'stalemateResult',
    repetition: 'repetitionResult',
    insufficient: 'insufficientResult',
    '50moves': 'fiftyMoveResult',
    timeout: 'timeoutResult',
    resignation: 'resignationResult',
    agreed: 'agreedDrawResult',
    abandonment: 'abandonmentResult'
  };
  const resultMessage = t(resultMessages[info.reason]).replace('{color}', winningColor);

  useEffect(() => {
    if (isWinner || isDraw) {
      try {
        confetti({
          particleCount: isWinner ? 100 : 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti fail', e);
      }
    }
  }, [isWinner, isDraw]);

  // Determine elegant title & icon
  const renderHeader = () => {
    if (isDraw) {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 mx-auto shadow-lg shadow-amber-500/10">
            <Handshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-wide uppercase">{t('gameDrawn')}</h2>
        </>
      );
    }

    if (isWinner) {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 mx-auto shadow-lg shadow-emerald-500/10">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-emerald-400 tracking-wide uppercase">{t('youWon')}</h2>
        </>
      );
    }

    // Spectator view
    if (playerColor === 'spectator') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-wide uppercase">
            {t('winnerColor').replace('{color}', winningColor)}
          </h2>
        </>
      );
    }

    // Defeat
    return (
      <>
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-rose-400 tracking-wide uppercase">{t('youLost')}</h2>
      </>
    );
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `royale_chess_${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-center shadow-2xl">
        {renderHeader()}

        <p className="text-sm font-medium text-slate-300 mt-2 mb-6 px-2">{resultMessage}</p>

        {/* Action Controls */}
        <div className="space-y-3">
          <button
            onClick={onRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-transform active:scale-98 shadow-lg shadow-indigo-600/20"
          >
            <RotateCw className="w-5 h-5" />
            <span>{t('rematch')}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPgn}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs">{t('downloadPgn')}</span>
            </button>

            <button
              onClick={onLeave}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">{t('backToLobby')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
