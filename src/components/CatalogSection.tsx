import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X, Sparkles, BookOpen, Globe2, Loader2, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Anime, WatchlistItem } from '../types';
import { CURATED_ANIMES } from '../data/animeData';
import { AnimeCard } from './AnimeCard';
import { ThemeChipsSelector } from './ThemeChipsSelector';
import { searchAnimeLive } from '../services/jikanApi';

interface CatalogSectionProps {
  onSelectAnime: (anime: Anime) => void;
  watchlist: Record<string, WatchlistItem>;
  onToggleWatchlist: (anime: Anime) => void;
  initialThemeFilter?: string | null;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onSelectAnime,
  watchlist,
  onToggleWatchlist,
  initialThemeFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(
    initialThemeFilter ? new Set([initialThemeFilter]) : new Set()
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAudio, setSelectedAudio] = useState<'all' | 'vf' | 'vostfr'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'year' | 'title'>('score');
  const [showThemePanel, setShowThemePanel] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Live Jikan search state
  const [useLiveSearch, setUseLiveSearch] = useState<boolean>(false);
  const [liveResults, setLiveResults] = useState<Anime[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);

  useEffect(() => {
    if (initialThemeFilter) {
      setSelectedThemes(new Set([initialThemeFilter]));
    }
  }, [initialThemeFilter]);

