import { ThemeCategory } from '../types';

export const ALL_THEMES: string[] = [
  // Shonen / Seinen / Démographies
  'Shonen', 'Seinen', 'Shojo', 'Josei',
  
  // Genres majeurs
  'Action', 'Aventure', 'Comédie', 'Drame', 'Fantastique', 'Romance',
  'Horreur', 'Mystère', 'Psychologique', 'Surnaturel', 'Tranche de vie',
  'Sci-Fi', 'Thriller', 'Sports', 'Mecha', 'Musique',

  // Sous-genres & Tropes
  'Isekai', 'Cyberpunk', 'Post-apocalyptique', 'Dark Fantasy', 'Steampunk',
  'Magical Girl', 'Super Power', 'Ecchi', 'Harem', 'Slice of Life',
  'Time Travel', 'Réincarnation', 'Jeu vidéo', 'Virtuel',
  'Royauté', 'Princesse', 'Noblesse', 'Royaume', 'Médiéval', 'Villainess',

  // Settings & Univers
  'Espace', 'Militaire', 'Historique', 'School', 'École', 'Université',
  'Travail', 'Vie quotidienne', 'Campagne', 'Ville', 'Nature', 'Prison',
  'École magique',

  // Fantastique & Mythologie
  'Magie', 'Alchimie', 'Nécromancie', 'Démons', 'Anges', 'Dieux',
  'Monstres', 'Vampire', 'Zombie', 'Yokai', 'Esprits', 'Mythologie',
  'Folklore', 'Créatures fantastiques', 'Dragons',

  // Action & Combats
  'Arts martiaux', 'Samouraï', 'Ninjas', 'Pirates', 'Combats', 'Tournois',
  'Pouvoirs psychiques', 'Guerre', 'Survie', 'Assassinat',

  // Société & Enquêtes
  'Policier', 'Judiciaire', 'Médical', 'Détective', 'Enquête',
  'Espionnage', 'Gangs', 'Mafia', 'Yakuza', 'Politique', 'Économie',
  'Cuisine', 'Voyage', 'Otaku', 'Idols',

  // Émotions & Relations
  'Amitié', 'Famille', 'Vengeance', 'Tragédie', 'Comédie romantique', 'Catastrophe'
];

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    nom: "Action & Aventure",
    icon: "Swords",
    themes: ["Action", "Aventure", "Arts martiaux", "Samouraï", "Ninjas", "Pirates", "Combats", "Tournois", "Super Power", "Guerre", "Survie", "Assassinat"]
  },
  {
    nom: "Fantastique & Magie",
    icon: "Sparkles",
    themes: ["Fantastique", "Dark Fantasy", "Magie", "Isekai", "Démons", "Anges", "Dieux", "Monstres", "Vampire", "Zombie", "Yokai", "Esprits", "Mythologie", "Folklore", "Dragons", "Alchimie", "Magical Girl"]
  },
  {
    nom: "Sci-Fi & Futurisme",
    icon: "Bot",
    themes: ["Sci-Fi", "Cyberpunk", "Mecha", "Espace", "Time Travel", "Post-apocalyptique", "Steampunk", "Jeu vidéo", "Virtuel", "Pouvoirs psychiques"]
  },
  {
    nom: "Suspense & Psychologique",
    icon: "Brain",
    themes: ["Psychologique", "Mystère", "Thriller", "Horreur", "Détective", "Enquête", "Policier", "Judiciaire", "Espionnage", "Gangs", "Mafia", "Yakuza", "Vengeance", "Prison"]
  },
  {
    nom: "Romance & Émotions",
    icon: "Heart",
    themes: ["Romance", "Comédie romantique", "Drame", "Tragédie", "Amitié", "Famille", "Harem", "Shojo", "Josei"]
  },
  {
    nom: "Tranche de vie & Comédie",
    icon: "Coffee",
    themes: ["Tranche de vie", "Slice of Life", "Comédie", "School", "École", "Université", "Travail", "Vie quotidienne", "Musique", "Sports", "Cuisine", "Voyage", "Otaku", "Idols", "Animaux"]
  }
];

export const POPULAR_MOODS = [
  { id: "epic", label: "🔥 Épique & Intense", desc: "Combats monumentaux et adrénaline" },
  { id: "mindgame", label: "🧠 Mindgames & Stratégie", desc: "Échecs psychologiques et retournements de situation" },
  { id: "chill", label: "🌿 Détente & Feel Good", desc: "Tranche de vie apaisante et bienveillante" },
  { id: "emotional", label: "💧 Émouvant & Poignant", desc: "Histoires touchantes et larmes garanties" },
  { id: "funny", label: "😂 Hilarant & Déjanté", desc: "Rires, quiproquos et humour absurde" },
  { id: "dark", label: "🌑 Sombre & Mystérieux", desc: "Atmosphère oppressante et thématiques matures" }
];
