import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Film, ExternalLink, RefreshCw, Volume2, ShieldCheck, PlayCircle } from 'lucide-react';
import { DailyRecoData, Anime } from '../types';

interface DailyRecommendationProps {
  onSelectAnime: (anime: Anime) => void;
}

export const DailyRecommendation: React.FC<DailyRecommendationProps> = ({ onSelectAnime }) => {
  const [data, setData] = useState<DailyRecoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReco = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`/api/gemini/daily-reco${forceRefresh ? '?force=true' : ''}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        throw new Error('Données invalides reçues du serveur');
      }
    } catch (err: any) {
      console.warn('Daily reco fetch failed:', err);
      clearTimeout(timeoutId);
      // Fallback directly to popular anime if network times out
      setData({
        titre: "Yona, Princesse de l'aube (Akatsuki no Yona)",
        titreJap: "暁のヨナ",
        genres: ["Royauté", "Princesse", "Aventure", "Romance", "Shojo"],
        score: 8.87,
        episodes: "24 épisodes",
        annee: 2014,
        synopsis: "La princesse Yona doit fuir son palais après la trahison de son cousin. Elle part chercher 4 guerriers dragons légendaires pour reconquérir son trône.",
        pourquoiRegarder: "Une des plus belles évolutions d'héroïne de l'animation japonaise, disponible en VF et VOSTFR sur Crunchyroll.",
        vf: true,
        vostfr: true,
        plateformes: [{ nom: "Crunchyroll", url: "https://www.crunchyroll.com" }],
        image: "https://cdn.myanimelist.net/images/anime/10/68749.jpg"
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyReco();
  }, []);

  const handleOpenDetails = () => {
    if (!data) return;
    const animeObj: Anime = {
      id: `daily-${data.titre.toLowerCase().replace(/\s+/g, '-')}`,
      titre: data.titre,
      titreOriginal: data.titreJap,
      image: data.image || 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
      score: data.score || 8.8,
      episodes: data.episodes || 'En cours',
      annee: data.annee || 2023,
      statut: 'En cours',
      genres: data.genres || ['Animation', 'Action'],
      synopsis: data.synopsis,
      vf: data.vf ?? true,
      vostfr: data.vostfr ?? true,
      plateformes: data.plateformes || [
        { nom: 'Crunchyroll', url: 'https://www.crunchyroll.com' }
      ]
    };
    onSelectAnime(animeObj);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#15172d] to-[#1a1c38] border border-[#2d3159] p-8 text-center animate-pulse">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#e94560] animate-spin" />
          <span className="text-lg font-bold text-slate-200">L'IA prépare la recommandation du jour...</span>
        </div>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Analyse des tendances, critiques et disponibilités streaming légales...
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161830] via-[#1a1c3b] to-[#121324] border border-[#2c305c] p-6 lg:p-8 shadow-xl shadow-black/40">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#e94560]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#25294f]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#e94560]/20 border border-[#e94560]/40 flex items-center gap-2 text-[#ff8097] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#e94560]" />
            <span>Recommandation IA du jour</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Légal & Vérifié
          </span>
        </div>

        <button
          onClick={() => fetchDailyReco(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#22264d] hover:bg-[#2c3166] text-xs text-slate-300 hover:text-white transition-all border border-[#353b70] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#e94560]' : ''}`} />
          <span>Autre proposition IA</span>
        </button>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Poster image */}
        <div className="lg:col-span-3 flex justify-center">
          <div 
            onClick={handleOpenDetails}
            className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-[#333866] shadow-2xl transition-transform hover:scale-[1.02] w-48 sm:w-56 lg:w-full aspect-[2/3]"
          >
            <img
              src={data.image || "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"}
              alt={data.titre}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
              <span className="flex items-center gap-1.5 text-xs font-bold bg-[#e94560] text-white px-3 py-1.5 rounded-md shadow">
                <PlayCircle className="w-4 h-4" /> Voir détails & fiche
              </span>
            </div>
          </div>
        </div>

        {/* Content details */}
        <div className="lg:col-span-9 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {data.score}/10
              </span>
              <span className="text-xs font-semibold bg-[#22264d] text-slate-300 px-2.5 py-1 rounded-md border border-[#353b70]">
                {data.episodes}
              </span>
              <span className="text-xs font-semibold bg-[#22264d] text-slate-300 px-2.5 py-1 rounded-md border border-[#353b70]">
                {data.annee}
              </span>
              {data.vf && (
                <span className="text-xs font-bold bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded">
                  VF Disponible
                </span>
              )}
              {data.vostfr && (
                <span className="text-xs font-bold bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded">
                  VOSTFR
                </span>
              )}
            </div>

            <h3 
              onClick={handleOpenDetails}
              className="text-2xl sm:text-3xl font-extrabold text-white font-display cursor-pointer hover:text-[#ff8097] transition-colors"
            >
              {data.titre}
            </h3>

            {data.titreJap && (
              <p className="text-xs text-slate-400 mb-3 italic">
                {data.titreJap}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {data.genres.map((g, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-[#24284d] text-slate-200 px-2.5 py-1 rounded-full border border-[#373d75]"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
              {data.synopsis}
            </p>

            {/* Pourquoi regarder */}
            {data.pourquoiRegarder && (
              <div className="bg-[#121324]/80 border-l-4 border-[#e94560] p-3.5 rounded-r-lg mb-5">
                <p className="text-xs font-bold text-[#ff8097] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> L'avis de l'IA :
                </p>
                <p className="text-xs text-slate-300 italic">
                  "{data.pourquoiRegarder}"
                </p>
              </div>
            )}
          </div>

          {/* Action buttons & platforms */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleOpenDetails}
              className="px-5 py-2.5 rounded-lg bg-[#e94560] hover:bg-[#c73e54] text-white text-sm font-bold shadow-lg shadow-[#e94560]/30 transition-all flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              <span>Explorer la fiche complète</span>
            </button>

            {/* Streaming direct badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Regarder sur :</span>
              {data.plateformes && data.plateformes.length > 0 ? (
                data.plateformes.map((p, idx) => (
                  <a
                    key={idx}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#23274e] hover:bg-[#31366b] text-xs font-bold text-slate-200 hover:text-white border border-[#3b417c] transition-all"
                  >
                    <span>{p.nom}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))
              ) : (
                <a
                  href={`https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(data.titre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#23274e] hover:bg-[#31366b] text-xs font-bold text-slate-200 hover:text-white border border-[#3b417c]"
                >
                  <span>Crunchyroll</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
