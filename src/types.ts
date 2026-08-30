export type WatchStatus = 'watching' | 'plan_to_watch' | 'completed' | 'favorite';

export interface PlatformLink {
  nom: string;
  url: string;
  badgeColor?: string;
}

export interface Anime {
  id: string | number;
  titre: string;
  titreOriginal?: string;
  titreRomaji?: string;
  image: string;
  bannerImage?: string;
  score: number;
  scoreMal?: number;
  episodes: string | number;
  dureeEpisode?: string;
  annee: number | string;
  saison?: string;
  statut: 'En cours' | 'Terminé' | 'À venir';
  studio?: string;
  genres: string[];
  synopsis: string;
  vf: boolean;
  vostfr: boolean;
  plateformes: PlatformLink[];
  trailerUrl?: string;
  source?: string;
}

export interface AiRecommendationResult {
  titre: string;
  titreOriginal?: string;
  score: number;
  episodes: string;
  genres: string[];
  synopsis: string;
  matchReason: string;
  matchPercent: number;
  vf: boolean;
  vostfr: boolean;
  plateformes: string[];
  imageKeywords?: string;
  image?: string;
}

export interface DailyRecoData {
  titre: string;
  titreJap?: string;
  genres: string[];
  score: number;
  episodes: string;
  annee: number;
  synopsis: string;
  pourquoiRegarder: string;
  vf: boolean;
  vostfr: boolean;
  plateformes: PlatformLink[];
  image: string;
}

export interface WatchlistItem {
  anime: Anime;
  status: WatchStatus;
  userRating?: number;
  addedAt: string;
}

export interface ThemeCategory {
  nom: string;
  icon: string;
  themes: string[];
}

export interface AiDetailedAnalysis {
  analyseIA: string;
  pointsForts: string[];
  pointsFaibles?: string[];
  publicCible: string;
  disponibiliteFrance: string;
  animesSimilaires: string[];
}
