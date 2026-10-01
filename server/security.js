const MAX_CHAT_LENGTH = 500;
const MAX_PLAYER_NAME_LENGTH = 24;
const MAX_AVATAR_IMAGE_LENGTH = 80_000;

export function sanitizePlayerName(name) {
  if (typeof name !== 'string') return 'Jogador';
  const trimmed = name.trim().slice(0, MAX_PLAYER_NAME_LENGTH);
  return trimmed || 'Jogador';
}

export function sanitizeAvatarImage(value) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  if (value.length > MAX_AVATAR_IMAGE_LENGTH) return null;
  if (!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) return null;
  return value;
}

export function sanitizeChatText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, MAX_CHAT_LENGTH);
}

export function getPlayerColorBySocket(room, socketId) {
  if (room.players.w?.socketId === socketId || room.players.w?.id === socketId) return 'w';
  if (room.players.b?.socketId === socketId || room.players.b?.id === socketId) return 'b';
  return null;
}

export function playerControlsSocket(player, socketId) {
  if (!player) return false;
  return player.socketId === socketId || player.id === socketId;
}

export function getOpponentColor(color) {
  return color === 'w' ? 'b' : 'w';
}

export function resolveChatSenderName(room, socketId) {
  const color = getPlayerColorBySocket(room, socketId);
  if (color && room.players[color]?.name) return room.players[color].name;
  const spec = room.spectators?.find((s) => s.id === socketId);
  if (spec?.name) return spec.name;
  return 'Espectador';
}

export function isBotPlayerId(id) {
  return typeof id === 'string' && id.startsWith('bot_engine_');
}

export function sanitizeIncomingPlayer(player) {
  if (!player || typeof player !== 'object') {
    return { name: 'Jogador', rating: 1200, avatar: 'king', avatarImage: null };
  }
  const rating = Number(player.rating);
  return {
    id: typeof player.id === 'string' ? player.id.slice(0, 128) : undefined,
    name: sanitizePlayerName(player.name),
    rating: Number.isFinite(rating) ? Math.min(4000, Math.max(100, Math.round(rating))) : 1200,
    avatar: typeof player.avatar === 'string' ? player.avatar.slice(0, 16) : 'king',
    avatarImage: sanitizeAvatarImage(player.avatarImage)
  };
}
