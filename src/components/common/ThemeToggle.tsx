import React, { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { ThemePreference, ThemeService } from '../../services/themeService';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const [preference, setPreference] = useState<ThemePreference>(() => ThemeService.getPreference());

  useEffect(() => {
    ThemeService.init();
  }, []);

  const handleClick = () => {
    const next = ThemeService.cyclePreference();
    setPreference(next);
  };

  const Icon = preference === 'light' ? Sun : preference === 'dark' ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-2 rounded-xl bg-[var(--rc-surface)] hover:opacity-90 text-[var(--rc-text-muted)] hover:text-[var(--rc-text)] border border-[var(--rc-border)] transition-all ${className}`}
      title={`Tema: ${ThemeService.preferenceLabel(preference)} (clique para alternar)`}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-indigo-400" />
        {showLabel && <span className="text-xs font-semibold hidden md:inline">{ThemeService.preferenceLabel(preference)}</span>}
      </div>
    </button>
  );
};
