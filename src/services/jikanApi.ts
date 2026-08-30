import { Anime } from '../types';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const cache = new Map<string, { data: Anime[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache

export async function searchAnimeLive(query: string, page = 1): Promise<{ animes: Anime[]; hasNextPage: boolean }> {
  const trimmed = query.trim().toLowerCase();
  const cacheKey = `search_${trimmed}_page_${page}`;

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return { animes: cached.data, hasNextPage: cached.data.length >= 10 };
    }
  }

  try {
    const res = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12&sfw=true`);
    if (!res.ok) {
      throw new Error(`Jikan API status: ${res.status}`);
    }

    const json = await res.json();
    const list: any[] = json.data || [];

    const animes: Anime[] = list.map((item: any) => {
      const genres = [
        ...(item.genres || []).map((g: any) => g.name),
        ...(item.themes || []).map((t: any) => t.name),
        ...(item.demographics || []).map((d: any) => d.name)
      ];

      const platforms = (item.streaming || []).map((s: any) => ({
        nom: s.name,
        url: s.url
      }));

      // If no official streaming listed in Jikan, generate standard Google Search / Crunchyroll fallback
      if (platforms.length === 0) {
        platforms.push({
          nom: "Crunchyroll / Recherche Légale",
          url: `https://www.crunchyroll.com/fr/search?q=${encodeURIComponent(item.title)}`
        });
      }

      return {
        id: `mal-${item.mal_id}`,
        titre: item.title_english || item.title,
        titreOriginal: item.title_japanese || item.title,
        titreRomaji: item.title,
        image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
        score: item.score || 7.5,
        scoreMal: item.score || 0,
        episodes: item.episodes || 'En cours',
        dureeEpisode: item.duration || '24 min',
        annee: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 'N/A'),
        statut: item.airing ? 'En cours' : 'Terminé',
        studio: item.studios?.[0]?.name || 'Studio N/A',
        genres: genres.length ? genres : ['Animation'],
        synopsis: item.synopsis || 'Pas de synopsis disponible pour cet anime.',
        vf: true, // In France most major MAL licensed anime have VF or VOSTFR
        vostfr: true,
        plateformes: platforms,
        trailerUrl: item.trailer?.url || (item.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${item.trailer.youtube_id}` : undefined)
      };
    });

    cache.set(cacheKey, { data: animes, timestamp: Date.now() });
    const hasNextPage = Boolean(json.pagination?.has_next_page);

    return { animes, hasNextPage };
  } catch (error) {
    console.warn('Jikan live search failed or rate-limited:', error);
    return { animes: [], hasNextPage: false };
  }
}
