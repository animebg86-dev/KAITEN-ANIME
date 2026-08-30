import React from 'react';
import { Star, Play, Bookmark, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { Anime, WatchlistItem } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  watchlistItem?: WatchlistItem;
  onToggleWatchlist?: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  watchlistItem,
  onToggleWatchlist
}) => {
  const isSaved = Boolean(watchlistItem);

  return (
    <div className="group relative bg-[#15172f] hover:bg-[#1a1d3b] border border-[#272b54] hover:border-[#e94560]/60 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#e94560]/10 transition-all duration-300 flex flex-col justify-between">
      {/* Poster Image Container */}
      <div 
        onClick={() => onSelect(anime)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#0e0f1f] cursor-pointer"
      >
        <img
          src={anime.image}
          alt={anime.titre}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80';
          }}
        />

        {/* Top Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <span className="flex items-center gap-1 text-[11px] font-extrabold bg-[#0b0c16]/85 backdrop-blur-md text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {anime.score || '8.5'}
          </span>

          <div className="flex items-center gap-1">
            {anime.vf && (
              <span className="text-[10px] font-black bg-blue-900/90 text-blue-200 px-1.5 py-0.5 rounded shadow">
                VF
              </span>
            )}
            {anime.vostfr && (
              <span className="text-[10px] font-black bg-purple-900/90 text-purple-200 px-1.5 py-0.5 rounded shadow">
                VOST
              </span>
            )}
          </div>
        </div>

        {/* Quick Watchlist Bookmark Button */}
        {onToggleWatchlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(anime);
            }}
            title={isSaved ? "Dans ma liste" : "Ajouter à ma liste"}
            className={`absolute bottom-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md shadow-md transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-[#e94560]'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Hover quick action overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1d] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
          <span className="text-[11px] font-bold text-white bg-[#e94560] px-2.5 py-1 rounded shadow">
            Fiche & Détails
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Title */}
          <h4
            onClick={() => onSelect(anime)}
            title={anime.titre}
            className="text-sm font-bold text-white font-display line-clamp-1 group-hover:text-[#ff8097] cursor-pointer transition-colors mb-1"
          >
            {anime.titre}
          </h4>

          {/* Subtitle / Studio */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="line-clamp-1">{anime.studio || `${anime.annee}`}</span>
            <span className="text-slate-500 font-semibold">{anime.episodes} ép.</span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            {anime.genres.slice(0, 3).map((g, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-[#202344] text-slate-300 px-1.5 py-0.5 rounded border border-[#2f3466]"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Platform tags */}
        <div className="pt-2 border-t border-[#202447] flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-hidden">
            {anime.plateformes && anime.plateformes.length > 0 ? (
              anime.plateformes.slice(0, 2).map((p, pIndex) => (
                <span
                  key={pIndex}
                  className="text-[10px] font-bold bg-[#1d203f] text-slate-300 px-1.5 py-0.5 rounded border border-[#2f3566] line-clamp-1"
                >
                  {p.nom}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-500">Streaming légal</span>
            )}
          </div>

          <button
            onClick={() => onSelect(anime)}
            className="text-[11px] font-bold text-[#e94560] hover:text-[#ff8097] transition-colors shrink-0"
          >
            Détails →
          </button>
        </div>
      </div>
    </div>
  );
};
