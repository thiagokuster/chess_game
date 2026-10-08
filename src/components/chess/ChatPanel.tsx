import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types/chess';
import { Send, Smile } from 'lucide-react';
import { useI18n } from '../../services/i18n';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

const quickEmojis = ['👍', '👏', '🔥', '👑', '🤔', '🤝', 'gg!'];

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, currentUser }) => {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      setShowEmojis(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmojis(false);
  };

  const localizeSystemMessage = (message: string) => {
    const lowerMessage = message.toLocaleLowerCase('pt-BR');
    const color = message.startsWith('Brancas') ? t('white') : t('black');

    if (lowerMessage.includes('reconectou-se à partida.')) {
      return t('reconnectedRoom').replace('{name}', message.replace(' reconectou-se à partida.', ''));
    }
    if (lowerMessage.endsWith('entrou na sala.') || lowerMessage.endsWith('entrou na partida.')) {
      const name = message.replace(/ entrou na (sala|partida)\.$/, '');
      return t('joinedRoom').replace('{name}', name);
    }
    if (lowerMessage.includes('solicitaram para desfazer') || lowerMessage.includes('pediram para voltar')) {
      return t('takebackRequestedBy').replace('{color}', color);
    }
    if (lowerMessage.includes('pedido de voltar jogada foi aceito')) return t('takebackAccepted');
    if (lowerMessage.includes('pedido de voltar jogada foi recusado')) return t('takebackDeclined');
    if (lowerMessage.includes('ofereceram empate') || lowerMessage.includes('propuseram empate')) {
      return t('drawOfferedBy').replace('{color}', color);
    }
    if (lowerMessage.includes('oferta de empate foi aceita')) return t('drawOfferAccepted');
    if (lowerMessage.includes('oferta de empate foi recusada')) return t('drawOfferDeclined');
    if (lowerMessage.includes('propuseram revanche')) return t('rematchRequestedBy').replace('{color}', color);
    if (lowerMessage.includes('revanche aceita')) return t('rematchStarted');
    if (lowerMessage.includes('se desconectaram.')) {
      const disconnected = lowerMessage.includes('brancas') ? t('white') : t('black');
      return t('disconnectedAlert').replace('{color}', disconnected);
    }
    return message;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
        <span>{t('matchChat')}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Live messages body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[250px] lg:max-h-none text-xs">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8 select-none">
            <Smile className="w-6 h-6 mb-1.5 opacity-60" />
            <span>{t('emptyChat')}</span>
          </div>
        ) : (
          messages.map((m) => {
            if (m.system) {
              return (
                <div
                  key={m.id}
                  className="mx-auto my-2 py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center text-[11px] font-medium max-w-[90%]"
                >
                  {localizeSystemMessage(m.text)}
                </div>
              );
            }

            const isMe = m.sender === currentUser;

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.sender}</span>
                <div
                  className={`px-3 py-2 rounded-xl max-w-[85%] break-words ${isMe
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/60'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Emojis Drawer */}
      {showEmojis && (
        <div className="flex items-center gap-1.5 p-2 bg-slate-800/95 border-t border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-[11px] text-slate-400 mr-1 font-semibold">{t('quick')}</span>
          {quickEmojis.map((e, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickEmoji(e)}
              className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 hover:scale-110 transition-all"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 p-2 bg-slate-800/40 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`p-2 rounded-lg transition-colors ${showEmojis ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          title={t('quickReactions')}
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chatPlaceholder')}
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
