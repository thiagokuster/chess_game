import { Globe } from 'lucide-react';
import { localeNames, locales, useI18n } from '../../services/i18n';

export const LanguageSelector = () => {
    const { locale, setLocale, t } = useI18n();

    return (
        <label className="flex items-center gap-1.5 px-2 rounded-xl bg-(--rc-surface) border border-(--rc-border) text-(--rc-text-muted)">
            <Globe className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="sr-only">{t('language')}</span>
            <select
                aria-label={t('language')}
                value={locale}
                onChange={(event) => setLocale(event.target.value as typeof locale)}
                className="max-w-[100px] sm:max-w-[130px] bg-transparent py-2 pr-1 text-xs font-semibold text-(--rc-text) focus:outline-none"
            >
                {locales.map((code) => (
                    <option key={code} value={code} className="bg-slate-900 text-white">
                        {localeNames[code]}
                    </option>
                ))}
            </select>
        </label>
    );
};