import React from 'react';
import { X, BookOpen, Crown, Handshake, RefreshCw, Swords } from 'lucide-react';
import { useI18n } from '../../services/i18n';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">{t('instructionsTitle')}</h2>
            <p className="text-xs text-slate-400">{t('instructionsSubtitle')}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-xs sm:text-sm text-slate-300">
          {/* Section 1 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Swords className="w-4 h-4" />
              <h3 className="text-sm">{t('createJoinInstructions')}</h3>
            </div>
            <p className="leading-relaxed">{t('createRoomInstructions')}<br />{t('joinRoomInstructions')}</p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Crown className="w-4 h-4" />
              <h3 className="text-sm">{t('chessRules')}</h3>
            </div>
            <p className="leading-relaxed space-y-1">
              • {t('castlingInstructions')}<br />
              • {t('enPassantInstructions')}<br />
              • {t('promotionInstructions')}
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Handshake className="w-4 h-4" />
              <h3 className="text-sm">{t('drawTools')}</h3>
            </div>
            <p className="leading-relaxed">• {t('takebackInstructions')}<br />• {t('drawRulesInstructions')}</p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <RefreshCw className="w-4 h-4" />
              <h3 className="text-sm">{t('reconnectTitle')}</h3>
            </div>
            <p className="leading-relaxed">
              {t('reconnectBody')}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            {t('gotItPlay')}
          </button>
        </div>
      </div>
    </div>
  );
};
