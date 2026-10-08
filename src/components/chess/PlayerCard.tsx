import React from 'react';
import { Player } from '../../types/chess';
import { Wifi, WifiOff } from 'lucide-react';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { useI18n } from '../../services/i18n';

interface PlayerCardProps {
  player: Player | null;
  color: 'w' | 'b';
  roleLabel: string;
  isTurn: boolean;
  timerSeconds: number;
  timeControlMinutes: number;
  scoreAdvantage: number;
  capturedPiecesComponent?: React.ReactNode;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  color,
  roleLabel,
  isTurn,
  timerSeconds,
  timeControlMinutes,
  capturedPiecesComponent
}) => {
  const { t } = useI18n();
  const isWhite = color === 'w';
  const isChessEngine = player?.id.startsWith('bot_engine_') ?? false;

  // Format timer
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const tenths = Math.floor((secs % 1) * 10);

    if (m === 0 && s < 10 && timeControlMinutes > 0) {
      return `0${s}.${tenths}s`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = timerSeconds < 20 && timerSeconds > 0 && timeControlMinutes > 0;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border transition-all duration-300 ${isTurn
        ? 'bg-[var(--rc-surface)] border-indigo-500/60 shadow-lg shadow-indigo-500/10'
        : 'bg-[var(--rc-surface)]/80 border-[var(--rc-border)]'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar badge */}
        <div className="relative">
          <div className={isTurn ? 'scale-105 ring-2 ring-indigo-500/50 rounded-xl' : ''}>
            {player ? (
              <AvatarDisplay avatar={player.avatar} avatarImage={player.avatarImage} />
            ) : (
              <AvatarDisplay avatar="pawn" avatarImage={null} className="w-12 h-12 rounded-xl opacity-40" />
            )}
          </div>

          {/* Color Indicator mini circle */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm ${isWhite ? 'bg-white' : 'bg-slate-950'
              }`}
            title={isWhite ? t('white') : t('black')}
          />
        </div>

        {/* Name and Rating */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--rc-text)] text-sm sm:text-base max-w-[140px] sm:max-w-[180px] truncate">
              {player ? (isChessEngine ? t('chessEngine') : player.name) : t('waitingForColor').replace('{color}', roleLabel)}
            </h3>

            {/* Connection badge */}
            {player && (
              <span title={player.connected ? t('online') : t('disconnected')}>
                {player.connected ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            {player && (
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 font-mono font-medium">
                Elo {player.rating}
              </span>
            )}
            <span className="text-slate-500">•</span>
            <span>{isWhite ? t('white') : t('black')}</span>
          </div>
        </div>
      </div>

      {/* Right side: Captured Pieces + Timer */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
        <div className="sm:mb-1">{capturedPiecesComponent}</div>

        {timeControlMinutes > 0 && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-base sm:text-lg tracking-wider border transition-colors ${isLowTime
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
              : isTurn
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'bg-slate-950/80 text-slate-400 border-slate-800/80'
              }`}
          >
            {/* Pulsing Dot if active */}
            {isTurn && timerSeconds > 0 && (
              <span className={`w-2 h-2 rounded-full ${isLowTime ? 'bg-rose-500' : 'bg-indigo-400 animate-ping'}`} />
            )}
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
