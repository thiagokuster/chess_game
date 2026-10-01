export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'royale_chess_theme_v1';

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.classList.toggle('light', resolved === 'light');
}

export class ThemeService {
  public static getPreference(): ThemePreference {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {
      /* ignore */
    }
    return 'dark';
  }

  public static setPreference(preference: ThemePreference): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, preference);
      } catch {
        /* ignore */
      }
    }
    const resolved = resolveTheme(preference);
    applyTheme(resolved);
    return resolved;
  }

  public static init(): 'light' | 'dark' {
    const resolved = resolveTheme(this.getPreference());
    applyTheme(resolved);

    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.getPreference() === 'system') {
          applyTheme(resolveTheme('system'));
        }
      });
    }

    return resolved;
  }

  public static cyclePreference(): ThemePreference {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const current = this.getPreference();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.setPreference(next);
    return next;
  }

  public static preferenceLabel(preference: ThemePreference): string {
    if (preference === 'light') return 'Claro';
    if (preference === 'dark') return 'Escuro';
    return 'Sistema';
  }
}
