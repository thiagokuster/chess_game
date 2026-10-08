import React, { useState } from 'react';
import { BotDifficulty } from '../../services/aiService';
import { ProfileService } from '../../services/profileService';
import { ChessAvatar, PlayerColorPreference, PublicRoomInfo, TimeControl, UserProfile } from '../../types/chess';
import { InstructionsModal } from '../common/InstructionsModal';
import { UserProfileModal } from '../common/UserProfileModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { useI18n } from '../../services/i18n';
import { Trophy, Swords, Bot, Users, Sparkles, HelpCircle, Volume2, VolumeX, ArrowRight, Play, Globe, Shield, Clock } from 'lucide-react';

interface LobbyScreenProps {
  onStartOnlineRoom: (config: { timeControl: TimeControl; preferredColor: PlayerColorPreference }) => void;
  onJoinRoom: (roomCode: string) => void;
  onStartBotGame: (difficulty: BotDifficulty, playerColor: 'w' | 'b' | 'random') => void;
  onStartLocalGame: (timeControl: TimeControl) => void;
  publicRooms: PublicRoomInfo[];
  onRefreshRooms: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isRealSocketConnected: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onStartOnlineRoom,
  onJoinRoom,
  onStartBotGame,
  onStartLocalGame,
  publicRooms,
  onRefreshRooms,
  soundEnabled,
  onToggleSound,
  isRealSocketConnected
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'bot' | 'local'>('create');
  const [profile, setProfile] = useState<UserProfile>(() => ProfileService.getProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Form states for Create Room
  const [timeControl, setTimeControl] = useState<TimeControl>(10);
  const [preferredColor, setPreferredColor] = useState<PlayerColorPreference>('random');

  // Form state for Join Room
  const [inputCode, setInputCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Form state for Bot Game
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [botColor, setBotColor] = useState<'w' | 'b' | 'random'>('w');

  const handleUpdateProfile = (input: { name: string; avatar: ChessAvatar; avatarImage: string | null }) => {
    const updated = ProfileService.updateProfile(input);
    setProfile(updated);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code || code.length < 5) {
      setJoinError(t('invalidRoomCode'));
      return;
    }
    setJoinError('');
    onJoinRoom(code);
  };

  const formatTimeControlLabel = (tc: TimeControl) => {
    if (tc === 0) return t('noTime');
    if (tc === 1) return t('oneMinuteBullet');
    if (tc === 3) return t('threeMinuteBlitz');
    if (tc === 5) return t('fiveMinuteBlitz');
    if (tc === 10) return t('tenMinuteRapid');
    if (tc === 15) return t('fifteenMinuteRapid');
    return t('thirtyMinuteClassical');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--rc-page)] text-[var(--rc-text)] select-none">
      <header className="sticky top-0 z-40 bg-[var(--rc-page)]/90 backdrop-blur-md border-b border-[var(--rc-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl tracking-tighter">
            ♛
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Royale Chess
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium">
              <span className={`w-2 h-2 rounded-full ${isRealSocketConnected ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`} />
              <span>{isRealSocketConnected ? t('connected') : t('localMode')}</span>
            </div>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs font-semibold"
            title={t('rules')}
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">{t('rules')}</span>
          </button>

