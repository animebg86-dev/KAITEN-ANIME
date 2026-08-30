import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyRecommendation } from './components/DailyRecommendation';
import { AnimeFinder } from './components/AnimeFinder';
import { CatalogSection } from './components/CatalogSection';
import { WatchlistSection } from './components/WatchlistSection';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { AiChatAdvisor } from './components/AiChatAdvisor';
import { Anime, WatchlistItem, WatchStatus } from './types';
import { CURATED_ANIMES } from './data/animeData';
import { Sparkles, Compass, BookOpen, Bookmark, MessageSquareCode, ShieldCheck, Flame, Tv, Search, ArrowRight, Star } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'finder' | 'catalog' | 'watchlist'>('home');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [catalogThemeFilter, setCatalogThemeFilter] = useState<string | null>(null);

  // Watchlist state persisted in localStorage
  const [watchlist, setWatchlist] = useState<Record<string, WatchlistItem>>(() => {
    try {
      const saved = localStorage.getItem('kaiten_watchlist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kaiten_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [watchlist]);

  const handleUpdateWatchlist = (anime: Anime, status: WatchStatus) => {
    setWatchlist(prev => ({
      ...prev,
      [String(anime.id)]: {
        anime,
        status,
        addedAt: new Date().toISOString()
      }
    }));
  };

  const handleToggleWatchlist = (anime: Anime) => {
    const key = String(anime.id);
    if (watchlist[key]) {
      setWatchlist(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      handleUpdateWatchlist(anime, 'plan_to_watch');
    }
  };

  const handleRemoveFromWatchlist = (animeId: string | number) => {
    setWatchlist(prev => {
      const next = { ...prev };
      delete next[String(animeId)];
      return next;
    });
  };

  const handleClearWatchlist = () => {
    setWatchlist({});
  };

  const handleSelectSimilarAnime = (title: string) => {
    // Search in curated or open catalog with search
    const found = CURATED_ANIMES.find(a => a.titre.toLowerCase().includes(title.toLowerCase()));
    if (found) {
      setSelectedAnime(found);
    } else {
      setActiveTab('catalog');
    }
  };

  const handleThemeCategoryClick = (theme: string) => {
    setCatalogThemeFilter(theme);
    setActiveTab('catalog');
  };

  const watchlistCount = Object.keys(watchlist).length;

  return (
    <div className="min-h-screen bg-[#0b0c16] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#e94560] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'catalog') setCatalogThemeFilter(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlistCount}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* VIEW 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Daily Recommendation Hero Card */}
            <DailyRecommendation onSelectAnime={setSelectedAnime} />

            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento 1: Trouve ton anime */}
              <div 
                onClick={() => setActiveTab('finder')}
                className="group relative overflow-hidden bg-gradient-to-br from-[#161833] to-[#121327] border border-[#272c5c] hover:border-[#e94560]/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2 group-hover:text-[#ff8097] transition-colors">
                  Trouve ton anime par l'IA
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Multi-sélection parmi plus de 80 thèmes, doublage VF / VOSTFR et plateformes pour une recommandation sur-mesure.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#e94560] group-hover:translate-x-1 transition-transform">
                  <span>Lancer la recherche</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bento 2: Catalogue & Filtres */}
              <div 
                onClick={() => setActiveTab('catalog')}
                className="group relative overflow-hidden bg-gradient-to-br from-[#161833] to-[#121327] border border-[#272c5c] hover:border-sky-500/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2 group-hover:text-sky-300 transition-colors">
                  Catalogue & Streaming
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Explorez les séries populaires et classiques avec liens directs vers Crunchyroll, Netflix, ADN et plus.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Parcourir les fiches</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bento 3: Conseiller Otaku IA */}
              <div 
                onClick={() => setIsChatOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-br from-[#161833] to-[#121327] border border-[#272c5c] hover:border-[#ff8097]/60 rounded-2xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e94560]/20 border border-[#e94560]/30 flex items-center justify-center text-[#ff8097] mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquareCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2 group-hover:text-[#ff8097] transition-colors">
                  Kaiten Sensei (Chat IA)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Discutez en direct avec notre IA pour obtenir des avis personnalisés, des ordres de visionnage ou des anecdotes.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff8097] group-hover:translate-x-1 transition-transform">
                  <span>Ouvrir la discussion</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Popular Genres Discovery Bar */}
            <div className="bg-[#121429] border border-[#23274e] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#e94560]" />
                  <span>Explorer par Genres Populaires</span>
                </h3>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs text-[#e94560] hover:underline font-semibold"
                >
                  Tout voir →
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Dark Fantasy', 'Cyberpunk', 'Shonen', 'Seinen', 'Isekai', 'Psychologique', 'Tranche de vie', 'Romance', 'Comédie', 'Mecha', 'Samouraï', 'Time Travel', 'Sports'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleThemeCategoryClick(genre)}
                    className="px-3.5 py-2 rounded-xl bg-[#1b1e3e] hover:bg-[#e94560] text-xs font-bold text-slate-200 hover:text-white transition-all border border-[#2f3566] hover:border-[#e94560] shadow-sm"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Top Anime Carousel / Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>Incontournables du moment</span>
                  </h3>
                  <p className="text-xs text-slate-400">Les animes les mieux notés et plébiscités par la communauté</p>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs font-bold text-[#e94560] hover:underline"
                >
                  Voir tout le catalogue ({CURATED_ANIMES.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {CURATED_ANIMES.slice(0, 6).map((anime) => (
                  <div
                    key={anime.id}
                    onClick={() => setSelectedAnime(anime)}
                    className="group bg-[#15172f] hover:bg-[#1b1e3d] border border-[#262a52] hover:border-[#e94560]/60 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-[#0c0d1a]">
                      <img
                        src={anime.image}
                        alt={anime.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/80 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-400/30">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {anime.score}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#ff8097]">
                        {anime.titre}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {anime.genres.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ANIME FINDER */}
        {activeTab === 'finder' && (
          <AnimeFinder onSelectAnime={setSelectedAnime} />
        )}

        {/* VIEW 3: CATALOG */}
        {activeTab === 'catalog' && (
          <CatalogSection
            onSelectAnime={setSelectedAnime}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            initialThemeFilter={catalogThemeFilter}
          />
        )}

        {/* VIEW 4: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistSection
            watchlist={watchlist}
            onSelectAnime={setSelectedAnime}
            onUpdateStatus={handleUpdateWatchlist}
            onRemove={handleRemoveFromWatchlist}
            onClearAll={handleClearWatchlist}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Floating Chat Advisor Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          title="Parler au Conseiller Otaku IA"
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#e94560] to-[#c73e54] text-white shadow-2xl shadow-[#e94560]/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
        >
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">Conseiller IA</span>
        </button>
      )}

      {/* Interactive AI Chat Advisor Drawer */}
      <AiChatAdvisor
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectAnimeByName={handleSelectSimilarAnime}
      />

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          watchlistItem={watchlist[String(selectedAnime.id)]}
          onUpdateWatchlist={handleUpdateWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          onSelectSimilarAnime={handleSelectSimilarAnime}
        />
      )}

      {/* Legal & Streaming Partners Footer */}
      <footer className="mt-auto border-t border-[#1e2247] bg-[#0c0d1c] py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-extrabold text-white tracking-wider font-display">KAITEN ANIME</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Streaming 100% Légal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-lg">
              Plateforme d'information et de recommandation intelligente d'animes. Nous redirigeons exclusivement vers les diffuseurs officiels (Crunchyroll, Netflix, ADN, Disney+, Prime Video).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">
              Accueil
            </button>
            <button onClick={() => setActiveTab('finder')} className="hover:text-white transition-colors">
              Trouve ton anime
            </button>
            <button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">
              Catalogue
            </button>
            <button onClick={() => setActiveTab('watchlist')} className="hover:text-white transition-colors">
              Ma Liste ({watchlistCount})
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[#181a38] text-[10px] text-slate-500 text-center">
          © {new Date().getFullYear()} Kaiten Anime. Propulsé par Google Gemini 3.7 Flash & Jikan MyAnimeList API.
        </div>
      </footer>
    </div>
  );
}
