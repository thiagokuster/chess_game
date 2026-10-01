import { useEffect, useState, useCallback } from 'react';
import { socketService } from './services/socketService';
import { ProfileService } from './services/profileService';
import { BotDifficulty } from './services/aiService';
import { sound } from './services/soundService';
import { ChatMessage, GameMode, PublicRoomInfo, RoomState, TimeControl, PlayerColorPreference, UserProfile } from './types/chess';
import { getServerUrl } from './services/config';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { ActiveRoomView } from './components/chess/ActiveRoomView';
import { useI18n } from './services/i18n';

export default function App() {
  const { t } = useI18n();
  const [currentView, setCurrentView] = useState<'lobby' | 'room'>('lobby');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('online');
  const [myRole, setMyRole] = useState<'w' | 'b' | 'spectator'>('w');
  
  // Bot settings if applicable
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [botColor, setBotColor] = useState<'w' | 'b'>('b');

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.enabled);
  const [publicRooms, setPublicRooms] = useState<PublicRoomInfo[]>([]);
  const [isRealSocketConnected, setIsRealSocketConnected] = useState<boolean>(false);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
  };

  const buildPlayerFromProfile = (profile: UserProfile) => ({
    id: ProfileService.getOrCreatePlayerId(),
    name: profile.name,
    rating: profile.rating,
    avatar: profile.avatar,
    avatarImage: profile.avatarImage ?? null
  });

  // Socket setup and callback registration
  useEffect(() => {
    socketService.setUrl(getServerUrl());
    socketService.registerCallbacks({
      onGameState: (newState: RoomState) => {
        setRoomState(newState);
      },
      onChatMessage: (msg: ChatMessage) => {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          sound.notify();
          return [...prev, msg];
        });
      },
      onGameOver: () => {
        sound.victory();
      },
      onTimersUpdate: (updatedTimers) => {
        setRoomState((prev) => {
          if (!prev) return null;
          return { ...prev, timers: updatedTimers };
        });
      }
    });

    socketService.connect();

    // Check actual real connection
    const interval = setInterval(() => {
      setIsRealSocketConnected(socketService.isRealSocketConnected);
    }, 1000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  // Refresh active public open rooms
  const handleRefreshRooms = useCallback(() => {
    if (socketService.isRealSocketConnected) {
      fetch(`${getServerUrl()}/api/rooms`)
        .then((res) => res.json())
        .then((data) => setPublicRooms(data))
        .catch(() => setPublicRooms([]));
    }
  }, []);

  useEffect(() => {
    handleRefreshRooms();
  }, [handleRefreshRooms]);

  // --- Start Mode Actions ---

  const handleStartOnlineRoom = (config: { timeControl: TimeControl; preferredColor: PlayerColorPreference }) => {
    const myPlayer = buildPlayerFromProfile(ProfileService.getProfile());

    socketService.createRoom(myPlayer, config, (res) => {
      if (res.success && res.roomCode) {
        sound.notify();
        setGameMode('online');
        // Let role be assigned by first state emission or guess
        let colorAssigned: 'w' | 'b' = config.preferredColor === 'random' ? 'w' : (config.preferredColor || 'w');
        setMyRole(colorAssigned);
        setChatMessages([]);
        setCurrentView('room');
      } else {
        alert(`${t('roomCreateError')}: ${res.error}`);
      }
    });
  };

  const handleJoinRoom = (roomCode: string) => {
    const myPlayer = buildPlayerFromProfile(ProfileService.getProfile());

    socketService.joinRoom(roomCode, myPlayer, (res) => {
      if (res.success && res.roomCode) {
        sound.notify();
        setGameMode('online');
        setMyRole((res.role as 'w' | 'b' | 'spectator') || 'spectator');
        setChatMessages([]);
        setCurrentView('room');
      } else {
        alert(`${t('roomJoinError')}: ${res.error}`);
      }
    });
  };

  const handleStartBotGame = (difficulty: BotDifficulty, preferredColor: 'w' | 'b' | 'random') => {
    const myProfile = ProfileService.getProfile();
    const myPlayer = {
      id: 'usr_human_' + Date.now(),
      name: myProfile.name,
      rating: myProfile.rating,
      avatar: myProfile.avatar
    };

    let humanColor: 'w' | 'b' = preferredColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : preferredColor;
    const botOpponentColor: 'w' | 'b' = humanColor === 'w' ? 'b' : 'w';

    socketService.createRoom(myPlayer, { timeControl: 10, preferredColor: humanColor }, (res) => {
      if (res.success && res.roomCode) {
        // Automatically join the Bot as player 2
        const botPlayer = {
          id: 'bot_engine_' + difficulty,
          name: `${t('chessEngine')} (${difficulty === 'easy' ? t('beginner') : difficulty === 'medium' ? t('intermediate') : t('difficult')})`,
          rating: difficulty === 'easy' ? 800 : difficulty === 'medium' ? 1500 : 2200,
          avatar: 'knight' as const
        };

        socketService.joinRoom(res.roomCode, botPlayer, (joinRes) => {
          if (joinRes.success) {
            sound.notify();
            setGameMode('bot');
            setMyRole(humanColor);
            setBotColor(botOpponentColor);
            setBotDifficulty(difficulty);
            setChatMessages([]);
            setCurrentView('room');
          }
        });
      }
    });
  };

  const handleStartLocalGame = (timeControl: TimeControl) => {
    const myProfile = ProfileService.getProfile();
    const p1 = {
      id: 'local_p1_' + Date.now(),
      name: `${myProfile.name} (${t('white')})`,
      rating: myProfile.rating,
      avatar: myProfile.avatar
    };

    socketService.createRoom(p1, { timeControl, preferredColor: 'w' }, (res) => {
      if (res.success && res.roomCode) {
        const p2 = {
          id: 'local_p2_' + Date.now(),
          name: `${t('playerTwo')} (${t('black')})`,
          rating: myProfile.rating,
          avatar: 'queen' as const
        };

        socketService.joinRoom(res.roomCode, p2, (joinRes) => {
          if (joinRes.success) {
            sound.notify();
            setGameMode('local');
            setMyRole('w'); // In local mode, we act as white but can flip or make moves freely
            setChatMessages([]);
            setCurrentView('room');
          }
        });
      }
    });
  };

  // --- Active Room Handlers ---

  const handleMakeMove = (move: { from: string; to: string; promotion?: string }) => {
    if (!roomState) return;

    if (gameMode === 'local') {
      // In local mode, we temporarily adopt the ID of whichever player's turn it is so SocketService authorises the move!
      const turnColor = roomState.turn;
      const activeP = roomState.players[turnColor];
      if (activeP) {
        // Proxy move
        socketService.joinRoom(roomState.code, activeP, () => {
          socketService.makeMove(roomState.code, move);
        });
      }
    } else {
      socketService.makeMove(roomState.code, move);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!roomState) return;
    const sender = myRole === 'w' ? roomState.players.w?.name || t('white') : myRole === 'b' ? roomState.players.b?.name || t('black') : t('roleSpectator');
    socketService.sendMessage(roomState.code, text, sender);
  };

  const handleRequestTakeback = () => {
    if (!roomState || myRole === 'spectator') return;
    socketService.requestTakeback(roomState.code, myRole);
  };

  const handleRespondTakeback = (accepted: boolean) => {
    if (!roomState) return;
    socketService.respondTakeback(roomState.code, accepted);
  };

  const handleOfferDraw = () => {
    if (!roomState || myRole === 'spectator') return;
    socketService.offerDraw(roomState.code, myRole);
  };

  const handleRespondDraw = (accepted: boolean) => {
    if (!roomState) return;
    socketService.respondDraw(roomState.code, accepted);
  };

  const handleResign = () => {
    if (!roomState || myRole === 'spectator') return;
    socketService.resignGame(roomState.code, myRole);
  };

  const handleRequestRematch = () => {
    if (!roomState) return;
    socketService.requestRematch(roomState.code);
  };

  const handleLeaveRoom = () => {
    sound.notify();
    setCurrentView('lobby');
    setRoomState(null);
  };

  return (
    <>
      {currentView === 'lobby' ? (
        <LobbyScreen
          onStartOnlineRoom={handleStartOnlineRoom}
          onJoinRoom={handleJoinRoom}
          onStartBotGame={handleStartBotGame}
          onStartLocalGame={handleStartLocalGame}
          publicRooms={publicRooms}
          onRefreshRooms={handleRefreshRooms}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          isRealSocketConnected={isRealSocketConnected}
        />
      ) : roomState ? (
        <ActiveRoomView
          roomState={roomState}
          gameMode={gameMode}
          myRole={myRole}
          onMakeMove={handleMakeMove}
          onSendMessage={handleSendMessage}
          chatMessages={chatMessages}
          onRequestTakeback={handleRequestTakeback}
          onRespondTakeback={handleRespondTakeback}
          onOfferDraw={handleOfferDraw}
          onRespondDraw={handleRespondDraw}
          onResign={handleResign}
          onRequestRematch={handleRequestRematch}
          onLeave={handleLeaveRoom}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          botDifficulty={botDifficulty}
          botColor={botColor}
        />
      ) : (
        <div className="min-h-screen bg-[var(--rc-page)] flex flex-col items-center justify-center text-[var(--rc-text-muted)]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider">{t('loadingRoom')}</p>
        </div>
      )}
    </>
  );
}
