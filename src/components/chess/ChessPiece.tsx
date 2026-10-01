import React from 'react';
import { PieceColor } from '../../types/chess';

interface ChessPieceProps {
  type: string; // 'k', 'q', 'r', 'b', 'n', 'p'
  color: PieceColor; // 'w', 'b'
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  
  // Elegant Staunton style SVGs matching premium platforms
  // White pieces: creamy white fill with crisp dark stroke
  // Black pieces: deep charcoal/black fill with subtle grey stroke/highlights
  const fill = isWhite ? '#FFFFFF' : '#1e293b';
  const stroke = isWhite ? '#0f172a' : '#cbd5e1';
  const strokeWidth = isWhite ? '2' : '1.5';
  const innerFill = isWhite ? '#f8fafc' : '#0f172a';

  const renderPieceSvg = () => {
    switch (type.toLowerCase()) {
      case 'k': // King
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              {/* Cross */}
              <path d="M 22.5,11.63 L 22.5,6" />
              <path d="M 20,8 L 25,8" />
              {/* Crown */}
              <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" fill={innerFill} />
              <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 L 35,18.5 C 33,25 27,25 22.5,25 C 18,25 12,25 10,18.5 L 11.5,37 z" />
              <path d="M 11.5,30 C 17,33 28,33 33.5,30" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
              <path d="M 11.5,33.5 C 17,36.5 28,36.5 33.5,33.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
              <circle cx="22.5" cy="11.5" r="2" />
              <circle cx="10" cy="18.5" r="2" />
              <circle cx="35" cy="18.5" r="2" />
              {/* Base */}
              <path d="M 11.5,37 L 33.5,37 L 38.5,41 L 6.5,41 L 11.5,37 z" />
            </g>
          </svg>
        );

      case 'q': // Queen
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 24.5,11 L 22.5,16 L 20.5,11 L 14,25 L 7,14 L 9,26 z" strokeLinecap="butt" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" strokeLinecap="butt" />
              <path d="M 11.5,30 C 15,29 30,29 33.5,30" fill="none" stroke={stroke} />
              <path d="M 12,33.5 C 16,32.5 29,32.5 33,33.5" fill="none" stroke={stroke} />
              <circle cx="7" cy="14" r="1.5" />
              <circle cx="14" cy="25" r="1.5" />
              <circle cx="20.5" cy="11" r="1.5" />
              <circle cx="24.5" cy="11" r="1.5" />
              <circle cx="31" cy="25" r="1.5" />
              <circle cx="38" cy="14" r="1.5" />
              {/* Base */}
              <path d="M 11,38.5 L 34,38.5 L 38.5,41 L 6.5,41 L 11,38.5 z" />
            </g>
          </svg>
        );

      case 'r': // Rook
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" fill={innerFill} />
              <path d="M 13,32 L 13,16 L 32,16 L 32,32" />
              <path d="M 14,29 C 19,30.5 26,30.5 31,29" fill="none" />
              <path d="M 14,24 C 19,25.5 26,25.5 31,24" fill="none" />
              <path d="M 10,16 L 35,16 L 35,13 L 10,13 L 10,16 z" fill={innerFill} />
              {/* Crenellations */}
              <path d="M 10,13 L 10,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 35,9 L 35,13" />
              {/* Base */}
              <path d="M 9,39 L 36,39 L 40,41 L 5,41 L 9,39 z" />
            </g>
          </svg>
        );

      case 'b': // Bishop
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <g clipPath="url(#bishop-clip)">
                <path d="M 9,36 C 12.3,38 32.7,38 36,36 C 36,36 37,34 36,33 C 35,32 32,31 30,30 C 29,29 29,27 29,26 C 29,24 30,22 30,20 C 30,14 26,10 22.5,10 C 19,10 15,14 15,20 C 15,22 16,24 16,26 C 16,27 16,29 15,30 C 13,31 10,32 9,33 C 8,34 9,36 9,36 z" />
              </g>
              <path d="M 9,36 C 12.3,38 32.7,38 36,36 C 36,36 37,34 36,33 C 35,32 32,31 30,30 C 29,29 29,27 29,26 C 29,24 30,22 30,20 C 30,14 26,10 22.5,10 C 19,10 15,14 15,20 C 15,22 16,24 16,26 C 16,27 16,29 15,30 C 13,31 10,32 9,33 C 8,34 9,36 9,36 z" />
              <circle cx="22.5" cy="8" r="2" />
              <path d="M 22.5,14 L 22.5,18" fill="none" />
              <path d="M 20.5,16 L 24.5,16" fill="none" />
              <path d="M 12,33.5 C 16,32.5 29,32.5 33,33.5" fill="none" stroke={stroke} />
              <path d="M 11,36 L 34,36 L 38.5,41 L 6.5,41 L 11,36 z" />
            </g>
          </svg>
        );

      case 'n': // Knight
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22,10 C 32.5,11 35,22 33,36 C 22,35 15,36 12,36 C 11,34 11,30 12,27 C 13,24 16,22 16,19 C 16,16 14,14 11,14 C 9,14 8,14 8,16 C 8,13.5 11.5,8 16,8 C 19,8 20.5,9.5 22,10 z" />
              {/* Eye */}
              <circle cx="16" cy="13" r="1.2" fill={isWhite ? '#0f172a' : '#cbd5e1'} stroke="none" />
              <path d="M 23,17 C 25,19 25,23 23,25" fill="none" stroke={stroke} strokeWidth="1" />
              <path d="M 27,20 C 29,22 29,26 27,28" fill="none" stroke={stroke} strokeWidth="1" />
              {/* Base */}
              <path d="M 12,36 L 33,36 L 38,41 L 7,41 L 12,36 z" />
            </g>
          </svg>
        );

      case 'p': // Pawn
        return (
          <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,9 C 19.5,9 17.5,11.5 17.5,14.5 C 17.5,17.5 20,20 22.5,20 C 25,20 27.5,17.5 27.5,14.5 C 27.5,11.5 25.5,9 22.5,9 z" />
              <path d="M 18,20 C 18,20 16,22 16,24 C 16,26 20,26 22.5,26 C 25,26 29,26 29,24 C 29,22 27,20 27,20 L 18,20 z" fill={innerFill} />
              <path d="M 18,24 C 15,26 13,32 12,36 L 33,36 C 32,32 30,26 27,24 z" />
              <path d="M 12,36 L 33,36 L 38,41 L 7,41 L 12,36 z" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return <div className="inline-block select-none pointer-events-none w-full h-full p-1">{renderPieceSvg()}</div>;
};
