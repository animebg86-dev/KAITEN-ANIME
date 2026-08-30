import React, { useState, useEffect } from 'react';
import { X, Star, ExternalLink, Sparkles, Play, Bookmark, ShieldCheck, Check, Tv, Film, Tag, Calendar, Building, HelpCircle, Loader2 } from 'lucide-react';
import { Anime, WatchlistItem, WatchStatus, AiDetailedAnalysis } from '../types';

interface AnimeDetailModalProps {
  anime: Anime | null;
  onClose: () => void;
  watchlistItem?: WatchlistItem;
  onUpdateWatchlist: (anime: Anime, status: WatchStatus) => void;
  onRemoveFromWatchlist: (animeId: string | number) => void;
  onSelectSimilarAnime: (title: string) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  onClose,
  watchlistItem,
  onUpdateWatchlist,
  onRemoveFromWatchlist,
  onSelectSimilarAnime
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AiDetailedAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  useEffect(() => {
    if (!anime) return;
    setAiAnalysis(null);
    setShowTrailer(false);

    const fetchAiAnalysis = async () => {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/gemini/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: anime.titre,
            synopsis: anime.synopsis
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          setAiAnalysis(json.data);
        }
      } catch (err) {
        console.warn('AI details analysis error:', err);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiAnalysis();
  }, [anime]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anime) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#12142a] border border-[#2c3163] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-[#e94560] text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Header */}
        <div className="relative h-48 sm:h-64 w-full bg-[#0a0b16] overflow-hidden">
          <img
            src={anime.bannerImage || anime.image}
            alt={anime.titre}
            className="w-full h-full object-cover object-center opacity-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12142a] via-[#12142a]/60 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex items-center gap-1 text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {anime.score}/10
                </span>
                <span className="text-xs font-bold bg-[#1d2042] text-slate-300 px-2 py-0.5 rounded border border-[#31366e]">
                  {anime.statut}
                </span>
                {anime.vf && (
                  <span className="text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded">
                    VF
                  </span>
                )}
                {anime.vostfr && (
                  <span className="text-xs font-bold bg-purple-900/60 text-purple-300 border border-purple-700/60 px-2 py-0.5 rounded">
                    VOSTFR
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight drop-shadow-md">
                {anime.titre}
              </h2>
              {anime.titreOriginal && (
                <p className="text-xs text-slate-300 italic">
                  {anime.titreOriginal} {anime.titreRomaji && `(${anime.titreRomaji})`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Poster + Watchlist Actions */}
            <div className="md:col-span-4 space-y-4">
              <div className="rounded-xl overflow-hidden border-2 border-[#2b305e] shadow-xl aspect-[3/4] bg-[#0c0d1b]">
                <img
                  src={anime.image}
                  alt={anime.titre}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80';
                  }}
                />
              </div>

              {/* Watchlist Quick Buttons */}
              <div className="bg-[#171a38] border border-[#2b3061] rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Ma Watchlist :</span>
                  {watchlistItem && (
                    <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enregistré
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateWatchlist(anime, 'plan_to_watch')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      watchlistItem?.status === 'plan_to_watch'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#20244e] text-slate-300 border-[#323975] hover:bg-[#2a3069]'
                    }`}
                  >
                    À voir
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateWatchlist(anime, 'watching')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      watchlistItem?.status === 'watching'
                        ? 'bg-[#e94560] text-white border-[#e94560]'
                        : 'bg-[#20244e] text-slate-300 border-[#323975] hover:bg-[#2a3069]'
                    }`}
                  >
                    En cours
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateWatchlist(anime, 'completed')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      watchlistItem?.status === 'completed'
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-[#20244e] text-slate-300 border-[#323975] hover:bg-[#2a3069]'
                    }`}
                  >
                    Terminé
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateWatchlist(anime, 'favorite')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      watchlistItem?.status === 'favorite'
                        ? 'bg-pink-500 text-white border-pink-400'
                        : 'bg-[#20244e] text-slate-300 border-[#323975] hover:bg-[#2a3069]'
                    }`}
                  >
                    Favori ❤️
                  </button>
                </div>

                {watchlistItem && (
                  <button
                    type="button"
                    onClick={() => onRemoveFromWatchlist(anime.id)}
                    className="w-full text-center text-[11px] text-red-400 hover:underline pt-1"
                  >
                    Retirer de ma liste
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Metadata + Synopsis + AI Analysis */}
            <div className="md:col-span-8 space-y-5">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#171a38] p-3 rounded-xl border border-[#292e5c] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Épisodes</span>
                  <span className="font-semibold text-slate-200">{anime.episodes}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Année</span>
                  <span className="font-semibold text-slate-200">{anime.annee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Studio</span>
                  <span className="font-semibold text-slate-200">{anime.studio || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Durée / Ép.</span>
                  <span className="font-semibold text-slate-200">{anime.dureeEpisode || '24 min'}</span>
                </div>
              </div>

              {/* Genres */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thèmes & Genres :</h4>
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-[#21254d] text-slate-200 px-3 py-1 rounded-full border border-[#323975]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Streaming Platforms */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Regarder légalement en streaming :
                </h4>
                <div className="flex flex-wrap gap-2">
                  {anime.plateformes && anime.plateformes.length > 0 ? (
                    anime.plateformes.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e2249] hover:bg-[#e94560] text-slate-200 hover:text-white text-xs font-bold border border-[#353c7a] transition-all shadow-sm"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>{p.nom}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))
                  ) : (
                    <a
                      href={`https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(anime.titre)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e2249] hover:bg-[#e94560] text-slate-200 hover:text-white text-xs font-bold border border-[#353c7a]"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Recherche Crunchyroll</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {anime.trailerUrl && (
                    <a
                      href={anime.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-800 text-red-200 hover:text-white text-xs font-bold border border-red-800/80 transition-all"
                    >
                      <Film className="w-3.5 h-3.5 text-red-400" />
                      <span>Bande-annonce (YouTube)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Synopsis :</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#161833] p-4 rounded-xl border border-[#272b54]">
                  {anime.synopsis}
                </p>
              </div>

              {/* AI Deep Analysis Section */}
              <div className="bg-gradient-to-br from-[#181b3d] to-[#141630] border border-[#2f356d] rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-[#ff8097]">
                  <Sparkles className="w-4 h-4 text-[#e94560]" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wider font-display">
                    Analyse Critique & Avis de l'IA (Gemini 3.7)
                  </h4>
                </div>

                {loadingAi ? (
                  <div className="flex items-center justify-center gap-3 py-6 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#e94560]" />
                    <span>Génération de l'analyse critique d'expert...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3.5 text-xs text-slate-300">
                    <p className="leading-relaxed text-slate-200 italic border-l-2 border-[#e94560] pl-3 py-0.5">
                      "{aiAnalysis.analyseIA}"
                    </p>

                    {/* Points forts */}
                    {aiAnalysis.pointsForts && aiAnalysis.pointsForts.length > 0 && (
                      <div>
                        <span className="font-bold text-emerald-400 block mb-1">Points forts majeurs :</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {aiAnalysis.pointsForts.map((pt, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-[#1f234f] p-1.5 rounded-md border border-[#303673]">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-200">{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Public cible & Disponibilité */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {aiAnalysis.publicCible && (
                        <div className="bg-[#121326] p-2.5 rounded-lg border border-[#242852]">
                          <span className="font-bold text-amber-300 block mb-0.5">Public conseillé :</span>
                          <span className="text-slate-300">{aiAnalysis.publicCible}</span>
                        </div>
                      )}
                      {aiAnalysis.disponibiliteFrance && (
                        <div className="bg-[#121326] p-2.5 rounded-lg border border-[#242852]">
                          <span className="font-bold text-sky-300 block mb-0.5">Disponibilité France / VF :</span>
                          <span className="text-slate-300">{aiAnalysis.disponibiliteFrance}</span>
                        </div>
                      )}
                    </div>

                    {/* Animes similaires */}
                    {aiAnalysis.animesSimilaires && aiAnalysis.animesSimilaires.length > 0 && (
                      <div className="pt-2 border-t border-[#252a57]">
                        <span className="font-bold text-slate-300 block mb-1.5">Si vous avez aimé, essayez aussi :</span>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.animesSimilaires.map((similar, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectSimilarAnime(similar);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#222754] hover:bg-[#e94560] text-slate-200 hover:text-white text-[11px] font-bold border border-[#333a7a] transition-all"
                            >
                              🔍 {similar}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Cliquez sur les options ci-dessus pour découvrir plus d'informations.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0d0e1c] border-t border-[#22264d] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Informations vérifiées et respectant les droits de diffusion légaux.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-[#21254a] text-slate-200 hover:bg-[#2c3161] font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
