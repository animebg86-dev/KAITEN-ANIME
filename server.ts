import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Model list in order of preference & reliability
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

/**
 * Resilient Gemini Content Generator with automatic model fallback and timeout racing
 */
async function generateGeminiSafe(params: {
  contents: string;
  systemInstruction?: string;
  isJson?: boolean;
}): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const fetchPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          ...(params.isJson ? { responseMimeType: "application/json" } : {}),
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response && response.text && response.text.trim().length > 0) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Safe] Model ${model} encountered issue:`, err?.message?.slice(0, 100) || err);
      // try next candidate model in list
    }
  }

  return null;
}

// Pool of high-quality rotating daily recommendations
const DAILY_RECO_POOL = [
  {
    titre: "Frieren: Beyond Journey's End (Sousou no Frieren)",
    titreJap: "葬送のフリーレン",
    genres: ["Aventure", "Drame", "Fantasy", "Tranche de vie", "Magie"],
    score: 9.35,
    episodes: "28 épisodes",
    annee: 2023,
    synopsis: "Après une quête de dix ans, le groupe des héros vainc le roi des démons et ramène la paix. Frieren, elfe magicienne immortelle, voit ses compagnons humains vieillir et mourir. Elle entreprend alors un nouveau voyage pour mieux comprendre l'humanité et la valeur du temps partagé.",
    pourquoiRegarder: "Un chef-d'œuvre de narration et de contemplation avec une animation sublime signée Madhouse, une bande-son orchestrale émouvante et des combats d'une intensité rare.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com/fr/series/GG5H5XMQ5/frieren-beyond-journeys-end" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
  },
  {
    titre: "Yona, Princesse de l'aube (Akatsuki no Yona)",
    titreJap: "暁のヨナ",
    genres: ["Royauté", "Princesse", "Aventure", "Romance", "Shojo", "Fantastique"],
    score: 8.87,
    episodes: "24 épisodes",
    annee: 2014,
    synopsis: "Yona, l'unique princesse du royaume de Kôka, est chassée de son palais après un coup d'État sanglant. Avec son protecteur Hak, elle part à la recherche des 4 dragons légendaires pour reconquérir son trône.",
    pourquoiRegarder: "Une des plus belles évolutions d'héroïne de l'animation japonaise, un univers impérial captivant et une version française remarquable.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/10/68749.jpg"
  },
  {
    titre: "Solo Leveling",
    titreJap: "俺だけレベルアップな件",
    genres: ["Action", "Fantasy", "Donjons", "Super-pouvoirs", "Shonen"],
    score: 8.4,
    episodes: "24 épisodes",
    annee: 2024,
    synopsis: "Dans un monde où des portails reliant notre monde à des donjons remplis de monstres sont apparus, des humains éveillent des pouvoirs. Sung Jinwoo, considéré comme le chasseur le plus faible du monde, reçoit une seconde chance sous la forme d'un système de jeu vidéo que lui seul peut voir.",
    pourquoiRegarder: "L'adaptation survoltée du manhwa culte, avec une montée en puissance jouissive, une animation explosive par A-1 Pictures et la musique épique de Hiroyuki Sawano.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1170/124302.jpg"
  },
  {
    titre: "Shirayuki aux cheveux rouges (Snow White with the Red Hair)",
    titreJap: "赤髪の白雪姫",
    genres: ["Royauté", "Princesse", "Romance", "Drame", "Shojo"],
    score: 8.4,
    episodes: "24 épisodes",
    annee: 2015,
    synopsis: "Shirayuki, jeune herboriste aux cheveux d'un rouge écarlate éclatant, fuit un prince capricieux et rencontre Zen, le second prince de Clarines. Ensemble, ils construisent une relation pure et inspirante.",
    pourquoiRegarder: "Une romance princière saine, une animation lumineuse du studio Bones et une magnifique bande-son médiévale.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" },
      { nom: "ADN", url: "https://animedigitalnetwork.fr" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/8/75940.jpg"
  },
  {
    titre: "My Dress-Up Darling (Sexy Cosplay Doll)",
    titreJap: "その着せ替え人形は恋をする",
    genres: ["Romance", "Comédie romantique", "Cosplay", "Tranche de vie", "School"],
    score: 8.3,
    episodes: "12 épisodes",
    annee: 2022,
    synopsis: "Wakana Gojo est un lycéen solitaire passionné par la fabrication de poupées traditionnelles Hina. Un jour, la très populaire et extravertie Marin Kitagawa découvre son talent de couturier et lui demande de concevoir ses tenues de cosplay.",
    pourquoiRegarder: "Une romance moderne pétillante, incroyablement saine et bienveillante avec un doublage français d'une rare qualité et une réalisation splendide par CloverWorks.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1179/119897.jpg"
  },
  {
    titre: "Ranking of Kings (Ousama Ranking)",
    titreJap: "王様ランキング",
    genres: ["Royauté", "Prince", "Aventure", "Fantasy", "Émotion"],
    score: 8.8,
    episodes: "23 épisodes",
    annee: 2021,
    synopsis: "Bojji, jeune prince sourd et muet sans force physique, est moqué par son peuple. Avec son ami Kage, il part pour un périple légendaire afin de devenir le meilleur des rois.",
    pourquoiRegarder: "Un chef-d'œuvre de poésie et d'émotion pure par Wit Studio, avec des combats d'une créativité magistrale.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1347/117616.jpg"
  },
  {
    titre: "Jujutsu Kaisen",
    titreJap: "呪術廻戦",
    genres: ["Action", "Surnaturel", "Démons", "Shonen", "Combats"],
    score: 8.8,
    episodes: "47 épisodes",
    annee: 2020,
    synopsis: "Pour sauver un camarade de classe, le lycéen Yuji Itadori avale un doigt maudit du démon Sukuna, devenant son réceptacle. Il est alors initié aux arcanes de l'exorcisme par Satoru Gojo à l'école des exorcistes de Tokyo.",
    pourquoiRegarder: "Des chorégraphies de combat parmi les plus impressionnantes de l'histoire de l'animation par le studio MAPPA, un rythme effréné et des personnages charismatiques.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg"
  },
  {
    titre: "L'Attaque des Titans (Shingeki no Kyojin)",
    titreJap: "進撃の巨人",
    genres: ["Action", "Dark Fantasy", "Mystère", "Drame", "Militaire"],
    score: 9.1,
    episodes: "89 épisodes",
    annee: 2013,
    synopsis: "Dans un monde où l'humanité restante vit recluse à l'intérieur de trois gigantesques murs pour se protéger des Titans, Eren Jäger jure d'éradiquer tous les titans après la destruction de sa ville natale.",
    pourquoiRegarder: "Une épopée dramatique d'une intensité inégalée, un scénario truffé de révélations et une tension permanente du premier au dernier épisode.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" },
      { nom: "Netflix", url: "https://www.netflix.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
  },
  {
    titre: "Spy x Family",
    titreJap: "SPY×FAMILY",
    genres: ["Comédie", "Action", "Espionnage", "Tranche de vie"],
    score: 8.6,
    episodes: "37 épisodes",
    annee: 2022,
    synopsis: "L'espion d'élite Twilight doit fonder une fausse famille pour sa nouvelle mission. Il adopte Anya, une petite fille télépathe, et épouse Yor, une tueuse à gages redoutable. Aucun d'eux ne connaît le secret des autres.",
    pourquoiRegarder: "Un cocktail parfait d'action d'espionnage, d'humour irrésistible et de tendresse familiale.",
    vf: true,
    vostfr: true,
    plateformes: [
      { nom: "Crunchyroll", url: "https://www.crunchyroll.com" },
      { nom: "Netflix", url: "https://www.netflix.com" }
    ],
    image: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg"
  }
];

// Built-in high-quality fallback database for instant offline search & chat matching
const FALLBACK_ANIMES = [
  {
    titre: "Yona, Princesse de l'aube",
    titreOriginal: "Akatsuki no Yona",
    score: 8.87,
    episodes: "24 ép.",
    genres: ["Royauté", "Princesse", "Aventure", "Romance", "Fantastique", "Shojo"],
    synopsis: "La princesse Yona fuit son palais après la trahison de son cousin et part chercher 4 guerriers dragons légendaires pour reconquérir son royaume.",
    matchReason: "Chef-d'œuvre impérial combinant royauté, princesse courageuse, romance et aventure palpitante en VF sur Crunchyroll.",
    matchPercent: 99,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/10/68749.jpg"
  },
  {
    titre: "Shirayuki aux cheveux rouges (Snow White with the Red Hair)",
    titreOriginal: "Akagami no Shirayuki-hime",
    score: 8.4,
    episodes: "24 ép.",
    genres: ["Royauté", "Princesse", "Romance", "Drame", "Fantastique", "Shojo"],
    synopsis: "Shirayuki, herboriste rousse convoitée par un prince, s'enfuit et tombe amoureuse de Zen, second prince du royaume de Clarines.",
    matchReason: "Romance princière saine, noblesse et univers médiéval chaleureux en VF et VOSTFR.",
    matchPercent: 98,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll", "ADN"],
    image: "https://cdn.myanimelist.net/images/anime/8/75940.jpg"
  },
  {
    titre: "7th Time Loop: The Villainess Enjoys a Carefree Life",
    titreOriginal: "Loop 7-kaime no Akuyaku Reijou",
    score: 8.1,
    episodes: "12 ép.",
    genres: ["Royauté", "Princesse", "Noblesse", "Romance", "Fantasy", "Time Travel"],
    synopsis: "Rishe revit sa 7e vie de fiancée de noble répudiée et accepte d'épouser le prince héritier ennemi pour empêcher la guerre.",
    matchReason: "Protagoniste brillante, intrigue princière et romance stratégique en VF sur Crunchyroll.",
    matchPercent: 96,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1167/140237.jpg"
  },
  {
    titre: "Ranking of Kings (Ousama Ranking)",
    titreOriginal: "Ousama Ranking",
    score: 8.8,
    episodes: "23 ép.",
    genres: ["Royauté", "Prince", "Aventure", "Fantasy", "Émotion"],
    synopsis: "Bojji, prince sourd rejeté par la cour royale, part sur les routes avec Kage pour devenir le plus grand roi du monde.",
    matchReason: "Une merveille d'émotion, de royauté et d'aventure magnifiquement animée par Wit Studio en VF sur Crunchyroll.",
    matchPercent: 97,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1347/117616.jpg"
  },
  {
    titre: "Frieren: Beyond Journey's End",
    titreOriginal: "Sousou no Frieren",
    score: 9.35,
    episodes: "28 ép.",
    genres: ["Aventure", "Fantasy", "Drame", "Tranche de vie"],
    synopsis: "L'elfe Frieren entreprend un voyage initiatique après la mort de ses anciens compagnons pour comprendre les émotions humaines.",
    matchReason: "Chef-d'œuvre incontournable alliant fantasy poétique, magie et émotions universelles.",
    matchPercent: 99,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
  },
  {
    titre: "My Dress-Up Darling (Sexy Cosplay Doll)",
    titreOriginal: "Sono Bisque Doll wa Koi wo Suru",
    score: 8.3,
    episodes: "12 ép.",
    genres: ["Romance", "Comédie romantique", "Cosplay", "Tranche de vie", "School"],
    synopsis: "Wakana Gojo, artisan de poupées Hina timide, confectionne des tenues de cosplay pour la sublime et énergique Marin Kitagawa.",
    matchReason: "Romance moderne vibrante, drôle et touchante avec une VF et une VOSTFR exceptionnelles sur Crunchyroll.",
    matchPercent: 97,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1179/119897.jpg"
  },
  {
    titre: "The Quintessential Quintuplets",
    titreOriginal: "Go-toubun no Hanayome",
    score: 8.1,
    episodes: "24 ép.",
    genres: ["Romance", "Comédie romantique", "Harem", "School"],
    synopsis: "Fûtarô donne des cours particuliers à des sœurs quintuplées réfractaires aux études mais toutes attachantes.",
    matchReason: "Comédie romantique culte avec mystère de la mariée et doublage français intégral sur Crunchyroll.",
    matchPercent: 95,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1792/97213.jpg"
  },
  {
    titre: "Horimiya",
    titreOriginal: "Horimiya",
    score: 8.2,
    episodes: "13 ép.",
    genres: ["Romance", "Comédie romantique", "School", "Tranche de vie"],
    synopsis: "Hori et Miyamura partagent leurs secrets intimes loin des apparences du lycée et tombent sous le charme l'un de l'autre.",
    matchReason: "Romance lycéenne naturelle, sans artifices ni quiproquos inutiles, disponible en VF et VOSTFR.",
    matchPercent: 96,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1695/111486.jpg"
  },
  {
    titre: "L'Attaque des Titans",
    titreOriginal: "Shingeki no Kyojin",
    score: 9.1,
    episodes: "89 ép.",
    genres: ["Action", "Dark Fantasy", "Mystère", "Drame", "Militaire"],
    synopsis: "L'humanité vit recluse derrière trois murs géants pour fuir les Titans dévoreurs d'hommes.",
    matchReason: "Scénario magistral à rebondissements, tension permanente et combats titanesques.",
    matchPercent: 98,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll", "Netflix"],
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
  },
  {
    titre: "Jujutsu Kaisen",
    titreOriginal: "Jujutsu Kaisen",
    score: 8.8,
    episodes: "47 ép.",
    genres: ["Action", "Surnaturel", "Démons", "Shonen", "Combats"],
    synopsis: "Yuji Itadori ingère un doigt du roi des fléaux Sukuna et rejoint l'école des exorcistes de Tokyo.",
    matchReason: "Animation spectaculaire signée MAPPA, chorégraphies de combats fluides et personnages charismatiques.",
    matchPercent: 95,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg"
  },
  {
    titre: "Solo Leveling",
    titreOriginal: "Solo Leveling",
    score: 8.4,
    episodes: "24 ép.",
    genres: ["Action", "Fantasy", "Donjons", "Super-pouvoirs", "Shonen"],
    synopsis: "Sung Jinwoo, chasseur le plus faible du monde, hérite d'une interface de jeu lui permettant de monter de niveau sans limite.",
    matchReason: "Progression grisante, combats explosifs et bande-son percutante par Hiroyuki Sawano sur Crunchyroll.",
    matchPercent: 94,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1170/124302.jpg"
  },
  {
    titre: "A Sign of Affection (Yubisaki to Renren)",
    titreOriginal: "Yubisaki to Renren",
    score: 8.3,
    episodes: "12 ép.",
    genres: ["Romance", "Shoujo", "Tranche de vie", "Université"],
    synopsis: "Yuki, étudiante sourde, découvre un nouveau monde plein de couleurs et d'amour aux côtés d'Itsuomi, un grand voyageur.",
    matchReason: "Romance d'une tendresse et d'une sensibilité exceptionnelles, disponible en VF et VOSTFR.",
    matchPercent: 94,
    vf: true,
    vostfr: true,
    plateformes: ["Crunchyroll"],
    image: "https://cdn.myanimelist.net/images/anime/1760/140445.jpg"
  }
];

// Helper: Smart Local Matcher when Gemini is unavailable or times out
function getSmartLocalMatches(themes: string[], langPref: string, platformPref: string, query: string): any[] {
  const q = (query || "").toLowerCase();
  const themeList = (themes || []).map(t => t.toLowerCase());

  let scored = FALLBACK_ANIMES.map(anime => {
    let score = 50;
    const animeGenres = anime.genres.map(g => g.toLowerCase());
    const animeTitle = anime.titre.toLowerCase();

    // Theme matches
    for (const t of themeList) {
      if (animeGenres.some(g => g.includes(t) || t.includes(g))) {
        score += 20;
      }
    }

    // Query text match
    if (q) {
      if (animeTitle.includes(q)) score += 35;
      if (anime.synopsis.toLowerCase().includes(q)) score += 15;
      if (animeGenres.some(g => q.includes(g))) score += 20;
    }

    // Language preference
    if (langPref === "vf" && anime.vf) score += 15;
    if (langPref === "vostfr" && anime.vostfr) score += 10;

    // Platform preference
    if (platformPref && platformPref !== "any") {
      if (anime.plateformes.some(p => p.toLowerCase().includes(platformPref.toLowerCase()))) {
        score += 25;
      } else {
        score -= 20;
      }
    }

    return {
      ...anime,
      matchPercent: Math.min(99, Math.max(78, score))
    };
  });

  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return scored.slice(0, 3);
}

// In-Memory Cache and Rotation Index for Daily Reco
let serverDailyCache: {
  data: any;
  timestamp: number;
} | null = null;
let dailyRecoPoolIndex = 0;

// API Route: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route: Daily AI Recommendation (Cached, Instant Rotating Fallback & Model Cascaded)
app.get("/api/gemini/daily-reco", async (req, res) => {
  const force = req.query.force === "true";
  const now = Date.now();

  // When forced (user clicks "Autre proposition IA"), advance rotation index immediately
  if (force) {
    dailyRecoPoolIndex = (dailyRecoPoolIndex + 1) % DAILY_RECO_POOL.length;
    const forcedItem = DAILY_RECO_POOL[dailyRecoPoolIndex];
    serverDailyCache = { data: forcedItem, timestamp: now };
    return res.json({ success: true, data: forcedItem, forced: true });
  }

  // Return cached result if fresh (< 4 hours) and not forced
  if (serverDailyCache && now - serverDailyCache.timestamp < 4 * 60 * 60 * 1000) {
    return res.json({ success: true, data: serverDailyCache.data, cached: true });
  }

  // Determine fallback item dynamically (rotates through pool)
  const dayOfYear = Math.floor((now - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const fallbackIndex = (dayOfYear + dailyRecoPoolIndex) % DAILY_RECO_POOL.length;
  const currentFallback = DAILY_RECO_POOL[fallbackIndex] || DAILY_RECO_POOL[0];

  try {
    const prompt = `Tu es un expert critique d'anime (Otaku d'élite). Recommande 1 anime exceptionnel pour aujourd'hui, récent ou classique incontournable mais captivant.
