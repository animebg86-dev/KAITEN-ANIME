import React, { useState } from 'react';
import { ALL_THEMES, THEME_CATEGORIES } from '../data/themesData';
import { Search, X, Check, Filter } from 'lucide-react';

interface ThemeChipsSelectorProps {
  selectedThemes: Set<string>;
  onToggleTheme: (theme: string) => void;
  onClearThemes: () => void;
  maxHeight?: string;
}

export const ThemeChipsSelector: React.FC<ThemeChipsSelectorProps> = ({
  selectedThemes,
  onToggleTheme,
  onClearThemes,
  maxHeight = "max-h-56"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredThemes = ALL_THEMES.filter(theme => {
    const matchesSearch = theme.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    const cat = THEME_CATEGORIES.find(c => c.nom === activeCategory);
    return cat ? cat.themes.includes(theme) : true;
  });

  return (
    <div className="bg-[#14162e] border border-[#262a54] rounded-xl p-4 shadow-md">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#22254b]">
        {/* Search inside themes */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer parmi les 80+ thèmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1d2042] text-slate-200 rounded-lg border border-[#32376b] focus:outline-none focus:border-[#e94560]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action badges: selected count + clear */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedThemes.size > 0 ? (
            <>
              <span className="text-xs font-bold bg-[#e94560]/20 text-[#ff8097] border border-[#e94560]/40 px-2.5 py-1 rounded-md">
                {selectedThemes.size} sélectionné{selectedThemes.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={onClearThemes}
                className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded bg-[#202347] hover:bg-[#2c305c] transition-colors border border-[#303566]"
              >
                Effacer tout
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Cliquez pour choisir un ou plusieurs thèmes
            </span>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-[#e94560] text-white'
              : 'bg-[#1b1e3d] text-slate-300 hover:bg-[#252952]'
          }`}
        >
          Tous les thèmes ({ALL_THEMES.length})
        </button>
        {THEME_CATEGORIES.map(cat => (
          <button
            key={cat.nom}
            onClick={() => setActiveCategory(cat.nom)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.nom
                ? 'bg-[#e94560] text-white'
                : 'bg-[#1b1e3d] text-slate-300 hover:bg-[#252952]'
            }`}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {/* Chips list */}
      <div className={`flex flex-wrap gap-1.5 overflow-y-auto ${maxHeight} pr-1 scrollbar-thin`}>
        {filteredThemes.length === 0 ? (
          <div className="w-full py-4 text-center text-xs text-slate-400">
            Aucun thème trouvé pour "{searchTerm}"
          </div>
        ) : (
          filteredThemes.map(theme => {
            const isSelected = selectedThemes.has(theme);
            return (
              <button
                key={theme}
                type="button"
                onClick={() => onToggleTheme(theme)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none border ${
                  isSelected
                    ? 'bg-[#e94560] text-white border-[#e94560] shadow-sm shadow-[#e94560]/40 scale-[1.03]'
                    : 'bg-[#1d2042] text-slate-300 border-[#2d3263] hover:bg-[#262b59] hover:border-[#3e4484] hover:text-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{theme}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