          <LanguageSelector />
          <ThemeToggle />

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[var(--rc-surface)] hover:opacity-90 text-[var(--rc-text-muted)] hover:text-[var(--rc-text)] border border-[var(--rc-border)] transition-all"
            title={soundEnabled ? t('soundOn') : t('soundOff')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-[var(--rc-text-muted)]" />}
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl bg-[var(--rc-surface)] hover:opacity-95 border border-[var(--rc-border)] transition-all shadow-sm active:scale-98"
            title={t('profile')}
          >
            <AvatarDisplay
              avatar={profile.avatar}
              avatarImage={profile.avatarImage}
              className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10"
              imgClassName="w-full h-full object-cover"
            />
            <div className="text-left hidden sm:block">
              <div className="font-bold text-xs text-[var(--rc-text)] max-w-[100px] truncate">{profile.name}</div>
              <div className="font-mono text-[10px] text-amber-400 font-semibold">Elo {profile.rating}</div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Mode Launcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
            <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{t('platformTag')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {t('heroTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>

          {/* Navigation Tabs for Launcher */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-98'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Swords className="w-4 h-4" />
              <span>{t('createTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-98'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t('joinTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('bot')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'bot'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-98'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Bot className="w-4 h-4" />
              <span>{t('botTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'local'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-98'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('localTab')}</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl transition-all">
            {/* TAB 1: CREATE ROOM */}
            {activeTab === 'create' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">{t('privateRoomSettings')}</h3>
                    <p className="text-xs text-slate-400">{t('createRoomDescription')}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
                    {t('twoPlayers')}
                  </div>
                </div>

                {/* Time Control Options */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{t('timeControl')}</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {([1, 3, 5, 10, 15, 30, 0] as TimeControl[]).map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setTimeControl(tc)}
                        className={`py-2.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all ${timeControl === tc
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        {formatTimeControlLabel(tc)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Preferences */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{t('playerColor')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['w', 'b', 'random'] as const).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setPreferredColor(col)}
                        className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all ${preferredColor === col
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <span className="text-lg">{col === 'w' ? '♔' : col === 'b' ? '♚' : '🎲'}</span>
                        <span>{col === 'w' ? t('white') : col === 'b' ? t('black') : t('random')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Action Button */}
                <button
                  type="button"
                  onClick={() => onStartOnlineRoom({ timeControl, preferredColor })}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/25 transition-all transform active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t('createRoomAction')}</span>
                </button>
              </div>
            )}

            {/* TAB 2: JOIN ROOM */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinSubmit} className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">{t('joinRoomTitle')}</h3>
                  <p className="text-xs text-slate-400">{t('joinRoomDescription')}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {t('roomAccessCode')}
                  </label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder={t('codePlaceholder')}
                    maxLength={10}
                    className="w-full bg-slate-950 border-2 border-slate-700 font-mono text-center text-xl sm:text-2xl tracking-widest font-extrabold uppercase rounded-2xl px-6 py-4 text-amber-400 placeholder:text-slate-600 placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                  {joinError && <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center gap-1">⚠️ {joinError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/25 transition-all transform active:scale-98"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>{t('joinMatch')}</span>
                </button>
              </form>
            )}

            {/* TAB 3: PLAY VS BOT */}
            {activeTab === 'bot' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">{t('botTitle')}</h3>
                  <p className="text-xs text-slate-400">{t('botDescription')}</p>
                </div>

                {/* Difficulty options */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span>{t('aiDifficulty')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setBotDifficulty(diff)}
                        className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all ${botDifficulty === diff
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        {diff === 'easy' ? t('beginner') : diff === 'medium' ? t('intermediate') : t('difficult')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Color */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>{t('playerColor')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['w', 'b', 'random'] as const).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setBotColor(col)}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all ${botColor === col
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <span className="text-lg">{col === 'w' ? '♔' : col === 'b' ? '♚' : '🎲'}</span>
                        <span>{col === 'w' ? t('white') : col === 'b' ? t('black') : t('random')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartBotGame(botDifficulty, botColor)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/25 transition-all transform active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t('startBotGame')}</span>
                </button>
              </div>
            )}

            {/* TAB 4: PASS & PLAY LOCAL */}
            {activeTab === 'local' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">{t('localGameTitle')}</h3>
                  <p className="text-xs text-slate-400">{t('localGameDescription')}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{t('globalTimeControl')}</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {([1, 3, 5, 10, 15, 30, 0] as TimeControl[]).map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setTimeControl(tc)}
                        className={`py-2.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all ${timeControl === tc
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-102'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        {formatTimeControlLabel(tc)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartLocalGame(timeControl)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/25 transition-all transform active:scale-98"
                >
                  <Users className="w-5 h-5" />
                  <span>{t('startLocalGame')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Public Open Rooms / Player Hub Dashboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Public Open Rooms List */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm">{t('publicRooms')}</h3>
              </div>
              <button
                onClick={onRefreshRooms}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {t('refresh')}
              </button>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {publicRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                  <span className="text-2xl mb-2">🌐</span>
                  <p className="text-xs font-medium">{t('noPublicRooms')}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{t('inviteFriends')}</p>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <div
                    key={room.code}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white max-w-[120px] truncate">{room.host}</span>
                        <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-semibold">
                          Elo {room.hostRating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{t('code')} <strong className="font-mono text-indigo-300">{room.code}</strong></span>
                        <span>•</span>
                        <span>{formatTimeControlLabel(room.timeControl as TimeControl)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onJoinRoom(room.code)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 opacity-90 group-hover:opacity-100 transition-all transform active:scale-95"
                    >
                      {t('play')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Player Mini Stats Card */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('playerSummary')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">{t('winsLossesDraws')}</span>
                <span className="font-mono font-black text-slate-200">
                  <span className="text-emerald-400">{profile.wins}{t('winsShort')}</span> / <span className="text-rose-400">{profile.losses}{t('lossesShort')}</span> / <span className="text-amber-400">{profile.draws}{t('drawsShort')}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">{t('ratingLabel')}</span>
                <span className="font-mono font-black text-amber-400 text-sm">{profile.rating} pts</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">{t('totalGames')}</span>
                <span className="font-mono font-black text-indigo-300">{profile.gamesPlayed} {t('games')}</span>
              </div>
            </div>
          </div>

          {/* Embed test badge / instructions */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="leading-relaxed">
              <strong>{t('tip')}</strong> {t('localMultiplayerTip')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800/80 text-center text-xs text-slate-500 font-medium">
        <p>Royale Chess • {t('footer')}</p>
      </footer>

      {/* Modal Dialogs */}
      {showProfileModal && (
        <UserProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showInstructionsModal && <InstructionsModal onClose={() => setShowInstructionsModal(false)} />}
    </div>
  );
};
