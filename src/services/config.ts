const DEFAULT_SERVER_URL = 'http://localhost:3001';

export function getServerUrl(): string {
  const fromEnv = import.meta.env.VITE_SERVER_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  return DEFAULT_SERVER_URL;
}
