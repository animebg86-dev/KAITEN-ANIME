import React from 'react';
import { Sparkles, Compass, BookOpen, Bookmark, MessageSquareCode, Film, Flame } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'finder' | 'catalog' | 'watchlist';
  setActiveTab: (tab: 'home' | 'finder' | 'catalog' | 'watchlist') => void;
  watchlistCount: number;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onOpenChat
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0d1b]/90 backdrop-blur-md border-b border-[#222444] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] via-[#c73e54] to-[#7f1d1d] flex items-center justify-center shadow-lg shadow-[#e94560]/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-[#e94560] bg-clip-text text-transparent">
                KAITEN ANIME
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/40">
                IA 3.7
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Catalogue officiel & Guide Otaku Intelligent
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/25'
                : 'text-slate-300 hover:text-white hover:bg-[#1a1b35]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">Accueil & IA</span>
          </button>

          <button
            id="nav-tab-finder"
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'finder'
                ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/25'
                : 'text-slate-300 hover:text-white hover:bg-[#1a1b35]'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Trouve ton anime</span>
          </button>

          <button
            id="nav-tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/25'
                : 'text-slate-300 hover:text-white hover:bg-[#1a1b35]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Catalogue</span>
          </button>

          <button
            id="nav-tab-watchlist"
            onClick={() => setActiveTab('watchlist')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/25'
                : 'text-slate-300 hover:text-white hover:bg-[#1a1b35]'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ma Liste</span>
            {watchlistCount > 0 && (
              <span className="bg-[#e94560] text-white text-[11px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center border border-[#0c0d1b]">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            id="nav-btn-chat"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#1d1f3f] text-[#ff8097] border border-[#ff8097]/30 hover:bg-[#ff8097]/15 hover:border-[#ff8097]/60 transition-all shadow-sm"
          >
            <MessageSquareCode className="w-4 h-4" />
            <span className="hidden lg:inline">Conseiller IA</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
