import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, X, Send, Sparkles, Bot, User, Loader2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Anime } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnimeByName: (name: string) => void;
}

const QUICK_PROMPTS = [
  "Top animes Royauté & Princesse en VF ?",
  "Top 3 Romance VF sur Crunchyroll ?",
  "Top 3 animes de Dark Fantasy récents ?",
  "Un anime court (12 épisodes) captivant et terminé ?",
  "Quel anime regarder après L'Attaque des Titans ?"
];

export const AiChatAdvisor: React.FC<AiChatAdvisorProps> = ({
  isOpen,
  onClose,
  onSelectAnimeByName
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Kon'nichiwa ! Je suis Kaiten Sensei, votre conseiller Otaku IA. Quel type d'anime recherchez-vous aujourd'hui ? Dites-moi vos thèmes, plateformes (Crunchyroll, Netflix, ADN...) ou doublage souhaité (VF/VOSTFR) !",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg),
          userMessage: text
        })
      });

      const json = await res.json();
      const reply = json.reply || "Désolé, je n'ai pas pu générer de réponse pour le moment.";

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Oups ! Une erreur est survenue lors de la communication avec l'IA. Voici une recommandation sûre : **Frieren: Beyond Journey's End** ou **My Dress-Up Darling** !",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to render message content with bold links or direct buttons
  const renderMessageContent = (content: string) => {
    return (
      <div className="whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[420px] max-h-[85vh] h-[600px] flex flex-col bg-[#12142a] border border-[#2e336b] rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#191c3d] via-[#21254e] to-[#191c3d] p-3.5 border-b border-[#2a2f61] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#e94560] flex items-center justify-center text-white shadow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white font-display">Kaiten Sensei</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                En ligne
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Conseiller Otaku & Spécialiste Streaming</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-[#252a57] hover:bg-[#e94560] text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin bg-[#0e1022]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#e94560]/20 border border-[#e94560]/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-[#e94560]" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#e94560] to-[#c73e54] text-white rounded-tr-none'
                  : 'bg-[#181a38] text-slate-200 border border-[#292d5c] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[9px] opacity-60 text-right mt-1">{msg.timestamp}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-white">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#181a38] border border-[#292d5c] w-fit px-3 py-2 rounded-xl">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e94560]" />
            <span>Kaiten Sensei réfléchit...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="p-2 bg-[#12142a] border-t border-[#23274e] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            disabled={isTyping}
            className="text-[10px] font-semibold bg-[#1a1d3d] hover:bg-[#252a57] text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-[#2f3469] transition-colors shrink-0 disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#151733] border-t border-[#2a2f5f] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question sur n'importe quel anime..."
          disabled={isTyping}
          className="flex-1 bg-[#1c2045] text-slate-200 text-xs rounded-xl px-3.5 py-2.5 border border-[#30376d] focus:outline-none focus:border-[#e94560]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-[#e94560] text-white hover:bg-[#c73e54] transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
