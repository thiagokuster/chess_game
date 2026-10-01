import React from 'react';
import { ChessAvatar } from '../../types/chess';
import { User, Shield, Crown } from 'lucide-react';
import { isSafeAvatarDataUrl } from '../../utils/avatarImage';

const avatarMap: Record<ChessAvatar, React.ReactNode> = {
  king: <Crown className="w-full h-full p-2 text-amber-400" />,
  queen: <Shield className="w-full h-full p-2 text-purple-400" />,
  knight: <User className="w-full h-full p-2 text-indigo-400" />,
  rook: <Shield className="w-full h-full p-2 text-emerald-400" />,
  bishop: <Shield className="w-full h-full p-2 text-rose-400" />,
  pawn: <User className="w-full h-full p-2 text-blue-400" />
};

interface AvatarDisplayProps {
  avatar: ChessAvatar;
  avatarImage?: string | null;
  className?: string;
  imgClassName?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  avatarImage,
  className = 'w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border border-[var(--rc-border)] bg-[var(--rc-surface-muted)]',
  imgClassName = 'w-full h-full object-cover'
}) => {
  if (isSafeAvatarDataUrl(avatarImage)) {
    return (
      <div className={className}>
        <img src={avatarImage} alt="" className={imgClassName} referrerPolicy="no-referrer" />
      </div>
    );
  }

  return <div className={className}>{avatarMap[avatar] || <User className="w-full h-full p-2 text-slate-400" />}</div>;
};
