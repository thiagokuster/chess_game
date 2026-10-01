import React, { useRef, useState } from 'react';
import { ChessAvatar, UserProfile } from '../../types/chess';
import { User, Trophy, Flame, Swords, Check, X, Crown, Shield, ImagePlus, Trash2 } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { processAvatarImageFile } from '../../utils/avatarImage';

interface UserProfileModalProps {
  profile: UserProfile;
  onSave: (input: { name: string; avatar: ChessAvatar; avatarImage: string | null }) => void;
  onClose: () => void;
}

const avatars: ChessAvatar[] = ['king', 'queen', 'knight', 'rook', 'bishop', 'pawn'];

const avatarIcons: Record<ChessAvatar, React.ReactNode> = {
  king: <Crown className="w-8 h-8 text-amber-400" />,
  queen: <Shield className="w-8 h-8 text-purple-400" />,
  knight: <User className="w-8 h-8 text-indigo-400" />,
  rook: <Shield className="w-8 h-8 text-emerald-400" />,
  bishop: <Shield className="w-8 h-8 text-rose-400" />,
  pawn: <User className="w-8 h-8 text-blue-400" />
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState<ChessAvatar>(profile.avatar);
  const [avatarImage, setAvatarImage] = useState<string | null>(profile.avatarImage ?? null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), avatar: selectedAvatar, avatarImage });
      onClose();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await processAvatarImageFile(file);
      setAvatarImage(dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao carregar imagem.');
    }
  };

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--rc-overlay)] backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="bg-[var(--rc-surface)] border border-[var(--rc-border)] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[var(--rc-text-muted)] hover:text-[var(--rc-text)] bg-[var(--rc-surface-muted)] hover:opacity-90 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <AvatarDisplay
            avatar={selectedAvatar}
            avatarImage={avatarImage}
            className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10"
          />
          <div>
            <h2 className="text-xl font-bold text-[var(--rc-text)] tracking-tight">Seu Perfil de Jogador</h2>
            <p className="text-xs text-[var(--rc-text-muted)]">Nickname, avatar ou foto personalizada</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[var(--rc-surface-muted)] border border-[var(--rc-border)] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="text-xs font-semibold">Elo</span>
            </div>
            <span className="font-mono text-xl font-black text-[var(--rc-text)]">{profile.rating}</span>
          </div>
          <div className="bg-[var(--rc-surface-muted)] border border-[var(--rc-border)] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-indigo-400 mb-1">
              <Swords className="w-4 h-4 mr-1" />
              <span className="text-xs font-semibold">Partidas</span>
            </div>
            <span className="font-mono text-xl font-black text-[var(--rc-text)]">{profile.gamesPlayed}</span>
          </div>
          <div className="bg-[var(--rc-surface-muted)] border border-[var(--rc-border)] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Flame className="w-4 h-4 mr-1" />
              <span className="text-xs font-semibold">Vitórias</span>
            </div>
            <span className="font-mono text-xl font-black text-emerald-500">{profile.wins}</span>
          </div>
          <div className="bg-[var(--rc-surface-muted)] border border-[var(--rc-border)] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center text-blue-400 mb-1">
              <span className="text-xs font-semibold">Vitórias %</span>
            </div>
            <span className="font-mono text-xl font-black text-blue-500">{winRate}%</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[var(--rc-text)] uppercase tracking-wider mb-2">
              Nickname (Nome na Sala)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              maxLength={24}
              className="w-full bg-[var(--rc-input)] border border-[var(--rc-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--rc-text)] placeholder:text-[var(--rc-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--rc-text)] uppercase tracking-wider mb-2">
              Foto personalizada (opcional)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                <ImagePlus className="w-4 h-4" />
                Enviar imagem
              </button>
              {avatarImage && (
                <button
                  type="button"
                  onClick={() => setAvatarImage(null)}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--rc-surface-muted)] text-[var(--rc-text-muted)] text-xs font-semibold border border-[var(--rc-border)]"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover foto
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            <p className="text-[10px] text-[var(--rc-text-muted)] mt-2">JPEG, PNG ou WebP — até 2 MB. Fica salvo só no seu navegador.</p>
            {uploadError && <p className="text-xs text-rose-500 mt-1">{uploadError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--rc-text)] uppercase tracking-wider mb-2">
              Ícones de avatar (se não usar foto)
            </label>
            <div className="grid grid-cols-6 gap-3">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`relative aspect-square rounded-2xl border flex items-center justify-center transition-all ${
                    selectedAvatar === av && !avatarImage
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20 scale-105'
                      : 'bg-[var(--rc-input)] border-[var(--rc-border)] hover:opacity-100 opacity-70'
                  }`}
                >
                  {avatarIcons[av]}
                  {selectedAvatar === av && !avatarImage && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-[var(--rc-surface-muted)] hover:opacity-90 text-[var(--rc-text-muted)] text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