Fournis impérativement un objet JSON valide en respectant scrupuleusement ce schéma :
{
  "titre": "Titre officiel français ou romaji",
  "titreJap": "Titre japonais en kanji/kana si possible",
  "genres": ["Genre1", "Genre2", "Genre3"],
  "score": 8.9,
  "episodes": "12 épisodes ou 24 épisodes ou En cours",
  "annee": 2024,
  "synopsis": "Résumé captivant sans spoiler d'environ 3 à 4 phrases en français.",
  "pourquoiRegarder": "Pourquoi cet anime est unique et vaut le coup d'être regardé immédiatement.",
  "vf": true,
  "vostfr": true,
  "plateformes": [
    { "nom": "Crunchyroll", "url": "https://www.crunchyroll.com" }
  ],
  "image": "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
}
N'inclus aucune plateforme illégale (uniquement Crunchyroll, Netflix, ADN, Disney+, Prime Video).`;

    const text = await generateGeminiSafe({
      contents: prompt,
      isJson: true,
    });

    if (text) {
      try {
        const data = JSON.parse(text);
        if (data && data.titre) {
          serverDailyCache = { data, timestamp: now };
          return res.json({ success: true, data });
        }
      } catch {
        // parsing failed, use fallback
      }
    }

    serverDailyCache = { data: currentFallback, timestamp: now };
    return res.json({ success: true, data: currentFallback, fallback: true });
  } catch (error: any) {
    serverDailyCache = { data: currentFallback, timestamp: now };
    return res.json({ success: true, data: currentFallback, fallback: true });
  }
});

