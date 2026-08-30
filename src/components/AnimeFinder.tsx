import React, { useState } from 'react';
import { Compass, Sparkles, Send, Star, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Flame, Volume2, Info, Zap, Heart, Swords, Skull, Film } from 'lucide-react';
import { ThemeChipsSelector } from './ThemeChipsSelector';
import { POPULAR_MOODS } from '../data/themesData';
import { AiRecommendationResult, Anime } from '../types';

interface AnimeFinderProps {
  onSelectAnime: (anime: Anime) => void;
}

const PRESET_SCENARIOS = [
  {
    icon: Heart,
    label: "Romance VF Crunchyroll",
    themes: ["Romance", "Comédie romantique"],
    lang: "vf" as const,
    platform: "Crunchyroll",
    mood: "romance",
    query: "Une belle histoire d'amour touchante avec un excellent doublage français VF sur Crunchyroll"
  },
  {
    icon: Swords,
    label: "Shonen & Combats Épiques",
    themes: ["Action", "Shonen", "Combats"],
    lang: "any" as const,
    platform: "any",
    mood: "epic",
    query: "Animation spectaculaire avec des combats fluides et un héros charismatique"
  },
  {
    icon: Skull,
    label: "Dark Fantasy & Mystère",
    themes: ["Dark Fantasy", "Mystère", "Surnaturel"],
    lang: "any" as const,
    platform: "any",
    mood: "dark",
    query: "Ambiance sombre, intrigue prenante et enjeux dramatiques"
  },
  {
    icon: Film,
    label: "Anime Court (12 épisodes)",
    themes: ["Tranche de vie", "Drame"],
    lang: "any" as const,
    platform: "any",
    mood: "emotional",
    query: "Anime court de 12 épisodes captivant du début à la fin"
  }
];

