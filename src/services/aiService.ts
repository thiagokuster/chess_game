import { Chess } from 'chess.js';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

// Piece valuation
const pieceValues: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 1000
};

// Simplified Piece-Square Tables for positional bonuses (centered focus)
const pawnTable = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5,  5,  5,  5,  5,  5,  5,  5,
  1,  1,  2,  3,  3,  2,  1,  1,
  0.5,  0.5,  1,  2.5,  2.5,  1,  0.5,  0.5,
  0,  0,  1,  2,  2,  1,  0,  0,
  0.5, -0.5, -1,  0,  0, -1, -0.5,  0.5,
  0.5,  1,  1,  -2, -2,  1,  1,  0.5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const knightTable = [
  -5, -4, -3, -3, -3, -3, -4, -5,
  -4, -2,  0,  0,  0,  0, -2, -4,
  -3,  0,  1,  1.5, 1.5,  1,  0, -3,
  -3,  0.5, 1.5, 2, 2, 1.5, 0.5, -3,
  -3,  0,  1.5, 2, 2, 1.5,  0, -3,
  -3,  0.5,  1,  1.5, 1.5,  1,  0.5, -3,
  -4, -2,  0,  0.5, 0.5,  0, -2, -4,
  -5, -4, -3, -3, -3, -3, -4, -5
];

export class AIService {
  private static evaluateBoard(chess: Chess): number {
    let totalEvaluation = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = pieceValues[piece.type] || 0;
          let posVal = 0;

          // Positional value based on color
          const squareIndex = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
          if (piece.type === 'p') posVal = pawnTable[squareIndex];
          else if (piece.type === 'n') posVal = knightTable[squareIndex];

          const absoluteValue = val + posVal;
          totalEvaluation += piece.color === 'w' ? absoluteValue : -absoluteValue;
        }
      }
    }
    return totalEvaluation;
  }

  private static minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingPlayer: boolean
  ): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluateBoard(chess);
    }

    const moves = chess.moves({ verbose: true });

    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = this.minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  public static getBestMove(chess: Chess, difficulty: BotDifficulty): { from: string; to: string; promotion?: string } | null {
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    // Easy: Random move or basic capture
    if (difficulty === 'easy') {
      // Find if there's any capture
      const captureMoves = legalMoves.filter(m => m.captured);
      if (captureMoves.length > 0 && Math.random() < 0.6) {
        const m = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        return { from: m.from, to: m.to, promotion: m.promotion };
      }
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
    }

    // Medium: 2-ply Minimax
    // Hard: 3-ply Minimax
    const depth = difficulty === 'hard' ? 3 : 2;
    const isMaximizing = chess.turn() === 'w';

    let bestMove = legalMoves[0];
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Shuffle moves slightly to prevent playing the exact same game every time
    const shuffledMoves = [...legalMoves].sort(() => Math.random() - 0.5);

    for (const move of shuffledMoves) {
      chess.move(move);
      const val = this.minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
      chess.undo();

      if (isMaximizing) {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
  }
}