// API Route: Smart Anime Finder (Ultra-Fast with Model Cascade & Instant Fallback)
app.post("/api/gemini/find", async (req, res) => {
  const { themes, langPref, platformPref, query, mood } = req.body || {};

  try {
    const prompt = `Tu es l'assistant de recommandation d'animes ultra-rapide.
Trouve les 3 meilleurs animes correspondant aux critères suivants :
- Thèmes / Genres : ${Array.isArray(themes) && themes.length ? themes.join(", ") : "Tous genres"}
- Préférence linguistique : ${langPref === "vf" ? "Doit disposer d'une VF (Version Française)" : langPref === "vostfr" ? "VOSTFR disponible" : "Peu importe"}
- Plateforme légale : ${platformPref && platformPref !== "any" ? platformPref : "Crunchyroll, Netflix, ADN, Disney+, Prime Video"}
- Ambiance : ${mood || "Standard"}
- Précision : ${query || "Aucune"}

Format JSON strict attendu (tableau de 3 objets) :
[
  {
    "titre": "Titre officiel",
    "titreOriginal": "Titre japonais",
    "score": 8.7,
    "episodes": "12-24 ép.",
    "genres": ["Genre1", "Genre2"],
    "synopsis": "Résumé en français de 2-3 phrases.",
    "matchReason": "Pourquoi cet anime correspond parfaitement à la recherche.",
    "matchPercent": 96,
    "vf": true,
    "vostfr": true,
    "plateformes": ["Crunchyroll", "Netflix"],
    "image": "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
  }
]
Ne cite JAMAIS de plateformes illégales. Uniquement Crunchyroll, Netflix, ADN, Disney+, Prime Video.`;

    const text = await generateGeminiSafe({
      contents: prompt,
      isJson: true,
    });

    if (text) {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          return res.json({ success: true, results: data });
        }
      } catch {
        // json parse fail -> fallback
      }
    }

    const results = getSmartLocalMatches(themes, langPref, platformPref, query);
    return res.json({ success: true, results, fallback: true });
  } catch (error: any) {
    const results = getSmartLocalMatches(themes, langPref, platformPref, query);
    return res.json({ success: true, results, fallback: true });
  }
});

