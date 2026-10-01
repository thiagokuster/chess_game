import React, { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  history: Array<{
    color: 'w' | 'b';
    from: string;
    to: string;
    san: string;
    piece: string;
  }>;
  pgn: string;
  onSelectMove?: (moveIndex: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs: [WhiteMove, BlackMove]
  const movePairs: Array<{ moveNumber: number; w?: string; b?: string }> = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      w: history[i]?.san,
      b: history[i + 1]?.san
    });
  }

  // Auto scroll to bottom when new move is made
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
        <span>Histórico de Lances</span>
        <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-400 border border-slate-700">
          {history.length} {history.length === 1 ? 'lance' : 'lances'}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[220px] lg:max-h-none">
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
            <span className="text-lg mb-1">♟️</span>
            <span>Nenhum movimento ainda</span>
          </div>
        ) : (
          movePairs.map((pair, idx) => {
            const isLastWhite = history.length - 1 === idx * 2;
            const isLastBlack = history.length - 1 === idx * 2 + 1;

            return (
              <div
                key={pair.moveNumber}
                className="flex items-center px-2 py-1.5 rounded-lg font-mono text-xs hover:bg-slate-800/40 transition-colors"
              >
                <span className="w-10 text-slate-500 font-bold">{pair.moveNumber}.</span>

                <div className="flex-1 grid grid-cols-2 gap-2">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      isLastWhite ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-slate-200'
                    }`}
                  >
                    {pair.w}
                  </span>

                  {pair.b && (
                    <span
                      className={`px-2 py-0.5 rounded ${
                        isLastBlack ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-slate-300'
                      }`}
                    >
                      {pair.b}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
