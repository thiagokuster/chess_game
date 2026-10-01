import React from 'react';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '../../types/chess';

interface CapturedPiecesProps {
  captured: string[]; // array of piece types captured by this player (e.g., ['p', 'p', 'n', 'q'])
  capturedColor: PieceColor; // 'w' or 'b' (color of the pieces that were captured)
  scoreAdvantage: number; // e.g. 2 if this player is +2 ahead in material
}

// Order of importance for display
const pieceOrder: Record<string, number> = {
  q: 1,
  r: 2,
  b: 3,
  n: 4,
  p: 5
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ captured, capturedColor, scoreAdvantage }) => {
  if (captured.length === 0 && scoreAdvantage <= 0) return null;

  const sortedPieces = [...captured].sort((a, b) => (pieceOrder[a.toLowerCase()] || 99) - (pieceOrder[b.toLowerCase()] || 99));

  return (
    <div className="flex items-center gap-1 min-h-[28px] px-1 select-none">
      <div className="flex flex-wrap items-center">
        {sortedPieces.map((p, idx) => (
          <div key={idx} className="w-5 h-5 -ml-1.5 first:ml-0 transition-transform hover:translate-y-[-2px]">
            <ChessPiece type={p} color={capturedColor} className="w-full h-full" />
          </div>
        ))}
      </div>

      {scoreAdvantage > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          +{scoreAdvantage}
        </span>
      )}
    </div>
  );
};
