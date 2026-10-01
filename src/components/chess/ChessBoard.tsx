import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '../../types/chess';

interface ChessBoardProps {
  chess: Chess;
  onMakeMove: (move: { from: string; to: string; promotion?: string }) => void;
  playerColor: 'w' | 'b' | 'spectator';
  isFlipped: boolean;
  isGameActive: boolean;
  lastMove?: { from: string; to: string };
}

interface PromotionState {
  from: string;
  to: string;
  color: PieceColor;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  onMakeMove,
  playerColor,
  isFlipped,
  isGameActive,
  lastMove
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionState, setPromotionState] = useState<PromotionState | null>(null);

  const board = chess.board(); // 8x8 array of Piece | null
  const turnColor = chess.turn();

  // Find if a King is in check
  const inCheck = chess.isCheck();
  let kingInCheckSquare: string | null = null;

  if (inCheck) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turnColor) {
          kingInCheckSquare = FILES[c] + RANKS[r];
          break;
        }
      }
      if (kingInCheckSquare) break;
    }
  }

  // Calculate legal target squares for current selected piece
  const legalMoves = selectedSquare
    ? chess.moves({ square: selectedSquare, verbose: true })
    : [];

  const legalTargetSquares = new Set(legalMoves.map((m) => m.to));

  // Determine actual display rows and cols based on flip state
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;

  const handleSquareClick = (squareStr: string) => {
    if (!isGameActive) return;
    if (promotionState) return; // Must finish promotion choice first

    const square = squareStr as Square;

    // If we clicked a legal target square for our currently selected piece
    if (selectedSquare && legalTargetSquares.has(square)) {
      const matchMoves = legalMoves.filter((m) => m.to === square);
      if (matchMoves.length === 0) return;

      // Check if it's a promotion move (e.g. pawn reaching rank 8 or 1)
      const isPromotion = matchMoves.some((m) => m.promotion);

      if (isPromotion) {
        // Trigger promotion selector overlay
        const colIdx = FILES.indexOf(selectedSquare[0]);
        const rowIdx = RANKS.indexOf(selectedSquare[1]);
        const activePiece = board[rowIdx][colIdx];

        setPromotionState({
          from: selectedSquare,
          to: square,
          color: activePiece ? activePiece.color : turnColor
        });
        return;
      }

      // Execute normal move
      onMakeMove({ from: selectedSquare, to: square });
      setSelectedSquare(null);
      return;
    }

    // Otherwise, try to select the piece on the clicked square
    const colIdx = FILES.indexOf(square[0]);
    const rowIdx = RANKS.indexOf(square[1]);
    const clickedPiece = board[rowIdx][colIdx];

    // Only allow selecting pieces of the correct turn color AND if player has permission (not spectator or opponent)
    const canSelect = clickedPiece && clickedPiece.color === turnColor && (playerColor === turnColor || playerColor === 'spectator');

    if (canSelect) {
      setSelectedSquare(square === selectedSquare ? null : square);
    } else {
      setSelectedSquare(null);
    }
  };

  const executePromotion = (chosenPiece: 'q' | 'r' | 'b' | 'n') => {
    if (!promotionState) return;
    onMakeMove({
      from: promotionState.from,
      to: promotionState.to,
      promotion: chosenPiece
    });
    setPromotionState(null);
    setSelectedSquare(null);
  };

  return (
    <div className="relative w-full max-w-[500px] lg:max-w-[600px] aspect-square mx-auto select-none rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 flex flex-col justify-center animate-board">
      {/* 8x8 Chess Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank) =>
          displayFiles.map((file) => {
            const squareStr = file + rank;
            const square = squareStr as Square;
            const rowInBoard = RANKS.indexOf(rank);
            const colInBoard = FILES.indexOf(file);
            const piece = board[rowInBoard][colInBoard];

            // Determine if square is light or dark
            const isLightSquare = (rowInBoard + colInBoard) % 2 === 0;
            const isSelected = square === selectedSquare;
            const isLegalTarget = legalTargetSquares.has(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingInCheck = square === kingInCheckSquare;

            // Background styling
            let bgClass = isLightSquare ? 'bg-[#ebecd0]' : 'bg-[#739552]';
            if (isKingInCheck) {
              bgClass = 'bg-rose-600/90 shadow-inner shadow-rose-950 animate-pulse';
            } else if (isSelected) {
              bgClass = isLightSquare ? 'bg-[#f6f669]' : 'bg-[#b9ca43]';
            } else if (isLastMove) {
              bgClass = isLightSquare ? 'bg-[#f5f682]' : 'bg-[#bacb44]';
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${bgClass}`}
              >
                {/* Coordinates annotations */}
                {file === (displayFiles[0]) && (
                  <span className={`absolute top-1 left-1.5 text-[10px] font-bold ${isLightSquare ? 'text-[#739552]' : 'text-[#ebecd0]'}`}>
                    {rank}
                  </span>
                )}
                {rank === (displayRanks[displayRanks.length - 1]) && (
                  <span className={`absolute bottom-1 right-1.5 text-[10px] font-bold ${isLightSquare ? 'text-[#739552]' : 'text-[#ebecd0]'}`}>
                    {file}
                  </span>
                )}

                {/* Render Chess Piece */}
                {piece && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-1.5 transition-transform duration-200 ${
                      isSelected ? 'scale-110 -translate-y-1 filter drop-shadow-md' : 'hover:scale-105'
                    }`}
                  >
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move indicator overlay */}
                {isLegalTarget && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {piece ? (
                      // Capture target ring
                      <div className="w-full h-full border-4 border-black/20 rounded-full scale-90" />
                    ) : (
                      // Normal target dot
                      <div className="w-3.5 h-3.5 bg-black/20 rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Promotion Choices Modal Overlay */}
      {promotionState && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border-2 border-indigo-500/80 p-5 rounded-2xl shadow-2xl max-w-xs w-full text-center">
            <h3 className="text-sm font-bold text-slate-100 uppercase mb-4 tracking-wider">Escolha a Peça para Promoção</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['q', 'r', 'b', 'n'] as const).map((pType) => (
                <button
                  key={pType}
                  onClick={() => executePromotion(pType)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/60 border border-slate-700 transition-all group"
                >
                  <div className="w-12 h-12 group-hover:scale-110 transition-transform">
                    <ChessPiece type={pType} color={promotionState.color} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-2">
                    {pType === 'q' ? 'Dama' : pType === 'r' ? 'Torre' : pType === 'b' ? 'Bispo' : 'Cavalo'}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setPromotionState(null)}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
