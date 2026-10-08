import { ChessAvatar, UserProfile } from '../types/chess';
import { isSafeAvatarDataUrl } from '../utils/avatarImage';

const PROFILE_STORAGE_KEY = 'royale_chess_user_profile_v1';
const PLAYER_ID_STORAGE_KEY = 'royale_chess_player_id_v1';

export class ProfileService {
  private static defaultProfile(): UserProfile {
    return {
      name: 'Enxadrista_' + Math.floor(100 + Math.random() * 900),
      rating: 1200,
      avatar: 'king',
      avatarImage: null,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  }

  public static getProfile(): UserProfile {
    if (typeof window === 'undefined') return this.defaultProfile();
    try {
      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (data) {
        const parsed = { ...this.defaultProfile(), ...JSON.parse(data) } as UserProfile;
        if (!isSafeAvatarDataUrl(parsed.avatarImage)) {
          parsed.avatarImage = null;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do localStorage', err);
    }
    const def = this.defaultProfile();
    this.saveProfile(def);
    return def;
  }

  public static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      const safe: UserProfile = {
        ...profile,
        avatarImage: isSafeAvatarDataUrl(profile.avatarImage) ? profile.avatarImage : null
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(safe));
    } catch (err) {
      console.warn('Erro ao salvar perfil no localStorage', err);
    }
  }

  /** ID estável para reconexão em partidas online */
  public static getOrCreatePlayerId(): string {
    if (typeof window === 'undefined') {
      return 'usr_' + Date.now();
    }
    try {
      const existing = localStorage.getItem(PLAYER_ID_STORAGE_KEY);
      if (existing && existing.length >= 8 && existing.length <= 128) return existing;
    } catch {
      /* ignore */
    }
    const id = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    try {
      localStorage.setItem(PLAYER_ID_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    return id;
  }

  public static updateProfile(input: {
    name: string;
    avatar: ChessAvatar;
    avatarImage?: string | null;
  }): UserProfile {
    const p = this.getProfile();
    p.name = input.name.trim() || 'Enxadrista';
    p.avatar = input.avatar;
    p.avatarImage = isSafeAvatarDataUrl(input.avatarImage) ? input.avatarImage : null;
    this.saveProfile(p);
    return p;
  }

  /** @deprecated use updateProfile */
  public static updateNameAndAvatar(name: string, avatar: ChessAvatar): UserProfile {
    return this.updateProfile({ name, avatar, avatarImage: this.getProfile().avatarImage });
  }

  public static recordGameResult(result: 'win' | 'loss' | 'draw'): UserProfile {
    const p = this.getProfile();
    p.gamesPlayed += 1;

    if (result === 'win') {
      p.wins += 1;
      p.rating += 24;
    } else if (result === 'loss') {
      p.losses += 1;
      p.rating = Math.max(400, p.rating - 16);
    } else {
      p.draws += 1;
      p.rating += 2;
    }

    this.saveProfile(p);
    return p;
  }
}
