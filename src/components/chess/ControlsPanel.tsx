import React, { useState } from 'react';
import { RotateCcw, Flag, Handshake, FlipHorizontal, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface ControlsPanelProps {
  onTakeback: () => void;
  onDraw: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
  onLeave: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gameStatus: 'waiting' | 'playing' | 'finished';
  isTurn?: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onTakeback,
  onDraw,
  onResign,
  onFlipBoard,
  onLeave,
  soundEnabled,
  onToggleSound,
  gameStatus
}) => {
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const isPlaying = gameStatus === 'playing';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[var(--rc-surface)]/80 rounded-xl border border-[var(--rc-border)] select-none">
      {/* Action triggers */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onTakeback}
          disabled={!isPlaying}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Solicitar para voltar o último lance"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Desfazer</span>
        </button>

        <button
          onClick={onDraw}
          disabled={!isPlaying}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Oferecer empate de comum acordo"
        >
          <Handshake className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Empate</span>
        </button>

        {showResignConfirm ? (
          <div className="flex items-center gap-1 animate-in fade-in duration-200">
            <button
              onClick={() => {
                onResign();
                setShowResignConfirm(false);
              }}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowResignConfirm(false)}
              className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResignConfirm(true)}
            disabled={!isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 disabled:hover:bg-rose-500/10 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/30 transition-all active:scale-95"
            title="Desistir da partida"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Desistir</span>
          </button>
        )}
      </div>

      {/* Board Utility triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={onFlipBoard}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all"
          title="Inverter posições do tabuleiro (Giradas de 180°)"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all"
          title={soundEnabled ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all"
          title="Sair para o Lobby Principal"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Lobby</span>
        </button>
      </div>
    </div>
  );
};
