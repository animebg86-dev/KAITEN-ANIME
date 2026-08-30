import React, { useState } from 'react';
import { Bookmark, Star, Trash2, ExternalLink, PlayCircle, CheckCircle, Heart, Clock, Film } from 'lucide-react';
import { WatchlistItem, Anime, WatchStatus } from '../types';
import { AnimeCard } from './AnimeCard';

interface WatchlistSectionProps {
  watchlist: Record<string, WatchlistItem>;
  onSelectAnime: (anime: Anime) => void;
  onUpdateStatus: (anime: Anime, status: WatchStatus) => void;
  onRemove: (animeId: string | number) => void;
  onClearAll: () => void;
  onNavigateToCatalog: () => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlist,
  onSelectAnime,
  onUpdateStatus,
  onRemove,
  onClearAll,
  onNavigateToCatalog
}) => {
  const [filterTab, setFilterTab] = useState<'all' | WatchStatus>('all');

  const items: WatchlistItem[] = Object.values(watchlist);

  const filteredItems = items.filter((item: WatchlistItem) => {
    if (filterTab === 'all') return true;
    return item.status === filterTab;
  });

  const getCount = (status: WatchStatus) => {
    return items.filter((i: WatchlistItem) => i.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121429] border border-[#242850] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Votre Collection Personnelle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Ma Watchlist & Favoris
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {items.length} anime{items.length > 1 ? 's' : ''} enregistré{items.length > 1 ? 's' : ''} dans votre navigateur.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment vider toute votre watchlist ?')) {
                onClearAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/60 text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider ma liste</span>
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'all'
              ? 'bg-[#e94560] text-white shadow-md'
              : 'bg-[#181a38] text-slate-300 hover:bg-[#22254e]'
          }`}
        >
          <span>Tous ({items.length})</span>
        </button>

        <button
          onClick={() => setFilterTab('watching')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'watching'
              ? 'bg-[#e94560] text-white shadow-md'
              : 'bg-[#181a38] text-slate-300 hover:bg-[#22254e]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>En cours ({getCount('watching')})</span>
        </button>

        <button
          onClick={() => setFilterTab('plan_to_watch')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'plan_to_watch'
              ? 'bg-[#e94560] text-white shadow-md'
              : 'bg-[#181a38] text-slate-300 hover:bg-[#22254e]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>À voir ({getCount('plan_to_watch')})</span>
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'completed'
              ? 'bg-[#e94560] text-white shadow-md'
              : 'bg-[#181a38] text-slate-300 hover:bg-[#22254e]'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Terminés ({getCount('completed')})</span>
        </button>

        <button
          onClick={() => setFilterTab('favorite')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'favorite'
              ? 'bg-[#e94560] text-white shadow-md'
              : 'bg-[#181a38] text-slate-300 hover:bg-[#22254e]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>Favoris ({getCount('favorite')})</span>
        </button>
      </div>

      {/* Content Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#13152c] border border-[#23274e] rounded-2xl p-12 text-center">
          <Film className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {items.length === 0 ? "Votre liste est encore vide !" : "Aucun anime dans cette catégorie"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Parcourez le catalogue ou utilisez le moteur de recommandation IA pour ajouter vos animes préférés.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-6 py-2.5 rounded-xl bg-[#e94560] text-white text-xs font-bold shadow-lg shadow-[#e94560]/30 hover:bg-[#c73e54] transition-all"
          >
            Explorer le catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {filteredItems.map(item => (
            <div key={item.anime.id} className="relative group">
              <AnimeCard
                anime={item.anime}
                onSelect={onSelectAnime}
                watchlistItem={item}
                onToggleWatchlist={() => onRemove(item.anime.id)}
              />

              {/* Status Badge Over Card Bottom */}
              <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] bg-[#1a1c38] px-2.5 py-1 rounded-lg border border-[#2b305e]">
                <select
                  value={item.status}
                  onChange={(e) => onUpdateStatus(item.anime, e.target.value as WatchStatus)}
                  className="bg-transparent text-slate-200 text-[11px] font-bold focus:outline-none cursor-pointer"
                >
                  <option value="watching">En cours</option>
                  <option value="plan_to_watch">À voir</option>
                  <option value="completed">Terminé</option>
                  <option value="favorite">Favori ❤️</option>
                </select>

                <button
                  type="button"
                  onClick={() => onRemove(item.anime.id)}
                  title="Retirer"
                  className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
