import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export const locales = ['pt-BR', 'en', 'es', 'zh-CN', 'hi', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
    'pt-BR': 'Português',
    en: 'English',
    es: 'Español',
    'zh-CN': '中文',
    hi: 'हिन्दी',
    ar: 'العربية'
};

const messages = {
    language: {
        'pt-BR': 'Idioma', en: 'Language', es: 'Idioma', 'zh-CN': '语言', hi: 'भाषा', ar: 'اللغة'
    },
    connected: {
        'pt-BR': 'Servidor conectado', en: 'Server connected', es: 'Servidor conectado', 'zh-CN': '服务器已连接', hi: 'सर्वर जुड़ा है', ar: 'الخادم متصل'
    },
    localMode: {
        'pt-BR': 'Modo local sincronizado', en: 'Synced local mode', es: 'Modo local sincronizado', 'zh-CN': '本地同步模式', hi: 'स्थानीय सिंक मोड', ar: 'وضع محلي متزامن'
    },
    rules: {
        'pt-BR': 'Regras', en: 'Rules', es: 'Reglas', 'zh-CN': '规则', hi: 'नियम', ar: 'القواعد'
    },
    profile: {
        'pt-BR': 'Perfil do jogador', en: 'Player profile', es: 'Perfil del jugador', 'zh-CN': '玩家资料', hi: 'खिलाड़ी प्रोफ़ाइल', ar: 'ملف اللاعب'
    },
    soundOn: {
        'pt-BR': 'Silenciar som', en: 'Mute sound', es: 'Silenciar sonido', 'zh-CN': '静音', hi: 'ध्वनि बंद करें', ar: 'كتم الصوت'
    },
    soundOff: {
        'pt-BR': 'Ativar som', en: 'Enable sound', es: 'Activar sonido', 'zh-CN': '开启声音', hi: 'ध्वनि चालू करें', ar: 'تشغيل الصوت'
    },
    theme: {
        'pt-BR': 'Tema', en: 'Theme', es: 'Tema', 'zh-CN': '主题', hi: 'थीम', ar: 'المظهر'
    },
    privateRoom: {
        'pt-BR': 'Sala privada', en: 'Private room', es: 'Sala privada', 'zh-CN': '私人房间', hi: 'निजी कमरा', ar: 'غرفة خاصة'
    },
    code: {
        'pt-BR': 'Código:', en: 'Code:', es: 'Código:', 'zh-CN': '代码：', hi: 'कोड:', ar: 'الرمز:'
    },
    copyRoomCode: {
        'pt-BR': 'Copiar código da sala', en: 'Copy room code', es: 'Copiar código de sala', 'zh-CN': '复制房间代码', hi: 'कमरे का कोड कॉपी करें', ar: 'نسخ رمز الغرفة'
    },
    spectators: {
        'pt-BR': 'Espectadores', en: 'Spectators', es: 'Espectadores', 'zh-CN': '观战者', hi: 'दर्शक', ar: 'المتفرجون'
    },
    roleWhite: {
        'pt-BR': 'Você joga de Brancas ♔', en: 'You play White ♔', es: 'Juegas con Blancas ♔', 'zh-CN': '你执白棋 ♔', hi: 'आप सफेद मोहरों से खेलते हैं ♔', ar: 'أنت تلعب بالأبيض ♔'
    },
    roleBlack: {
        'pt-BR': 'Você joga de Pretas ♚', en: 'You play Black ♚', es: 'Juegas con Negras ♚', 'zh-CN': '你执黑棋 ♚', hi: 'आप काले मोहरों से खेलते हैं ♚', ar: 'أنت تلعب بالأسود ♚'
    },
    roleSpectator: {
        'pt-BR': 'Espectador da sala 👁️', en: 'Room spectator 👁️', es: 'Espectador de la sala 👁️', 'zh-CN': '房间观战者 👁️', hi: 'कमरे के दर्शक 👁️', ar: 'مشاهد في الغرفة 👁️'
    },
    platformTag: {
        'pt-BR': 'Plataforma completa de xadrez', en: 'Complete chess platform', es: 'Plataforma completa de ajedrez', 'zh-CN': '完整的国际象棋平台', hi: 'संपूर्ण शतरंज प्लेटफ़ॉर्म', ar: 'منصة شطرنج متكاملة'
    },
    heroTitle: {
        'pt-BR': 'Desafie amigos em tempo real ou jogue contra a IA', en: 'Challenge friends in real time or play against AI', es: 'Desafía a tus amigos en tiempo real o juega contra la IA', 'zh-CN': '实时挑战好友，或与 AI 对弈', hi: 'दोस्तों को रियल-टाइम चुनौती दें या AI के विरुद्ध खेलें', ar: 'تحدَّ أصدقاءك مباشرة أو العب ضد الذكاء الاصطناعي'
    },
    heroDescription: {
        'pt-BR': 'Crie uma sala privada e compartilhe o código de 6 caracteres para jogar xadrez com regras oficiais, roque, en passant e relógio.', en: 'Create a private room and share its 6-character code to play chess with official rules, castling, en passant, and a clock.', es: 'Crea una sala privada y comparte su código de 6 caracteres para jugar al ajedrez con reglas oficiales, enroque, captura al paso y reloj.', 'zh-CN': '创建私人房间并分享 6 位代码，即可按照正式规则对弈，支持王车易位、吃过路兵和计时。', hi: 'नियमित शतरंज, कासलिंग, एन पासां और घड़ी के साथ खेलने के लिए निजी कमरा बनाएँ और 6-अक्षरों का कोड साझा करें।', ar: 'أنشئ غرفة خاصة وشارك رمزها المكوّن من 6 أحرف للعب بقواعد رسمية مع التبييت والأخذ بالتجاوز والساعة.'
    },
    createTab: {
        'pt-BR': 'Criar sala', en: 'Create room', es: 'Crear sala', 'zh-CN': '创建房间', hi: 'कमरा बनाएँ', ar: 'إنشاء غرفة'
    },
    joinTab: {
        'pt-BR': 'Entrar com código', en: 'Join by code', es: 'Entrar con código', 'zh-CN': '输入代码加入', hi: 'कोड से जुड़ें', ar: 'الانضمام بالرمز'
    },
    botTab: {
        'pt-BR': 'Jogar contra IA', en: 'Play against AI', es: 'Jugar contra la IA', 'zh-CN': '与 AI 对弈', hi: 'AI के विरुद्ध खेलें', ar: 'العب ضد الذكاء الاصطناعي'
    },
    localTab: {
        'pt-BR': 'Local (2 jogadores)', en: 'Local (2 players)', es: 'Local (2 jugadores)', 'zh-CN': '本地双人', hi: 'स्थानीय (2 खिलाड़ी)', ar: 'محلي (لاعبان)'
    },
    privateRoomSettings: {
        'pt-BR': 'Configurações da sala privada', en: 'Private room settings', es: 'Ajustes de sala privada', 'zh-CN': '私人房间设置', hi: 'निजी कमरे की सेटिंग', ar: 'إعدادات الغرفة الخاصة'
    },
    createRoomDescription: {
        'pt-BR': 'Gere um código exclusivo para jogar online com seu amigo', en: 'Generate a unique code to play online with a friend', es: 'Genera un código único para jugar en línea con un amigo', 'zh-CN': '生成专属代码，与好友在线对弈', hi: 'दोस्त के साथ ऑनलाइन खेलने के लिए एक विशिष्ट कोड बनाएँ', ar: 'أنشئ رمزًا فريدًا للعب عبر الإنترنت مع صديق'
    },
    twoPlayers: {
        'pt-BR': '2 jogadores', en: '2 players', es: '2 jugadores', 'zh-CN': '2 位玩家', hi: '2 खिलाड़ी', ar: 'لاعبان'
    },
    timeControl: {
        'pt-BR': 'Controle de tempo', en: 'Time control', es: 'Control de tiempo', 'zh-CN': '时间控制', hi: 'समय नियंत्रण', ar: 'التحكم بالوقت'
    },
    playerColor: {
        'pt-BR': 'Sua cor na partida', en: 'Your color', es: 'Tu color', 'zh-CN': '选择棋子颜色', hi: 'आपका रंग', ar: 'لونك في المباراة'
    },
    white: {
        'pt-BR': 'Brancas', en: 'White', es: 'Blancas', 'zh-CN': '白方', hi: 'सफेद', ar: 'الأبيض'
    },
    black: {
        'pt-BR': 'Pretas', en: 'Black', es: 'Negras', 'zh-CN': '黑方', hi: 'काला', ar: 'الأسود'
    },
    random: {
        'pt-BR': 'Aleatório', en: 'Random', es: 'Aleatorio', 'zh-CN': '随机', hi: 'यादृच्छिक', ar: 'عشوائي'
    },
    createRoomAction: {
        'pt-BR': 'Criar sala e gerar código', en: 'Create room and generate code', es: 'Crear sala y generar código', 'zh-CN': '创建房间并生成代码', hi: 'कमरा बनाएँ और कोड प्राप्त करें', ar: 'أنشئ غرفة ورمزًا'
    },
    joinRoomTitle: {
        'pt-BR': 'Entrar em partida com código', en: 'Join a game with a code', es: 'Unirse a una partida con código', 'zh-CN': '使用代码加入对局', hi: 'कोड से खेल में शामिल हों', ar: 'انضم إلى مباراة باستخدام رمز'
    },
    joinRoomDescription: {
        'pt-BR': 'Peça o código de 6 caracteres a quem criou a sala', en: 'Ask the room host for the 6-character code', es: 'Pide el código de 6 caracteres a quien creó la sala', 'zh-CN': '向房主索取 6 位代码', hi: 'कमरा बनाने वाले से 6-अक्षरों का कोड माँगें', ar: 'اطلب الرمز المكوّن من 6 أحرف من منشئ الغرفة'
    },
    roomAccessCode: {
        'pt-BR': 'Código de acesso da sala', en: 'Room access code', es: 'Código de acceso de la sala', 'zh-CN': '房间访问代码', hi: 'कमरे का प्रवेश कोड', ar: 'رمز دخول الغرفة'
    },
    codePlaceholder: {
        'pt-BR': 'Digite o código (Ex: X7K9P2)', en: 'Enter the code (e.g. X7K9P2)', es: 'Escribe el código (ej.: X7K9P2)', 'zh-CN': '输入代码（例如 X7K9P2）', hi: 'कोड दर्ज करें (जैसे X7K9P2)', ar: 'أدخل الرمز (مثال: X7K9P2)'
    },
    invalidRoomCode: {
        'pt-BR': 'Digite um código de sala válido (Ex: X7K9P2)', en: 'Enter a valid room code (e.g. X7K9P2)', es: 'Introduce un código de sala válido (ej.: X7K9P2)', 'zh-CN': '请输入有效的房间代码（例如 X7K9P2）', hi: 'मान्य कमरा कोड दर्ज करें (जैसे X7K9P2)', ar: 'أدخل رمز غرفة صالحًا (مثال: X7K9P2)'
    },
    joinMatch: {
        'pt-BR': 'Entrar na partida', en: 'Join game', es: 'Entrar en la partida', 'zh-CN': '加入对局', hi: 'खेल में शामिल हों', ar: 'انضم إلى المباراة'
    },
    botTitle: {
        'pt-BR': 'Partida solo contra o computador', en: 'Single-player game against the computer', es: 'Partida individual contra el ordenador', 'zh-CN': '与电脑进行单人对局', hi: 'कंप्यूटर के विरुद्ध एकल खेल', ar: 'مباراة فردية ضد الكمبيوتر'
    },
    botDescription: {
        'pt-BR': 'Treine aberturas e estratégias contra nossa IA integrada', en: 'Practice openings and strategies against the built-in AI', es: 'Practica aperturas y estrategias contra nuestra IA integrada', 'zh-CN': '与内置 AI 练习开局和策略', hi: 'अंतर्निहित AI के विरुद्ध ओपनिंग और रणनीति का अभ्यास करें', ar: 'تدرّب على الافتتاحيات والاستراتيجيات ضد الذكاء الاصطناعي المدمج'
    },
    aiDifficulty: {
        'pt-BR': 'Nível de dificuldade da IA', en: 'AI difficulty', es: 'Dificultad de la IA', 'zh-CN': 'AI 难度', hi: 'AI कठिनाई', ar: 'مستوى صعوبة الذكاء الاصطناعي'
    },
    beginner: {
        'pt-BR': '🌱 Iniciante (Nível 1)', en: '🌱 Beginner (Level 1)', es: '🌱 Principiante (nivel 1)', 'zh-CN': '🌱 入门（等级 1）', hi: '🌱 शुरुआती (स्तर 1)', ar: '🌱 مبتدئ (المستوى 1)'
    },
    intermediate: {
        'pt-BR': '⚔️ Intermediário (Nível 2)', en: '⚔️ Intermediate (Level 2)', es: '⚔️ Intermedio (nivel 2)', 'zh-CN': '⚔️ 中级（等级 2）', hi: '⚔️ मध्यम (स्तर 2)', ar: '⚔️ متوسط (المستوى 2)'
    },
    difficult: {
        'pt-BR': '🔥 Difícil (Nível 3)', en: '🔥 Hard (Level 3)', es: '🔥 Difícil (nivel 3)', 'zh-CN': '🔥 困难（等级 3）', hi: '🔥 कठिन (स्तर 3)', ar: '🔥 صعب (المستوى 3)'
    },
    startBotGame: {
        'pt-BR': 'Iniciar partida contra a IA', en: 'Start game against AI', es: 'Iniciar partida contra la IA', 'zh-CN': '开始与 AI 对弈', hi: 'AI के विरुद्ध खेल शुरू करें', ar: 'ابدأ مباراة ضد الذكاء الاصطناعي'
    },
    localGameTitle: {
        'pt-BR': 'Modo local (2 jogadores na mesma tela)', en: 'Local mode (2 players on one screen)', es: 'Modo local (2 jugadores en la misma pantalla)', 'zh-CN': '本地模式（同屏双人）', hi: 'स्थानीय मोड (एक स्क्रीन पर 2 खिलाड़ी)', ar: 'الوضع المحلي (لاعبان على الشاشة نفسها)'
    },
    localGameDescription: {
        'pt-BR': 'Jogue presencialmente no mesmo computador, tablet ou celular', en: 'Play together on the same computer, tablet, or phone', es: 'Juega en el mismo ordenador, tableta o móvil', 'zh-CN': '在同一台电脑、平板或手机上面对面对弈', hi: 'एक ही कंप्यूटर, टैबलेट या फ़ोन पर साथ खेलें', ar: 'العبا معًا على الكمبيوتر أو الجهاز اللوحي أو الهاتف نفسه'
    },
    globalTimeControl: {
        'pt-BR': 'Controle de tempo total', en: 'Total time control', es: 'Control de tiempo total', 'zh-CN': '总时间控制', hi: 'कुल समय नियंत्रण', ar: 'إجمالي وقت المباراة'
    },
    startLocalGame: {
        'pt-BR': 'Iniciar partida presencial', en: 'Start local game', es: 'Iniciar partida local', 'zh-CN': '开始本地对局', hi: 'स्थानीय खेल शुरू करें', ar: 'ابدأ مباراة محلية'
    },
    noTime: {
        'pt-BR': 'Sem tempo', en: 'No clock', es: 'Sin reloj', 'zh-CN': '不限时', hi: 'बिना घड़ी', ar: 'بلا وقت'
    },
    oneMinuteBullet: {
        'pt-BR': '1m Bullet', en: '1 min Bullet', es: '1 min Bullet', 'zh-CN': '1 分钟 Bullet', hi: '1 मिनट बुलेट', ar: '1 دقيقة Bullet'
    },
    threeMinuteBlitz: {
        'pt-BR': '3m Blitz', en: '3 min Blitz', es: '3 min Blitz', 'zh-CN': '3 分钟 Blitz', hi: '3 मिनट ब्लिट्ज़', ar: '3 دقائق Blitz'
    },
    fiveMinuteBlitz: {
        'pt-BR': '5m Blitz', en: '5 min Blitz', es: '5 min Blitz', 'zh-CN': '5 分钟 Blitz', hi: '5 मिनट ब्लिट्ज़', ar: '5 دقائق Blitz'
    },
    tenMinuteRapid: {
        'pt-BR': '10m Rápido', en: '10 min Rapid', es: '10 min Rápido', 'zh-CN': '10 分钟快棋', hi: '10 मिनट रैपिड', ar: '10 دقائق سريع'
    },
    fifteenMinuteRapid: {
        'pt-BR': '15m Rápido', en: '15 min Rapid', es: '15 min Rápido', 'zh-CN': '15 分钟快棋', hi: '15 मिनट रैपिड', ar: '15 دقيقة سريع'
    },
    thirtyMinuteClassical: {
        'pt-BR': '30m Clássico', en: '30 min Classical', es: '30 min Clásico', 'zh-CN': '30 分钟慢棋', hi: '30 मिनट क्लासिकल', ar: '30 دقيقة كلاسيكي'
    },
    publicRooms: {
        'pt-BR': 'Salas públicas aguardando', en: 'Public rooms waiting', es: 'Salas públicas en espera', 'zh-CN': '等待中的公开房间', hi: 'प्रतीक्षा कर रहे सार्वजनिक कमरे', ar: 'الغرف العامة المنتظرة'
    },
    refresh: {
        'pt-BR': '↻ Atualizar', en: '↻ Refresh', es: '↻ Actualizar', 'zh-CN': '↻ 刷新', hi: '↻ रीफ़्रेश', ar: '↻ تحديث'
    },
    noPublicRooms: {
        'pt-BR': 'Nenhuma sala pública aberta no momento.', en: 'No public rooms are open right now.', es: 'No hay salas públicas abiertas ahora.', 'zh-CN': '目前没有开放的公开房间。', hi: 'अभी कोई सार्वजनिक कमरा खुला नहीं है।', ar: 'لا توجد غرف عامة مفتوحة حاليًا.'
    },
    inviteFriends: {
        'pt-BR': 'Crie uma sala online e convide amigos!', en: 'Create an online room and invite friends!', es: '¡Crea una sala en línea e invita a tus amigos!', 'zh-CN': '创建在线房间并邀请好友！', hi: 'ऑनलाइन कमरा बनाएँ और दोस्तों को आमंत्रित करें!', ar: 'أنشئ غرفة عبر الإنترنت وادعُ أصدقاءك!'
    },
    play: {
        'pt-BR': 'Jogar', en: 'Play', es: 'Jugar', 'zh-CN': '对弈', hi: 'खेलें', ar: 'العب'
    },
    playerSummary: {
        'pt-BR': 'Resumo do jogador', en: 'Player summary', es: 'Resumen del jugador', 'zh-CN': '玩家概况', hi: 'खिलाड़ी सारांश', ar: 'ملخص اللاعب'
    },
    winsLossesDraws: {
        'pt-BR': 'Vitórias / derrotas / empates', en: 'Wins / losses / draws', es: 'Victorias / derrotas / tablas', 'zh-CN': '胜 / 负 / 和', hi: 'जीत / हार / ड्रॉ', ar: 'فوز / خسارة / تعادل'
    },
    ratingLabel: {
        'pt-BR': 'Classificação Elo', en: 'Elo rating', es: 'Clasificación Elo', 'zh-CN': 'Elo 等级分', hi: 'एलो रेटिंग', ar: 'تصنيف إيلو'
    },
    totalGames: {
        'pt-BR': 'Total de partidas disputadas', en: 'Games played', es: 'Partidas disputadas', 'zh-CN': '已进行的对局', hi: 'खेले गए कुल खेल', ar: 'إجمالي المباريات'
    },
    games: {
        'pt-BR': 'partidas', en: 'games', es: 'partidas', 'zh-CN': '局', hi: 'खेल', ar: 'مباريات'
    },
    tip: {
        'pt-BR': 'Dica:', en: 'Tip:', es: 'Consejo:', 'zh-CN': '提示：', hi: 'सुझाव:', ar: 'نصيحة:'
    },
    localMultiplayerTip: {
        'pt-BR': 'Abra duas janelas do navegador lado a lado para testar uma partida usando o mesmo código.', en: 'Open two browser windows side by side to try a game with the same room code.', es: 'Abre dos ventanas del navegador para probar una partida con el mismo código.', 'zh-CN': '并排打开两个浏览器窗口，使用同一房间代码测试对局。', hi: 'एक ही कमरे के कोड से खेल आज़माने के लिए ब्राउज़र की दो विंडो खोलें।', ar: 'افتح نافذتين للمتصفح جنبًا إلى جنب لتجربة مباراة باستخدام رمز الغرفة نفسه.'
    },
    footer: {
        'pt-BR': 'Desenvolvido com React, Tailwind CSS e Socket.IO • Regras oficiais completas', en: 'Built with React, Tailwind CSS, and Socket.IO • Full official chess rules', es: 'Creado con React, Tailwind CSS y Socket.IO • Reglas oficiales completas', 'zh-CN': '基于 React、Tailwind CSS 和 Socket.IO 构建 • 完整支持国际象棋规则', hi: 'React, Tailwind CSS और Socket.IO से निर्मित • शतरंज के सभी आधिकारिक नियम', ar: 'مبني باستخدام React وTailwind CSS وSocket.IO • قواعد شطرنج رسمية كاملة'
    },
    waitingSecondPlayer: {
        'pt-BR': 'Aguardando o segundo jogador', en: 'Waiting for the second player', es: 'Esperando al segundo jugador', 'zh-CN': '等待第二位玩家', hi: 'दूसरे खिलाड़ी की प्रतीक्षा है', ar: 'بانتظار اللاعب الثاني'
    },
    shareRoomCode: {
        'pt-BR': 'Envie o código {code} para seu amigo entrar na partida.', en: 'Send code {code} to your friend so they can join the game.', es: 'Envía el código {code} a tu amigo para que se una a la partida.', 'zh-CN': '将代码 {code} 发给好友以加入对局。', hi: 'खेल में शामिल होने के लिए अपने दोस्त को कोड {code} भेजें।', ar: 'أرسل الرمز {code} إلى صديقك لينضم إلى المباراة.'
    },
    copyMatchCode: {
        'pt-BR': 'Copiar código da partida', en: 'Copy game code', es: 'Copiar código de partida', 'zh-CN': '复制对局代码', hi: 'खेल का कोड कॉपी करें', ar: 'نسخ رمز المباراة'
    },
    disconnectedAlert: {
        'pt-BR': '{color} desconectaram. Aguardando reconexão (60s)...', en: '{color} disconnected. Waiting for reconnection (60s)...', es: '{color} se desconectaron. Esperando la reconexión (60 s)...', 'zh-CN': '{color}已断开连接，等待重新连接（60 秒）……', hi: '{color} डिस्कनेक्ट हो गए। फिर से जुड़ने की प्रतीक्षा (60 सेकंड)...', ar: 'انقطع اتصال {color}. بانتظار إعادة الاتصال (60 ثانية)...'
    },
    opponentTakeback: {
        'pt-BR': 'Seu oponente pediu para desfazer o último lance.', en: 'Your opponent asked to take back the last move.', es: 'Tu oponente pidió deshacer el último movimiento.', 'zh-CN': '对手请求悔棋。', hi: 'आपके प्रतिद्वंद्वी ने पिछली चाल वापस लेने का अनुरोध किया।', ar: 'طلب خصمك التراجع عن النقلة الأخيرة.'
    },
    accept: {
        'pt-BR': 'Aceitar', en: 'Accept', es: 'Aceptar', 'zh-CN': '接受', hi: 'स्वीकार करें', ar: 'قبول'
    },
    decline: {
        'pt-BR': 'Recusar', en: 'Decline', es: 'Rechazar', 'zh-CN': '拒绝', hi: 'अस्वीकार करें', ar: 'رفض'
    },
    opponentDraw: {
        'pt-BR': 'Seu oponente propôs empate.', en: 'Your opponent offered a draw.', es: 'Tu oponente ofreció tablas.', 'zh-CN': '对手提议和棋。', hi: 'आपके प्रतिद्वंद्वी ने ड्रॉ का प्रस्ताव दिया।', ar: 'عرض خصمك التعادل.'
    },
    acceptDraw: {
        'pt-BR': 'Aceitar empate', en: 'Accept draw', es: 'Aceptar tablas', 'zh-CN': '接受和棋', hi: 'ड्रॉ स्वीकार करें', ar: 'قبول التعادل'
    },
    continueGame: {
        'pt-BR': 'Continuar jogo', en: 'Continue game', es: 'Continuar partida', 'zh-CN': '继续对局', hi: 'खेल जारी रखें', ar: 'متابعة اللعب'
    },
    moveHistory: {
        'pt-BR': 'Histórico de lances', en: 'Move history', es: 'Historial de movimientos', 'zh-CN': '棋谱记录', hi: 'चालों का इतिहास', ar: 'سجل النقلات'
    },
    move: {
        'pt-BR': 'lance', en: 'move', es: 'movimiento', 'zh-CN': '步', hi: 'चाल', ar: 'نقلة'
    },
    moves: {
        'pt-BR': 'lances', en: 'moves', es: 'movimientos', 'zh-CN': '步', hi: 'चालें', ar: 'نقلات'
    },
    noMoves: {
        'pt-BR': 'Nenhum lance ainda', en: 'No moves yet', es: 'Aún no hay movimientos', 'zh-CN': '暂无棋步', hi: 'अभी कोई चाल नहीं', ar: 'لا توجد نقلات بعد'
    },
    matchChat: {
        'pt-BR': 'Chat da partida', en: 'Game chat', es: 'Chat de la partida', 'zh-CN': '对局聊天', hi: 'खेल चैट', ar: 'دردشة المباراة'
    },
    emptyChat: {
        'pt-BR': 'Envie uma mensagem ou "gg!"', en: 'Send a message or "gg!"', es: 'Envía un mensaje o "gg!"', 'zh-CN': '发送消息或说声“gg！”', hi: 'संदेश भेजें या "gg!" कहें', ar: 'أرسل رسالة أو قل "gg!"'
    },
    quick: {
        'pt-BR': 'Rápido:', en: 'Quick:', es: 'Rápido:', 'zh-CN': '快捷：', hi: 'त्वरित:', ar: 'سريع:'
    },
    quickReactions: {
        'pt-BR': 'Reações rápidas', en: 'Quick reactions', es: 'Reacciones rápidas', 'zh-CN': '快捷回应', hi: 'त्वरित प्रतिक्रियाएँ', ar: 'تفاعلات سريعة'
    },
    chatPlaceholder: {
        'pt-BR': 'Diga algo ao adversário...', en: 'Say something to your opponent...', es: 'Di algo a tu oponente...', 'zh-CN': '对对手说点什么……', hi: 'अपने प्रतिद्वंद्वी से कुछ कहें...', ar: 'قل شيئًا لخصمك...'
    },
    undoMove: {
        'pt-BR': 'Desfazer', en: 'Take back', es: 'Deshacer', 'zh-CN': '悔棋', hi: 'चाल वापस लें', ar: 'تراجع'
    },
    undoTitle: {
        'pt-BR': 'Solicitar para voltar o último lance', en: 'Request to take back the last move', es: 'Solicitar deshacer el último movimiento', 'zh-CN': '请求悔棋', hi: 'पिछली चाल वापस लेने का अनुरोध करें', ar: 'طلب التراجع عن النقلة الأخيرة'
    },
    draw: {
        'pt-BR': 'Empate', en: 'Draw', es: 'Tablas', 'zh-CN': '和棋', hi: 'ड्रॉ', ar: 'تعادل'
    },
    offerDrawTitle: {
        'pt-BR': 'Oferecer empate', en: 'Offer a draw', es: 'Ofrecer tablas', 'zh-CN': '提议和棋', hi: 'ड्रॉ का प्रस्ताव दें', ar: 'عرض التعادل'
    },
    resign: {
        'pt-BR': 'Desistir', en: 'Resign', es: 'Abandonar', 'zh-CN': '认输', hi: 'हार मानें', ar: 'استسلم'
    },
    resignTitle: {
        'pt-BR': 'Desistir da partida', en: 'Resign from the game', es: 'Abandonar la partida', 'zh-CN': '认输并结束对局', hi: 'खेल से हार मानें', ar: 'الاستسلام في المباراة'
    },
    confirm: {
        'pt-BR': 'Confirmar', en: 'Confirm', es: 'Confirmar', 'zh-CN': '确认', hi: 'पुष्टि करें', ar: 'تأكيد'
    },
    cancel: {
        'pt-BR': 'Cancelar', en: 'Cancel', es: 'Cancelar', 'zh-CN': '取消', hi: 'रद्द करें', ar: 'إلغاء'
    },
    flipBoard: {
        'pt-BR': 'Inverter tabuleiro', en: 'Flip board', es: 'Girar tablero', 'zh-CN': '翻转棋盘', hi: 'बोर्ड पलटें', ar: 'اقلب الرقعة'
    },
    lobby: {
        'pt-BR': 'Lobby', en: 'Lobby', es: 'Sala', 'zh-CN': '大厅', hi: 'लॉबी', ar: 'الردهة'
    },
    soundEffects: {
        'pt-BR': 'Efeitos sonoros', en: 'Sound effects', es: 'Efectos de sonido', 'zh-CN': '音效', hi: 'ध्वनि प्रभाव', ar: 'المؤثرات الصوتية'
    },
    waitingForColor: {
        'pt-BR': 'Aguardando {color}...', en: 'Waiting for {color}...', es: 'Esperando a {color}...', 'zh-CN': '正在等待{color}……', hi: '{color} की प्रतीक्षा है...', ar: 'بانتظار {color}...'
    },
    online: {
        'pt-BR': 'Online', en: 'Online', es: 'En línea', 'zh-CN': '在线', hi: 'ऑनलाइन', ar: 'متصل'
    },
    disconnected: {
        'pt-BR': 'Desconectado', en: 'Disconnected', es: 'Desconectado', 'zh-CN': '已断开', hi: 'डिस्कनेक्ट', ar: 'غير متصل'
    },
    checkmateResult: {
        'pt-BR': 'Xeque-mate! {color} venceram!', en: 'Checkmate! {color} win!', es: '¡Jaque mate! ¡Ganan las {color}!', 'zh-CN': '将死！{color}获胜！', hi: 'शह-मात! {color} जीते!', ar: 'كش مات! فاز {color}!'
    },
    stalemateResult: {
        'pt-BR': 'Empate por afogamento (stalemate).', en: 'Draw by stalemate.', es: 'Tablas por ahogado.', 'zh-CN': '僵局和棋。', hi: 'स्टेलमेट से ड्रॉ।', ar: 'تعادل بسبب الجمود.'
    },
    repetitionResult: {
        'pt-BR': 'Empate por repetição tripla.', en: 'Draw by threefold repetition.', es: 'Tablas por triple repetición.', 'zh-CN': '三次重复局面和棋。', hi: 'तीन बार स्थिति दोहरने से ड्रॉ।', ar: 'تعادل بسبب تكرار الوضعية ثلاث مرات.'
    },
    insufficientResult: {
        'pt-BR': 'Empate por material insuficiente.', en: 'Draw due to insufficient material.', es: 'Tablas por material insuficiente.', 'zh-CN': '因棋子不足和棋。', hi: 'अपर्याप्त सामग्री के कारण ड्रॉ।', ar: 'تعادل بسبب عدم كفاية القطع.'
    },
    fiftyMoveResult: {
        'pt-BR': 'Empate pela regra dos 50 lances.', en: 'Draw by the 50-move rule.', es: 'Tablas por la regla de los 50 movimientos.', 'zh-CN': '依据五十回合规则和棋。', hi: '50-चाल नियम से ड्रॉ।', ar: 'تعادل وفق قاعدة الخمسين نقلة.'
    },
    timeoutResult: {
        'pt-BR': 'Tempo esgotado! {color} vencem.', en: 'Time is up! {color} win.', es: '¡Se acabó el tiempo! Ganan las {color}.', 'zh-CN': '超时！{color}获胜。', hi: 'समय समाप्त! {color} जीते।', ar: 'انتهى الوقت! فاز {color}.'
    },
    resignationResult: {
        'pt-BR': '{color} venceram por desistência.', en: '{color} win by resignation.', es: 'Las {color} ganan por abandono.', 'zh-CN': '{color}因对手认输获胜。', hi: 'प्रतिद्वंद्वी के हार मानने से {color} जीते।', ar: 'فاز {color} بسبب الاستسلام.'
    },
    agreedDrawResult: {
        'pt-BR': 'Empate por acordo entre os jogadores.', en: 'Draw by agreement.', es: 'Tablas por acuerdo.', 'zh-CN': '双方同意和棋。', hi: 'आपसी सहमति से ड्रॉ।', ar: 'تعادل بالاتفاق.'
    },
    abandonmentResult: {
        'pt-BR': '{color} venceram por abandono do adversário.', en: '{color} win by opponent abandonment.', es: 'Las {color} ganan por abandono del rival.', 'zh-CN': '对手弃赛，{color}获胜。', hi: 'प्रतिद्वंद्वी के खेल छोड़ने से {color} जीते।', ar: 'فاز {color} بسبب انسحاب الخصم.'
    },
    gameDrawn: {
        'pt-BR': 'Partida empatada', en: 'Game drawn', es: 'Partida empatada', 'zh-CN': '对局和棋', hi: 'खेल ड्रॉ', ar: 'تعادل المباراة'
    },
    youWon: {
        'pt-BR': 'Você venceu!', en: 'You won!', es: '¡Ganaste!', 'zh-CN': '你赢了！', hi: 'आप जीत गए!', ar: 'لقد فزت!'
    },
    winnerColor: {
        'pt-BR': 'Vitória das {color}', en: '{color} win', es: 'Victoria de las {color}', 'zh-CN': '{color}获胜', hi: '{color} की जीत', ar: 'فوز {color}'
    },
    youLost: {
        'pt-BR': 'Você perdeu', en: 'You lost', es: 'Perdiste', 'zh-CN': '你输了', hi: 'आप हार गए', ar: 'لقد خسرت'
    },
    rematch: {
        'pt-BR': 'Propor revanche', en: 'Request rematch', es: 'Pedir revancha', 'zh-CN': '请求再战', hi: 'रीमैच का अनुरोध करें', ar: 'اطلب مباراة جديدة'
    },
    downloadPgn: {
        'pt-BR': 'Baixar PGN', en: 'Download PGN', es: 'Descargar PGN', 'zh-CN': '下载 PGN', hi: 'PGN डाउनलोड करें', ar: 'تنزيل PGN'
    },
    backToLobby: {
        'pt-BR': 'Ir ao lobby', en: 'Back to lobby', es: 'Volver a la sala', 'zh-CN': '返回大厅', hi: 'लॉबी पर लौटें', ar: 'العودة إلى الردهة'
    },
    promotePiece: {
        'pt-BR': 'Escolha a peça para promoção', en: 'Choose a piece for promotion', es: 'Elige una pieza para la promoción', 'zh-CN': '选择升变棋子', hi: 'प्रमोशन के लिए मोहरा चुनें', ar: 'اختر قطعة للترقية'
    },
    queen: {
        'pt-BR': 'Dama', en: 'Queen', es: 'Dama', 'zh-CN': '后', hi: 'वज़ीर', ar: 'وزير'
    },
    rook: {
        'pt-BR': 'Torre', en: 'Rook', es: 'Torre', 'zh-CN': '车', hi: 'हाथी', ar: 'قلعة'
    },
    bishop: {
        'pt-BR': 'Bispo', en: 'Bishop', es: 'Alfil', 'zh-CN': '象', hi: 'ऊँट', ar: 'فيل'
    },
    knight: {
        'pt-BR': 'Cavalo', en: 'Knight', es: 'Caballo', 'zh-CN': '马', hi: 'घोड़ा', ar: 'حصان'
    },
    themeChange: {
        'pt-BR': 'Alterar tema', en: 'Change theme', es: 'Cambiar tema', 'zh-CN': '切换主题', hi: 'थीम बदलें', ar: 'تغيير المظهر'
    },
    pageTitle: {
        'pt-BR': 'Royale Chess — Xadrez online', en: 'Royale Chess — Online Chess', es: 'Royale Chess — Ajedrez en línea', 'zh-CN': 'Royale Chess — 在线国际象棋', hi: 'Royale Chess — ऑनलाइन शतरंज', ar: 'Royale Chess — شطرنج عبر الإنترنت'
    },
    matchFinished: {
        'pt-BR': 'Partida encerrada.', en: 'Game over.', es: 'Partida finalizada.', 'zh-CN': '对局结束。', hi: 'खेल समाप्त।', ar: 'انتهت المباراة.'
    },
    instructionsTitle: {
        'pt-BR': 'Instruções e regras', en: 'Instructions and rules', es: 'Instrucciones y reglas', 'zh-CN': '说明与规则', hi: 'निर्देश और नियम', ar: 'التعليمات والقواعد'
    },
    instructionsSubtitle: {
        'pt-BR': 'Como funciona o Royale Chess Multiplayer', en: 'How Royale Chess Multiplayer works', es: 'Cómo funciona Royale Chess Multiplayer', 'zh-CN': 'Royale Chess Multiplayer 使用说明', hi: 'Royale Chess Multiplayer कैसे काम करता है', ar: 'كيفية لعب Royale Chess Multiplayer'
    },
    createJoinInstructions: {
        'pt-BR': '1. Criar ou entrar em salas', en: '1. Create or join rooms', es: '1. Crear o unirse a salas', 'zh-CN': '1. 创建或加入房间', hi: '1. कमरे बनाएँ या उनमें शामिल हों', ar: '1. إنشاء الغرف أو الانضمام إليها'
    },
    createRoomInstructions: {
        'pt-BR': 'Criar sala: clique em "Criar sala", escolha a cor e o tempo. Um código exclusivo será gerado.', en: 'Create a room: select "Create room", choose your color and time control. A unique code will be generated.', es: 'Crear sala: pulsa "Crear sala", elige el color y el tiempo. Se generará un código único.', 'zh-CN': '创建房间：点击“创建房间”，选择棋子颜色和时间，将生成专属代码。', hi: 'कमरा बनाएँ: "कमरा बनाएँ" चुनें, रंग और समय चुनें। एक विशिष्ट कोड बनेगा।', ar: 'إنشاء غرفة: اختر "إنشاء غرفة" وحدد اللون والوقت. سيتم إنشاء رمز فريد.'
    },
    joinRoomInstructions: {
        'pt-BR': 'Entrar com código: compartilhe o código com seu amigo. Ele deve digitá-lo no lobby para entrar.', en: 'Join by code: share the code with a friend. They can enter it in the lobby to join.', es: 'Unirse con código: comparte el código con tu amigo para que lo introduzca en la sala.', 'zh-CN': '使用代码加入：将代码分享给好友，由好友在大厅输入代码加入。', hi: 'कोड से जुड़ें: कोड दोस्त के साथ साझा करें ताकि वह लॉबी में इसे दर्ज कर सके।', ar: 'الانضمام بالرمز: شارك الرمز مع صديقك ليُدخله في الردهة.'
    },
    chessRules: {
        'pt-BR': '2. Regras oficiais de xadrez', en: '2. Official chess rules', es: '2. Reglas oficiales de ajedrez', 'zh-CN': '2. 国际象棋正式规则', hi: '2. शतरंज के आधिकारिक नियम', ar: '2. قواعد الشطرنج الرسمية'
    },
    castlingInstructions: {
        'pt-BR': 'Roque: mova o rei duas casas em direção à torre. O caminho deve estar livre e nenhuma das peças pode ter se movido antes.', en: 'Castling: move the king two squares toward a rook. The path must be clear, and neither piece may have moved before.', es: 'Enroque: mueve el rey dos casillas hacia una torre. El camino debe estar libre y ninguna pieza debe haberse movido.', 'zh-CN': '王车易位：将王朝车的方向移动两格。路径必须畅通，且王和车此前都未移动。', hi: 'कासलिंग: राजा को हाथी की ओर दो खाने चलाएँ। रास्ता खाली हो और दोनों मोहरे पहले न चले हों।', ar: 'التبييت: حرّك الملك مربعين باتجاه القلعة. يجب أن يكون الطريق خاليًا وألا يكون أي منهما قد تحرك من قبل.'
    },
    enPassantInstructions: {
        'pt-BR': 'En passant: capture especial disponível logo após o peão adversário avançar duas casas e parar ao lado do seu peão.', en: 'En passant: a special capture available immediately after an opposing pawn moves two squares beside your pawn.', es: 'Captura al paso: captura especial disponible justo después de que un peón rival avance dos casillas junto al tuyo.', 'zh-CN': '吃过路兵：对方兵向前走两格并停在你的兵旁边后，可立即进行的特殊吃子。', hi: 'एन पासां: विरोधी का प्यादा दो खाने चलकर आपके प्यादे के पास आए तो तुरंत की जा सकने वाली विशेष चाल।', ar: 'الأخذ بالتجاوز: أسر خاص متاح مباشرة بعد تقدم بيدق الخصم مربعين بجوار بيدقك.'
    },
    promotionInstructions: {
        'pt-BR': 'Promoção: ao chegar à última fileira, escolha dama, torre, bispo ou cavalo.', en: 'Promotion: when a pawn reaches the last rank, choose a queen, rook, bishop, or knight.', es: 'Promoción: al llegar a la última fila, elige dama, torre, alfil o caballo.', 'zh-CN': '升变：兵到达底线时，可选择升变为后、车、象或马。', hi: 'प्रमोशन: अंतिम पंक्ति तक पहुँचने पर वज़ीर, हाथी, ऊँट या घोड़ा चुनें।', ar: 'الترقية: عند وصول البيدق إلى الصف الأخير، اختر وزيرًا أو قلعة أو فيلًا أو حصانًا.'
    },
    drawTools: {
        'pt-BR': '3. Empates e ferramentas', en: '3. Draws and tools', es: '3. Tablas y herramientas', 'zh-CN': '3. 和棋与工具', hi: '3. ड्रॉ और उपकरण', ar: '3. التعادلات والأدوات'
    },
    takebackInstructions: {
        'pt-BR': 'Desfazer lance: envie uma solicitação ao oponente. O lance só será desfeito se ele aceitar.', en: 'Take back a move: send a request to your opponent. The move is undone only if they accept.', es: 'Deshacer: solicita a tu oponente deshacer el movimiento. Solo se revertirá si acepta.', 'zh-CN': '悔棋：向对手发送请求，对手接受后才会撤销棋步。', hi: 'चाल वापस लें: प्रतिद्वंद्वी को अनुरोध भेजें। उसकी स्वीकृति के बाद ही चाल वापस होगी।', ar: 'التراجع عن نقلة: أرسل طلبًا إلى خصمك. لن يتم التراجع إلا بعد موافقته.'
    },
    drawRulesInstructions: {
        'pt-BR': 'Empates automáticos: o jogo detecta afogamento, repetição tripla, regra dos 50 lances e material insuficiente. Você também pode propor empate.', en: 'Automatic draws: the game detects stalemate, threefold repetition, the 50-move rule, and insufficient material. You can also offer a draw.', es: 'Tablas automáticas: se detectan ahogado, triple repetición, regla de 50 movimientos y material insuficiente. También puedes ofrecer tablas.', 'zh-CN': '自动和棋：支持逼和、三次重复局面、五十回合规则和棋子不足。你也可以主动提议和棋。', hi: 'स्वचालित ड्रॉ: स्टेलमेट, तीन बार दोहराव, 50-चाल नियम और अपर्याप्त सामग्री का पता चलता है। आप ड्रॉ का प्रस्ताव भी दे सकते हैं।', ar: 'التعادل التلقائي: تُكتشف حالات الجمود وتكرار الوضعية ثلاث مرات وقاعدة الخمسين نقلة وعدم كفاية القطع. يمكنك أيضًا عرض التعادل.'
    },
    reconnectTitle: {
        'pt-BR': '4. Reconexão e desconexão', en: '4. Reconnection and disconnection', es: '4. Reconexión y desconexión', 'zh-CN': '4. 重新连接与断线', hi: '4. फिर से जुड़ना और डिस्कनेक्ट होना', ar: '4. إعادة الاتصال والانقطاع'
    },
    reconnectBody: {
        'pt-BR': 'Se um jogador cair da conexão, há 60 segundos para voltar antes que o adversário vença por abandono.', en: 'If a player disconnects, they have 60 seconds to return before their opponent wins by abandonment.', es: 'Si un jugador pierde la conexión, tiene 60 segundos para volver antes de que el rival gane por abandono.', 'zh-CN': '玩家断线后有 60 秒时间重新加入，否则对手将因弃赛获胜。', hi: 'खिलाड़ी डिस्कनेक्ट हो तो प्रतिद्वंद्वी के वॉकओवर से जीतने से पहले लौटने के लिए 60 सेकंड मिलते हैं।', ar: 'عند انقطاع لاعب، لديه 60 ثانية للعودة قبل فوز الخصم بالانسحاب.'
    },
    gotItPlay: {
        'pt-BR': 'Entendi, vamos jogar!', en: 'Got it, let’s play!', es: 'Entendido, ¡a jugar!', 'zh-CN': '知道了，开始对弈！', hi: 'समझ गया, खेलें!', ar: 'فهمت، لنلعب!'
    },
    profileTitle: {
        'pt-BR': 'Seu perfil de jogador', en: 'Your player profile', es: 'Tu perfil de jugador', 'zh-CN': '玩家资料', hi: 'आपकी खिलाड़ी प्रोफ़ाइल', ar: 'ملفك الشخصي للاعب'
    },
    profileSubtitle: {
        'pt-BR': 'Nickname, avatar ou foto personalizada', en: 'Nickname, avatar, or custom photo', es: 'Apodo, avatar o foto personalizada', 'zh-CN': '昵称、头像或自定义照片', hi: 'उपनाम, अवतार या कस्टम फ़ोटो', ar: 'الاسم المستعار أو الصورة الرمزية أو صورة مخصصة'
    },
    gamesPlayed: {
        'pt-BR': 'Partidas', en: 'Games', es: 'Partidas', 'zh-CN': '对局', hi: 'खेल', ar: 'المباريات'
    },
    wins: {
        'pt-BR': 'Vitórias', en: 'Wins', es: 'Victorias', 'zh-CN': '胜场', hi: 'जीत', ar: 'انتصارات'
    },
    winRate: {
        'pt-BR': 'Vitórias %', en: 'Win rate', es: '% de victorias', 'zh-CN': '胜率', hi: 'जीत प्रतिशत', ar: 'نسبة الفوز'
    },
    nicknameLabel: {
        'pt-BR': 'Nickname (nome na sala)', en: 'Nickname (room name)', es: 'Apodo (nombre en la sala)', 'zh-CN': '昵称（房间名称）', hi: 'उपनाम (कमरे में नाम)', ar: 'الاسم المستعار (اسم الغرفة)'
    },
    namePlaceholder: {
        'pt-BR': 'Digite seu nome...', en: 'Enter your name...', es: 'Escribe tu nombre...', 'zh-CN': '输入你的名字……', hi: 'अपना नाम दर्ज करें...', ar: 'أدخل اسمك...'
    },
    customPhoto: {
        'pt-BR': 'Foto personalizada (opcional)', en: 'Custom photo (optional)', es: 'Foto personalizada (opcional)', 'zh-CN': '自定义照片（可选）', hi: 'कस्टम फ़ोटो (वैकल्पिक)', ar: 'صورة مخصصة (اختياري)'
    },
    uploadImage: {
        'pt-BR': 'Enviar imagem', en: 'Upload image', es: 'Subir imagen', 'zh-CN': '上传图片', hi: 'छवि अपलोड करें', ar: 'تحميل صورة'
    },
    removePhoto: {
        'pt-BR': 'Remover foto', en: 'Remove photo', es: 'Quitar foto', 'zh-CN': '移除照片', hi: 'फ़ोटो हटाएँ', ar: 'إزالة الصورة'
    },
    imageLimit: {
        'pt-BR': 'JPEG, PNG ou WebP — até 2 MB. Salva apenas no seu navegador.', en: 'JPEG, PNG, or WebP — up to 2 MB. Stored only in your browser.', es: 'JPEG, PNG o WebP — hasta 2 MB. Solo se guarda en tu navegador.', 'zh-CN': 'JPEG、PNG 或 WebP，最大 2 MB。仅保存在你的浏览器中。', hi: 'JPEG, PNG या WebP — अधिकतम 2 MB। केवल आपके ब्राउज़र में सहेजी जाएगी।', ar: 'JPEG أو PNG أو WebP — حتى 2 ميغابايت. تُحفظ في متصفحك فقط.'
    },
    imageUploadError: {
        'pt-BR': 'Não foi possível carregar a imagem.', en: 'Could not upload the image.', es: 'No se pudo cargar la imagen.', 'zh-CN': '无法上传图片。', hi: 'छवि अपलोड नहीं हो सकी।', ar: 'تعذر تحميل الصورة.'
    },
    roomCreateError: {
        'pt-BR': 'Erro ao criar sala', en: 'Could not create room', es: 'Error al crear la sala', 'zh-CN': '创建房间失败', hi: 'कमरा नहीं बनाया जा सका', ar: 'تعذر إنشاء الغرفة'
    },
    roomJoinError: {
        'pt-BR': 'Erro ao entrar na sala', en: 'Could not join room', es: 'Error al entrar en la sala', 'zh-CN': '加入房间失败', hi: 'कमरे में शामिल नहीं हो सके', ar: 'تعذر الانضمام إلى الغرفة'
    },
    loadingRoom: {
        'pt-BR': 'Carregando sala de xadrez...', en: 'Loading chess room...', es: 'Cargando sala de ajedrez...', 'zh-CN': '正在加载棋室……', hi: 'शतरंज का कमरा लोड हो रहा है...', ar: 'جارٍ تحميل غرفة الشطرنج...'
    },
    chessEngine: {
        'pt-BR': 'Engine de xadrez', en: 'Chess engine', es: 'Motor de ajedrez', 'zh-CN': '国际象棋引擎', hi: 'शतरंज इंजन', ar: 'محرك الشطرنج'
    },
    playerTwo: {
        'pt-BR': 'Jogador 2', en: 'Player 2', es: 'Jugador 2', 'zh-CN': '玩家 2', hi: 'खिलाड़ी 2', ar: 'اللاعب 2'
    },
    winsShort: {
        'pt-BR': 'V', en: 'W', es: 'V', 'zh-CN': '胜', hi: 'जी', ar: 'ف'
    },
    lossesShort: {
        'pt-BR': 'D', en: 'L', es: 'D', 'zh-CN': '负', hi: 'हा', ar: 'خ'
    },
    drawsShort: {
        'pt-BR': 'E', en: 'D', es: 'T', 'zh-CN': '和', hi: 'ड्रॉ', ar: 'ت'
    },
    joinedRoom: {
        'pt-BR': '{name} entrou na partida.', en: '{name} joined the game.', es: '{name} se unió a la partida.', 'zh-CN': '{name}加入了对局。', hi: '{name} खेल में शामिल हुए।', ar: 'انضم {name} إلى المباراة.'
    },
    reconnectedRoom: {
        'pt-BR': '{name} reconectou-se à partida.', en: '{name} reconnected to the game.', es: '{name} se reconectó a la partida.', 'zh-CN': '{name}重新连接到对局。', hi: '{name} फिर से खेल से जुड़ गए।', ar: 'أعاد {name} الاتصال بالمباراة.'
    },
    takebackRequestedBy: {
        'pt-BR': '{color} solicitaram para desfazer o último lance.', en: '{color} requested to take back the last move.', es: '{color} solicitaron deshacer el último movimiento.', 'zh-CN': '{color}请求悔棋。', hi: '{color} ने पिछली चाल वापस लेने का अनुरोध किया।', ar: 'طلب {color} التراجع عن النقلة الأخيرة.'
    },
    takebackAccepted: {
        'pt-BR': 'O pedido para desfazer o lance foi aceito.', en: 'The takeback request was accepted.', es: 'Se aceptó la solicitud para deshacer.', 'zh-CN': '悔棋请求已接受。', hi: 'चाल वापस लेने का अनुरोध स्वीकार किया गया।', ar: 'تم قبول طلب التراجع عن النقلة.'
    },
    takebackDeclined: {
        'pt-BR': 'O pedido para desfazer o lance foi recusado.', en: 'The takeback request was declined.', es: 'Se rechazó la solicitud para deshacer.', 'zh-CN': '悔棋请求已拒绝。', hi: 'चाल वापस लेने का अनुरोध अस्वीकार किया गया।', ar: 'تم رفض طلب التراجع عن النقلة.'
    },
    drawOfferedBy: {
        'pt-BR': '{color} ofereceram empate.', en: '{color} offered a draw.', es: '{color} ofrecieron tablas.', 'zh-CN': '{color}提议和棋。', hi: '{color} ने ड्रॉ का प्रस्ताव दिया।', ar: 'عرض {color} التعادل.'
    },
    drawOfferAccepted: {
        'pt-BR': 'A oferta de empate foi aceita.', en: 'The draw offer was accepted.', es: 'Se aceptó la oferta de tablas.', 'zh-CN': '和棋提议已接受。', hi: 'ड्रॉ का प्रस्ताव स्वीकार किया गया।', ar: 'تم قبول عرض التعادل.'
    },
    drawOfferDeclined: {
        'pt-BR': 'A oferta de empate foi recusada.', en: 'The draw offer was declined.', es: 'Se rechazó la oferta de tablas.', 'zh-CN': '和棋提议已拒绝。', hi: 'ड्रॉ का प्रस्ताव अस्वीकार किया गया।', ar: 'تم رفض عرض التعادل.'
    },
    rematchRequestedBy: {
        'pt-BR': '{color} propuseram revanche. Aguardando o oponente.', en: '{color} requested a rematch. Waiting for the opponent.', es: '{color} pidieron revancha. Esperando al oponente.', 'zh-CN': '{color}请求再战，正在等待对手。', hi: '{color} ने रीमैच का अनुरोध किया। प्रतिद्वंद्वी की प्रतीक्षा है।', ar: 'طلب {color} مباراة جديدة. بانتظار الخصم.'
    },
    rematchStarted: {
        'pt-BR': 'Revanche aceita! As cores foram invertidas. Boa partida!', en: 'Rematch accepted! Colors switched. Good game!', es: '¡Revancha aceptada! Se intercambiaron los colores. ¡Buena partida!', 'zh-CN': '再战已接受！双方交换棋子颜色，祝对弈愉快！', hi: 'रीमैच स्वीकार हुआ! रंग बदल गए। खेल का आनंद लें!', ar: 'قُبلت المباراة الجديدة! تم تبديل الألوان. مباراة موفقة!'
    },
    avatarIcons: {
        'pt-BR': 'Ícones de avatar (se não usar foto)', en: 'Avatar icons (if not using a photo)', es: 'Iconos de avatar (si no usas foto)', 'zh-CN': '头像图标（未使用照片时）', hi: 'अवतार आइकन (फ़ोटो न होने पर)', ar: 'أيقونات الصورة الرمزية (إن لم تستخدم صورة)'
    },
    saveChanges: {
        'pt-BR': 'Salvar alterações', en: 'Save changes', es: 'Guardar cambios', 'zh-CN': '保存更改', hi: 'बदलाव सहेजें', ar: 'حفظ التغييرات'
    }
} as const;

export type TranslationKey = keyof typeof messages;

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const getSavedLocale = (): Locale => {
    try {
        const saved = window.localStorage.getItem('royale-chess-language');
        if (saved && locales.includes(saved as Locale)) return saved as Locale;
    } catch {
        // Storage may be unavailable in private browsing contexts.
    }
    return 'pt-BR';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>(getSavedLocale);

    useEffect(() => {
        try {
            window.localStorage.setItem('royale-chess-language', locale);
        } catch {
            // Keep the selected language for the current session if storage is unavailable.
        }
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        document.title = messages.pageTitle[locale];
    }, [locale]);

    const t = (key: TranslationKey) => messages[key][locale] ?? messages[key]['pt-BR'];

    return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
};