export const AnimeFinder: React.FC<AnimeFinderProps> = ({ onSelectAnime }) => {
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set(['Romance', 'Comédie romantique']));
  const [langPref, setLangPref] = useState<'any' | 'vf' | 'vostfr'>('vf');
  const [platformPref, setPlatformPref] = useState<string>('Crunchyroll');
  const [selectedMood, setSelectedMood] = useState<string>('romance');
  const [customQuery, setCustomQuery] = useState<string>('Romance en VF sur Crunchyroll');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AiRecommendationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = (theme: string) => {
    const next = new Set(selectedThemes);
    if (next.has(theme)) {
      next.delete(theme);
    } else {
      next.add(theme);
    }
    setSelectedThemes(next);
  };

  const clearThemes = () => {
    setSelectedThemes(new Set());
  };

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSelectedThemes(new Set(preset.themes));
    setLangPref(preset.lang);
    setPlatformPref(preset.platform);
    setSelectedMood(preset.mood);
    setCustomQuery(preset.query);
    // Auto-trigger search for fast feedback
    executeSearch(new Set(preset.themes), preset.lang, preset.platform, preset.mood, preset.query);
  };

  const executeSearch = async (
    themes: Set<string>,
    lang: 'any' | 'vf' | 'vostfr',
    platform: string,
    moodId: string,
    query: string
  ) => {
    setIsLoading(true);
    setError(null);

    const moodObj = POPULAR_MOODS.find(m => m.id === moodId);

    try {
      const res = await fetch('/api/gemini/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themes: Array.from(themes),
          langPref: lang,
          platformPref: platform,
          mood: moodObj ? `${moodObj.label} (${moodObj.desc})` : 'Standard',
          query: query.trim()
        })
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.results) && json.results.length > 0) {
        setResults(json.results);
      } else {
        throw new Error(json.error || 'Aucun résultat retourné par le moteur.');
      }
    } catch (err: any) {
      console.error('Finder error:', err);
      setError(err.message || 'Impossible de contacter le moteur IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedThemes.size === 0 && !customQuery.trim()) {
      setError('Veuillez sélectionner au moins un thème ou taper une description.');
      return;
    }
    await executeSearch(selectedThemes, langPref, platformPref, selectedMood, customQuery);
  };

  const handleOpenResultDetails = (item: AiRecommendationResult) => {
    const animeObj: Anime = {
      id: `reco-${item.titre.toLowerCase().replace(/\s+/g, '-')}`,
      titre: item.titre,
      titreOriginal: item.titreOriginal,
      image: item.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
      score: item.score || 8.5,
      episodes: item.episodes || '12-24 ép.',
      annee: 2023,
      statut: 'En cours',
      genres: item.genres || ['Animation'],
      synopsis: item.synopsis,
      vf: item.vf,
      vostfr: item.vostfr,
      plateformes: (item.plateformes || ['Crunchyroll']).map(p => ({
        nom: p,
        url: `https://www.google.com/search?q=${encodeURIComponent(p + ' ' + item.titre)}`
      }))
    };
    onSelectAnime(animeObj);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#171936] via-[#1d2042] to-[#171936] border border-[#2d3263] rounded-2xl p-6 lg:p-8 shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e94560]/20 border border-[#e94560]/40 text-[#ff8097] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-[#e94560]" />
            <span>Moteur de Matching IA Ultra-Rapide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
            Trouve l'Anime Parfait en 1 Clic
          </h2>
          <p className="text-sm text-slate-300">
            Combine thèmes, plateformes de streaming légales (Crunchyroll, Netflix, ADN...), préférences audio (VF / VOSTFR) et description libre pour recevoir des recommandations instantanées.
          </p>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="bg-[#121429] border border-[#252a57] rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Recherches rapides 1-Clic</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset, pIdx) => {
            const Icon = preset.icon;
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#181a38] border border-[#292d5c] hover:border-[#e94560] hover:bg-[#20234a] text-slate-200 text-xs font-bold transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#e94560]/20 text-[#ff8097] flex items-center justify-center shrink-0 group-hover:bg-[#e94560] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="line-clamp-1">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-[#121429] border border-[#252a57] rounded-2xl p-6 shadow-xl space-y-6">
        {/* 1. Theme Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>1. Choisis tes thèmes & genres</span>
              <span className="text-xs font-normal text-slate-400">({selectedThemes.size} choisis)</span>
            </label>
          </div>
          <ThemeChipsSelector
            selectedThemes={selectedThemes}
            onToggleTheme={toggleTheme}
            onClearThemes={clearThemes}
            maxHeight="max-h-48"
          />
        </div>

        {/* 2. Mood & Vibe */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            2. Quelle ambiance recherches-tu ?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {POPULAR_MOODS.map(mood => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(mood.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedMood === mood.id
                    ? 'bg-[#e94560]/20 border-[#e94560] text-white shadow-md'
                    : 'bg-[#181a38] border-[#292d5c] text-slate-300 hover:bg-[#20234a]'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{mood.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{mood.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Filters row: Langue + Plateforme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#20244d]">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Langue / Doublage souhaité
            </label>
            <select
              value={langPref}
              onChange={(e) => setLangPref(e.target.value as any)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-sm rounded-xl border border-[#30366b] px-4 py-2.5 focus:outline-none focus:border-[#e94560]"
            >
              <option value="any">🌐 Langue : Peu importe (VF ou VOSTFR)</option>
              <option value="vf">🇫🇷 VF obligatoire (Doublage français)</option>
              <option value="vostfr">🇯🇵 VOSTFR uniquement (Japonais sous-titré FR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Plateforme de streaming légale
            </label>
            <select
              value={platformPref}
              onChange={(e) => setPlatformPref(e.target.value)}
              className="w-full bg-[#1b1e3e] text-slate-200 text-sm rounded-xl border border-[#30366b] px-4 py-2.5 focus:outline-none focus:border-[#e94560]"
            >
              <option value="any">📺 Plateforme : Toutes (Crunchyroll, Netflix, ADN...)</option>
              <option value="Crunchyroll">🟠 Crunchyroll</option>
              <option value="Netflix">🔴 Netflix</option>
              <option value="ADN">🔵 ADN (Anime Digital Network)</option>
              <option value="Disney+">🔷 Disney+</option>
              <option value="Prime Video">📦 Amazon Prime Video</option>
            </select>
          </div>
        </div>

        {/* 4. Optional custom prompt */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Description personnalisée / Scénario précis (Optionnel)
          </label>
          <div className="relative">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ex: Romance lycéenne mignonne en VF sur Crunchyroll..."
              className="w-full bg-[#1b1e3e] text-slate-200 text-sm rounded-xl border border-[#30366b] pl-4 pr-10 py-3 focus:outline-none focus:border-[#e94560]"
            />
            <Sparkles className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={clearThemes}
            className="px-4 py-3 rounded-xl bg-[#1b1e3e] text-slate-300 text-sm font-semibold hover:bg-[#252a57] transition-all border border-[#2f3569]"
          >
            Réinitialiser
          </button>
          
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c73e54] text-white text-sm font-bold shadow-lg shadow-[#e94560]/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recherche IA en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Trouver mes animes par l'IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && results.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{results.length} Recommandations sélectionnées par l'IA</span>
            </h3>
            <span className="text-xs text-slate-400">Classées par pertinence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-[#171936] to-[#121326] border border-[#2c305c] hover:border-[#e94560]/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]"
              >
                <div>
                  {/* Top badges: Match score + Audio */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#e94560]/20 text-[#ff8097] border border-[#e94560]/40 text-xs font-black">
                      🎯 {item.matchPercent || 95}% Match
                    </span>
                    <div className="flex items-center gap-1">
                      {item.vf && (
                        <span className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                          VF
                        </span>
                      )}
                      {item.vostfr && (
                        <span className="text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                          VOSTFR
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Poster thumbnail if available */}
                  {item.image && (
                    <div 
                      onClick={() => handleOpenResultDetails(item)}
                      className="mb-3 rounded-xl overflow-hidden aspect-[16/9] bg-[#0d0e1d] border border-[#272b54] cursor-pointer group relative"
                    >
                      <img 
                        src={item.image} 
                        alt={item.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121326] via-transparent to-transparent opacity-60" />
                    </div>
                  )}

                  {/* Title & Japanese */}
                  <h4 
                    onClick={() => handleOpenResultDetails(item)}
                    className="text-lg font-bold text-white hover:text-[#ff8097] cursor-pointer line-clamp-1 mb-1 font-display"
                  >
                    {item.titre}
                  </h4>
                  {item.titreOriginal && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-2">
                      {item.titreOriginal}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {item.score || 8.5}/10
                    </span>
                    <span>•</span>
                    <span>{item.episodes}</span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(item.genres || []).map((g, i) => (
                      <span key={i} className="text-[10px] font-medium bg-[#212447] text-slate-300 px-2 py-0.5 rounded">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                    {item.synopsis}
                  </p>

                  {/* Match Reason */}
                  {item.matchReason && (
                    <div className="bg-[#0f1021] border-l-2 border-[#e94560] p-2.5 rounded-r-md text-[11px] text-slate-300 italic mb-4">
                      <span className="font-bold text-[#ff8097] not-italic block mb-0.5">Pourquoi ce choix ?</span>
                      "{item.matchReason}"
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#22264d] flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Disponible sur :</span>
                    <div className="flex gap-1 flex-wrap">
                      {(item.plateformes || []).map((p, pIdx) => (
                        <a
                          key={pIdx}
                          href={`https://www.google.com/search?q=${encodeURIComponent(p + ' ' + item.titre)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-slate-300 hover:text-white bg-[#22264d] hover:bg-[#2e3366] px-2 py-0.5 rounded border border-[#373d75] flex items-center gap-1"
                        >
                          <span>{p}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenResultDetails(item)}
                    className="w-full py-2 rounded-lg bg-[#252a57] hover:bg-[#e94560] text-slate-200 hover:text-white text-xs font-bold transition-all text-center"
                  >
                    Voir la fiche complète & avis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