  // Live search when user queries long string or toggles live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      return;
    }

    if (useLiveSearch) {
      const handler = setTimeout(async () => {
        setIsSearchingLive(true);
        const { animes } = await searchAnimeLive(searchQuery);
        setLiveResults(animes);
        setIsSearchingLive(false);
      }, 400);

      return () => clearTimeout(handler);
    }
  }, [searchQuery, useLiveSearch]);

  const toggleTheme = (theme: string) => {
    const next = new Set(selectedThemes);
    if (next.has(theme)) next.delete(theme);
    else next.add(theme);
    setSelectedThemes(next);
  };

  const clearThemes = () => {
    setSelectedThemes(new Set());
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedThemes(new Set());
    setSelectedPlatform('all');
    setSelectedAudio('all');
    setSelectedStatus('all');
    setSortBy('score');
  };

  // Base list depending on live vs curated
  const baseAnimeList = useLiveSearch && liveResults.length > 0 ? liveResults : CURATED_ANIMES;

  // Normalize helper for instant accent-insensitive search
  const normalize = (str?: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  };

  const filteredAnimes = useMemo(() => {
    const qNorm = normalize(searchQuery);

    return baseAnimeList.filter(anime => {
      // Search match
      if (qNorm && !useLiveSearch) {
        const titleNorm = normalize(anime.titre);
        const origNorm = normalize(anime.titreOriginal);
        const romajiNorm = normalize(anime.titreRomaji);
        const studioNorm = normalize(anime.studio);
        const synopsisNorm = normalize(anime.synopsis);

        const matchesTitle = titleNorm.includes(qNorm) || origNorm.includes(qNorm) || romajiNorm.includes(qNorm);
        const matchesGenre = anime.genres.some(g => normalize(g).includes(qNorm));
        const matchesStudio = studioNorm.includes(qNorm);
        const matchesSynopsis = synopsisNorm.includes(qNorm);

        if (!matchesTitle && !matchesGenre && !matchesStudio && !matchesSynopsis) return false;
      }

      // Theme match (ALL selected themes must match, with flexible genre containment)
      if (selectedThemes.size > 0) {
        const themeList = Array.from(selectedThemes) as string[];
        const hasAllThemes = themeList.every((selectedTheme: string) => {
          const tNorm = normalize(selectedTheme);
          return anime.genres.some((g: string) => {
            const gNorm = normalize(g);
            return gNorm === tNorm || gNorm.includes(tNorm) || tNorm.includes(gNorm);
          });
        });
        if (!hasAllThemes) return false;
      }

      // Platform match
      if (selectedPlatform !== 'all') {
        const hasPlatform = anime.plateformes.some(p =>
          p.nom.toLowerCase().includes(selectedPlatform.toLowerCase())
        );
        if (!hasPlatform) return false;
      }

      // Audio match
      if (selectedAudio === 'vf' && !anime.vf) return false;
      if (selectedAudio === 'vostfr' && !anime.vostfr) return false;

      // Status match
      if (selectedStatus !== 'all' && anime.statut !== selectedStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'year') return Number(b.annee || 0) - Number(a.annee || 0);
      if (sortBy === 'title') return a.titre.localeCompare(b.titre);
      return 0;
    });
  }, [baseAnimeList, searchQuery, selectedThemes, selectedPlatform, selectedAudio, selectedStatus, sortBy, useLiveSearch]);

  const visibleAnimes = filteredAnimes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAnimes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121429] border border-[#242850] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catalogue & Streaming Légal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Explorez le Catalogue d'Animes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {filteredAnimes.length} titre{filteredAnimes.length > 1 ? 's' : ''} disponible{filteredAnimes.length > 1 ? 's' : ''} avec liens directs vers Crunchyroll, Netflix, ADN et plus.
          </p>
        </div>

        {/* Global Live Search Toggle */}
        <div className="flex items-center gap-3 bg-[#181b38] border border-[#2d3366] px-4 py-2.5 rounded-xl self-start md:self-auto">
          <Globe2 className={`w-4 h-4 ${useLiveSearch ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <div className="text-xs">
            <div className="font-bold text-slate-200">Recherche Mondiale (MAL)</div>
            <div className="text-[10px] text-slate-400">Chercher parmi tous les animes existants</div>
          </div>
          <button
            type="button"
            onClick={() => setUseLiveSearch(!useLiveSearch)}
            className={`w-11 h-6 rounded-full transition-colors relative ml-2 p-0.5 ${
              useLiveSearch ? 'bg-emerald-500' : 'bg-[#292e59]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                useLiveSearch ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Search Bar & Quick Filters */}
      <div className="bg-[#14162e] border border-[#262a54] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={useLiveSearch ? "Tapez n'importe quel anime au monde (ex: Naruto, Steins Gate, Bleach)..." : "Rechercher par titre, genre ou studio..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(12);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-[#1b1e3e] text-slate-100 text-sm rounded-xl border border-[#30366b] focus:outline-none focus:border-[#e94560]"
            />
            {isSearchingLive && (
              <Loader2 className="w-4 h-4 absolute right-10 top-1/2 -translate-y-1/2 text-[#e94560] animate-spin" />
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Theme Panel Button */}
          <button
            type="button"
            onClick={() => setShowThemePanel(!showThemePanel)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              showThemePanel || selectedThemes.size > 0
                ? 'bg-[#e94560] text-white border-[#e94560]'
                : 'bg-[#1b1e3e] text-slate-200 border-[#30366b] hover:bg-[#252a57]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Thèmes ({selectedThemes.size})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showThemePanel ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Filter Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Raccourcis :</span>
          
          <button
            type="button"
            onClick={() => {
              setSelectedThemes(new Set(['Romance']));
              setSelectedAudio('vf');
              setSelectedPlatform('Crunchyroll');
              setSearchQuery('');
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1d3c] hover:bg-[#e94560]/20 hover:border-[#e94560] border border-[#2b305d] text-slate-300 hover:text-white transition-all font-medium flex items-center gap-1"
          >
            <span>💕 Romance VF Crunchyroll</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedThemes(new Set());
              setSelectedAudio('vf');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1d3c] hover:bg-[#e94560]/20 hover:border-[#e94560] border border-[#2b305d] text-slate-300 hover:text-white transition-all font-medium flex items-center gap-1"
          >
            <span>🇫🇷 Tous les animes en VF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedThemes(new Set(['Dark Fantasy']));
              setSelectedAudio('all');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1d3c] hover:bg-[#e94560]/20 hover:border-[#e94560] border border-[#2b305d] text-slate-300 hover:text-white transition-all font-medium flex items-center gap-1"
          >
            <span>🌑 Dark Fantasy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedThemes(new Set(['Shonen', 'Action']));
              setSelectedAudio('all');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1d3c] hover:bg-[#e94560]/20 hover:border-[#e94560] border border-[#2b305d] text-slate-300 hover:text-white transition-all font-medium flex items-center gap-1"
          >
            <span>⚔️ Shonen & Action</span>
          </button>

          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs px-2 py-1 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 text-red-300 hover:text-white transition-all font-medium ml-auto"
          >
            Réinitialiser
          </button>
        </div>

        {/* Dropdown collapsible Theme Selector */}
        {showThemePanel && (
          <div className="pt-2">
            <ThemeChipsSelector
              selectedThemes={selectedThemes}
              onToggleTheme={toggleTheme}
              onClearThemes={clearThemes}
              maxHeight="max-h-52"
            />
          </div>
        )}

        {/* Filter controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#202449]">
          {/* Plateforme */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Plateforme
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-xs font-semibold rounded-lg border border-[#30366b] px-3 py-2 focus:outline-none focus:border-[#e94560]"
            >
              <option value="all">Toutes plateformes</option>
              <option value="Crunchyroll">Crunchyroll</option>
              <option value="Netflix">Netflix</option>
              <option value="ADN">ADN</option>
              <option value="Disney+">Disney+</option>
              <option value="Prime Video">Prime Video</option>
            </select>
          </div>

          {/* Audio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Audio / Doublage
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value as any)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-xs font-semibold rounded-lg border border-[#30366b] px-3 py-2 focus:outline-none focus:border-[#e94560]"
            >
              <option value="all">Tous (VF & VOSTFR)</option>
              <option value="vf">VF disponible</option>
              <option value="vostfr">VOSTFR uniquement</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Statut diffusion
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-xs font-semibold rounded-lg border border-[#30366b] px-3 py-2 focus:outline-none focus:border-[#e94560]"
            >
              <option value="all">Tous statuts</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-xs font-semibold rounded-lg border border-[#30366b] px-3 py-2 focus:outline-none focus:border-[#e94560]"
            >
              <option value="score">⭐ Mieux notés</option>
              <option value="year">📅 Plus récents</option>
              <option value="title">🔤 Titre A - Z</option>
            </select>
          </div>
        </div>

        {/* Active filters badges summary */}
        {(selectedThemes.size > 0 || selectedPlatform !== 'all' || selectedAudio !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#202449]">
            <span className="text-[11px] text-slate-400 font-semibold">Filtres actifs :</span>
            {searchQuery && (
              <span className="text-xs bg-[#22264f] text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#353b75]">
                Recherche: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-white" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {(Array.from(selectedThemes) as string[]).map((theme: string) => (
              <span key={theme} className="text-xs bg-[#e94560]/20 text-[#ff8097] border border-[#e94560]/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                {theme}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleTheme(theme)} />
              </span>
            ))}
            {selectedPlatform !== 'all' && (
              <span className="text-xs bg-[#22264f] text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#353b75]">
                {selectedPlatform}
                <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-white" onClick={() => setSelectedPlatform('all')} />
              </span>
            )}
            {selectedAudio !== 'all' && (
              <span className="text-xs bg-[#22264f] text-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#353b75]">
                {selectedAudio.toUpperCase()}
                <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-white" onClick={() => setSelectedAudio('all')} />
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-red-400 hover:text-red-300 underline ml-auto"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Grid of anime cards */}
      {visibleAnimes.length === 0 ? (
        <div className="bg-[#13152c] border border-[#23274e] rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">Aucun anime ne correspond à ces critères</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Essayez d'assouplir vos filtres de thèmes ou activez la "Recherche Mondiale" pour interroger l'ensemble de la base de données.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-lg bg-[#e94560] text-white text-xs font-bold shadow-md hover:bg-[#c73e54] transition-all"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {visibleAnimes.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onSelect={onSelectAnime}
                watchlistItem={watchlist[String(anime.id)]}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-8 py-3 rounded-xl bg-[#1c2045] hover:bg-[#282d61] text-white text-sm font-bold transition-all border border-[#353b7a] shadow-md hover:border-[#e94560]"
              >
                Voir plus d'animes ({filteredAnimes.length - visibleCount} restants)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
