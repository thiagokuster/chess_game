import React from 'react';
import { X, BookOpen, Crown, Handshake, RefreshCw, Swords } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
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
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Instruções e Regras</h2>
            <p className="text-xs text-slate-400">Como funciona o Royale Chess Online Multiplayer</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-xs sm:text-sm text-slate-300">
          {/* Section 1 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Swords className="w-4 h-4" />
              <h3 className="text-sm">1. Como Criar ou Entrar em Salas</h3>
            </div>
            <p className="leading-relaxed">
              • <strong className="text-slate-100">Criar Sala:</strong> Clique em "Criar Sala Principal" no Lobby, escolha a preferência de cor e o tempo por jogador. Um código exclusivo de 6 caracteres (Ex: X7K9P2) será gerado.
              <br />
              • <strong className="text-slate-100">Entrar com Código:</strong> Compartilhe o código com seu amigo. Ele deve digitá-lo no campo do Lobby e clicar em "Entrar na Partida". A partida começa automaticamente assim que os dois jogadores entrarem.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Crown className="w-4 h-4" />
              <h3 className="text-sm">2. Regras Oficiais de Xadrez Suportadas</h3>
            </div>
            <p className="leading-relaxed space-y-1">
              • <strong className="text-slate-100">Roque (Castling):</strong> Movimente seu Rei duas casas na direção da Torre com a qual deseja fazer o Roque. (Desde que nem o Rei nem a Torre tenham se movido antes, e não haja peças ou xeque no caminho).
              <br />
              • <strong className="text-slate-100">En Passant:</strong> Quando um peão adversário avança duas casas de uma vez, seu peão adjacente pode capturá-lo como se ele tivesse avançado apenas uma casa (disponível apenas no turno imediatamente seguinte).
              <br />
              • <strong className="text-slate-100">Promoção de Peão:</strong> Ao levar um peão até a última fileira, um menu aparecerá para você escolher em qual peça deseja promovê-lo (Dama, Torre, Bispo ou Cavalo).
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Handshake className="w-4 h-4" />
              <h3 className="text-sm">3. Desempates e Ferramentas Extras</h3>
            </div>
            <p className="leading-relaxed">
              • <strong className="text-slate-100">Desfazer Jogada (Takeback):</strong> Clicar no botão envia uma solicitação ao oponente. Se ele aceitar, o jogo retorna à sua vez.
              <br />
              • <strong className="text-slate-100">Empates Automáticos:</strong> O jogo detecta automaticamente Afogamento do Rei (Stalemate), Repetição Tripla de Posição, Regra dos 50 Movimentos e Insuficiência Material. Você também pode propor empate ao oponente a qualquer momento.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <RefreshCw className="w-4 h-4" />
              <h3 className="text-sm">4. Reconexão e Desconexão</h3>
            </div>
            <p className="leading-relaxed">
              Em partidas online, se o seu oponente fechar a aba ou cair da internet, o sistema exibirá uma contagem de 60 segundos aguardando o retorno dele. Se o tempo expirar, você poderá reivindicar a vitória!
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            Entendi, Vamos Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