// API Route: Deep Anime Details / Analysis
app.post("/api/gemini/details", async (req, res) => {
  try {
    const { title, synopsis } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: "Titre requis" });
    }

    const fallbackData = {
      analyseIA: `"${title}" offre une expérience immersive portée par une réalisation soignée, une mise en scène rythmée et des personnages marquants.`,
      pointsForts: ["Univers captivant et soigné", "Développement des personnages attachant", "Animation et bande sonore immersives"],
      pointsFaibles: ["Quelques épisodes d'introduction au début"],
      publicCible: "Tous publics et passionnés d'animation japonaise",
      disponibiliteFrance: "Disponible sur Crunchyroll / Netflix / ADN en VOSTFR et VF.",
      animesSimilaires: ["Frieren", "Horimiya", "Jujutsu Kaisen"]
    };

    const prompt = `Donne une analyse critique et des conseils d'expert pour l'anime "${title}".
Synopsis de base : "${synopsis || ""}".
Format JSON attendu :
{
  "analyseIA": "Analyse critique concise de 3 phrases sur les points forts de l'anime, sa mise en scène et ses thématiques.",
  "pointsForts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "pointsFaibles": ["Point faible éventuel"],
  "publicCible": "Public visé (ex: fans de romance, shonen, dark fantasy)",
  "disponibiliteFrance": "Disponibilité VF / VOSTFR en streaming légal",
  "animesSimilaires": ["Titre 1", "Titre 2", "Titre 3"]
}`;

    const text = await generateGeminiSafe({
      contents: prompt,
      isJson: true,
    });

    if (text) {
      try {
        const data = JSON.parse(text);
        if (data && data.analyseIA) {
          return res.json({ success: true, data });
        }
      } catch {
        // parse error -> fallbackData
      }
    }

    return res.json({ success: true, data: fallbackData, fallback: true });
  } catch (error: any) {
    return res.json({
      success: true,
      data: {
        analyseIA: `"${req.body.title || "Cet anime"}" est très apprécié pour son histoire captivante et sa réalisation.`,
        pointsForts: ["Animation fluide", "Personnages attachants", "Bon rythme"],
        publicCible: "Passionnés d'anime",
        disponibiliteFrance: "Disponible en streaming légal VOSTFR/VF.",
        animesSimilaires: ["Frieren", "Solo Leveling"]
      },
      fallback: true
    });
  }
});

// Intelligent Semantic Fallback Generator for Kaiten Sensei Bot
function generateOtakuBotReply(query: string): string {
  const q = (query || "").toLowerCase();
  const wantsVF = q.includes("vf") || q.includes("doublage") || q.includes("francais") || q.includes("français") || q.includes("french");

  // 1. Royauté / Princesse / Palais / Noblesse / Reine
  if (
    q.includes("royaute") ||
    q.includes("royauté") ||
    q.includes("princesse") ||
    q.includes("prince") ||
    q.includes("roi") ||
    q.includes("reine") ||
    q.includes("noble") ||
    q.includes("noblesse") ||
    q.includes("villainess") ||
    q.includes("palais") ||
    q.includes("cour royale")
  ) {
    return `Kon'nichiwa ! Pour le thème **Royauté & Princesse** ${wantsVF ? "avec une excellente Version Française (VF 🇫🇷)" : ""}, voici les pépites absolues à ne pas manquer :

1. **Yona, Princesse de l'aube (Akatsuki no Yona)** (24 épisodes - Crunchyroll)
   - *Genres :* Royauté, Princesse, Aventure, Romance, Shojo, Fantastique
   - *Note :* ⭐ 8.87/10 ${wantsVF ? "• Disponible en VF intégrale" : ""}
   - *Pourquoi regarder :* Après l'assassinat de son père le roi par son cousin bien-aimé, la princesse Yona doit fuir son palais. Elle part chercher les 4 guerriers dragons légendaires pour sauver son royaume. L'une des plus belles évolutions d'héroïne de l'histoire des animes !

2. **Shirayuki aux cheveux rouges (Snow White with the Red Hair)** (24 épisodes - Crunchyroll & ADN)
   - *Genres :* Royauté, Princesse, Romance, Drame, Médiéval
   - *Note :* ⭐ 8.4/10 ${wantsVF ? "• Disponible en VF" : ""}
   - *Pourquoi regarder :* Shirayuki, jeune herboriste rousse convoitée par un prince superficiel, s'enfuit et noue une romance noble et saine avec Zen, second prince du royaume de Clarines.

3. **7th Time Loop: The Villainess Enjoys a Carefree Life** (12 épisodes - Crunchyroll)
   - *Genres :* Royauté, Noblesse, Princesse, Romance, Time Travel
   - *Note :* ⭐ 8.1/10 ${wantsVF ? "• Disponible en VF" : ""}
   - *Pourquoi regarder :* Rishe revit sa vie pour la septième fois et décide d'épouser le prince héritier ennemi Arnold pour éviter la guerre et vivre sa meilleure vie de noble.

4. **Ranking of Kings (Ousama Ranking)** (23 épisodes - Crunchyroll)
   - *Genres :* Royauté, Prince, Aventure, Émotion
   - *Note :* ⭐ 8.8/10 ${wantsVF ? "• Disponible en VF" : ""}
   - *Pourquoi regarder :* L'épopée inoubliable du jeune prince sourd Bojji pour devenir le roi le plus digne et respecté. Animation grandiose signée Wit Studio.

Retrouve toutes leurs fiches complètes avec bandes-annonces directement sur Kaiten Anime ! ✨`;
  }

  // 2. Romance / Comédie Romantique / Shojo
  if (
    q.includes("romance") ||
    q.includes("amour") ||
    q.includes("shojo") ||
    q.includes("shôjo") ||
    q.includes("couple") ||
    q.includes("comédie romantique") ||
    q.includes("romcom")
  ) {
    return `Kon'nichiwa ! Pour de la **Romance captivante** ${wantsVF ? "disponible en VF 🇫🇷" : ""} :

1. **My Dress-Up Darling (Sexy Cosplay Doll)** (12 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.3/10 • Doublage français sublime
   - *Pourquoi :* L'alchimie complice et touchante entre Gojo, créateur timide de poupées Hina, et la solaire Marin Kitagawa.

2. **Horimiya** (13 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.2/10 • Disponible en VF et VOSTFR
   - *Pourquoi :* Une romance lycéenne moderne sans artifices, sincère et rythmée.

3. **A Sign of Affection (Yubisaki to Renren)** (12 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.3/10 • Douceur et sensibilité pure en VF
   - *Pourquoi :* La rencontre pleine de poésie entre une étudiante sourde et un globe-trotteur attentionné.

4. **The Quintessential Quintuplets** (24 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.1/10 • En VF sur Crunchyroll
   - *Pourquoi :* Une comédie romantique culte avec 5 sœurs uniques et le grand mystère de la mariée !`;
  }

  // 3. Dark Fantasy / Sombre / Démons / Titans
  if (
    q.includes("dark fantasy") ||
    q.includes("sombre") ||
    q.includes("gore") ||
    q.includes("titan") ||
    q.includes("demon") ||
    q.includes("démon") ||
    q.includes("jujutsu") ||
    q.includes("berserk")
  ) {
    return `En **Dark Fantasy & univers sombres** ${wantsVF ? "avec VF percutante 🇫🇷" : ""} :

1. **L'Attaque des Titans (Shingeki no Kyojin)** (89 épisodes - Crunchyroll & Netflix)
   - *Note :* ⭐ 9.1/10 • VF et VOSTFR intégrales
   - *Pourquoi :* Un scénario légendaire truffé de révélations et une tension dramatique sans égal.

2. **Jujutsu Kaisen** (47 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.8/10 • Combats au sommet par le studio MAPPA
   - *Pourquoi :* Un univers occulte dynamique et des affrontements d'une fluidité chirurgicale.

3. **Chainsaw Man** (12 épisodes - Crunchyroll)
   - *Note :* ⭐ 8.5/10 • Violent, déjanté et cinématographique.

4. **Vinland Saga** (48 épisodes - Crunchyroll & Netflix)
   - *Note :* ⭐ 8.9/10 • Fresque viking grandiose sur la vengeance et la rédemption.`;
  }

  // 4. Isekai & Réincarnation
  if (
    q.includes("isekai") ||
    q.includes("reincarnation") ||
    q.includes("réincarnation") ||
    q.includes("autre monde") ||
    q.includes("slime") ||
    q.includes("mushoku")
  ) {
    return `Pour les meilleurs **Isekai & Réincarnations** ${wantsVF ? "en VF 🇫🇷" : ""} :

1. **Mushoku Tensei: Jobless Reincarnation** (Crunchyroll)
   - Le sommet du worldbuilding et de l'animation de fantasy moderne.

2. **Moi quand je me réincarne en Slime (Tensura)** (Crunchyroll)
   - Construction d'une nation fantastique, diplomatie et combats jouissifs.

3. **Re:Zero - Starting Life in Another World** (Crunchyroll)
   - Boucles temporelles, suspense psychologique et élection royale.

4. **The Eminence in Shadow** (ADN)
   - Protagoniste surpuissant, hilarant et délicieusement théâtral !`;
  }

  // 5. Animes courts (10-13 épisodes)
  if (
    q.includes("court") ||
    q.includes("12") ||
    q.includes("13") ||
    q.includes("rapide") ||
    q.includes("fini") ||
    q.includes("terminé") ||
    q.includes("binger")
  ) {
    return `Voici d'excellents **animes courts (10 à 13 épisodes)** complets à savourer en un week-end :

1. **Cyberpunk: Edgerunners** (10 épisodes - Netflix)
   - Action pure, animation explosive par Studio Trigger et bande-son inoubliable.

2. **Horimiya** (13 épisodes - Crunchyroll)
   - Romance moderne et feel-good condensée à la perfection.

3. **Erased (Boku dake ga Inai Machi)** (12 épisodes - Crunchyroll & Netflix)
   - Thriller temporel ultra-prenant sur la résolution d'une disparition d'enfance.

4. **Death Parade** (12 épisodes - Crunchyroll)
   - Drame psychologique profond et captivant au bar Quindecim.`;
  }

  // 6. Action & Shonen
  if (
    q.includes("shonen") ||
    q.includes("action") ||
    q.includes("combat") ||
    q.includes("pouvoir") ||
    q.includes("solo leveling") ||
    q.includes("demon slayer")
  ) {
    return `En **Shonen & Action explosive** ${wantsVF ? "avec VF intégrale 🇫🇷" : ""} :

1. **Solo Leveling** (Crunchyroll - VF disponible)
   - La montée en puissance électrisante de Sung Jinwoo animée par A-1 Pictures.

2. **Demon Slayer: Kimetsu no Yaiba** (Crunchyroll & Netflix - VF disponible)
   - Réalisation légendaire par ufotable et souffle héroïque permanent.

3. **Jujutsu Kaisen** (Crunchyroll - VF disponible)
   - Affrontements d'exorcistes ultra-dynamiques et bande-son percutante.

4. **Kaiju No. 8** (Crunchyroll - VF disponible)
   - Monstres géants, armures de combat militaires et humour revigorant.`;
  }

  // Generic fallback with diverse variety
  return `Kon'nichiwa ! Pour répondre à ta recherche sur "${query}", voici d'excellentes recommandations :

1. **Frieren: Beyond Journey's End** (28 épisodes - Crunchyroll)
   - *Fantasy poétique, quête humaine et combats somptueux (noté 9.35/10).*

2. **Solo Leveling** (24 épisodes - Crunchyroll)
   - *Action pure et montée en puissance monumentale.*

3. **Yona, Princesse de l'aube** (24 épisodes - Crunchyroll)
   - *Royauté, princesse courageuse, romance et dragons légendaires.*

4. **My Dress-Up Darling** (12 épisodes - Crunchyroll)
   - *Comédie romantique pétillante avec une VF exceptionnelle.*

N'hésite pas à préciser tes préférences (VF/VOSTFR, Plateforme, Ambiance) ou explore nos filtres thématiques ! ✨`;
}

// API Route: Otaku AI Chat Advisor ("Kaiten Sensei")
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, userMessage } = req.body || {};
  const query = (userMessage || "").toLowerCase();
  const fallbackReply = generateOtakuBotReply(query);

  try {
    const systemInstruction = `Tu es "Kaiten Sensei", le conseiller expert et passionné d'anime de l'application Kaiten Anime.
Tu t'exprimes en français avec clarté, bienveillance et dynamisme.
Prends bien en compte le thème spécifique demandé par l'utilisateur (ex: royauté, princesse, romance, dark fantasy, isekai, shonen) ainsi que ses préférences de langue (VF / VOSTFR) et de plateforme (Crunchyroll, Netflix, ADN).
Donne des réponses structurées avec les titres en gras, le nombre d'épisodes, les genres et pourquoi regarder.
Ne cite JAMAIS de sites pirates ou illégaux.
Sois concis, rapide et percutant.`;

    let conversationPrompt = "";
    if (Array.isArray(messages) && messages.length > 0) {
      const recent = messages.slice(-4);
      for (const m of recent) {
        conversationPrompt += `${m.role === "user" ? "Utilisateur" : "Kaiten Sensei"}: ${m.content}\n`;
      }
    }
    conversationPrompt += `Utilisateur: ${userMessage || "Conseille-moi un anime génial."}\nKaiten Sensei:`;

    const text = await generateGeminiSafe({
      contents: conversationPrompt,
      systemInstruction,
      isJson: false,
    });

    if (text && text.trim().length > 0) {
      return res.json({ success: true, reply: text.trim() });
    }

    return res.json({ success: true, reply: fallbackReply, fallback: true });
  } catch (error: any) {
    return res.json({ success: true, reply: fallbackReply, fallback: true });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kaiten Anime server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


