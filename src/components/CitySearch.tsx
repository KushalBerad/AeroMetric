import React, { useState, useEffect } from "react";
import { Search, Navigation, Heart, Trash2, HelpCircle } from "lucide-react";
import { FavoriteCity } from "../types";

interface CitySearchProps {
  onSearch: (city: string) => void;
  onGeolocate: () => void;
  currentCity: string;
  isSearching: boolean;
  onSelectFavorite: (city: FavoriteCity) => void;
}

const PRESET_CITIES: FavoriteCity[] = [
  { city: "London", country: "GB" },
  { city: "Tokyo", country: "JP" },
  { city: "New York", country: "US" },
  { city: "Dubai", country: "AE" },
  { city: "Sydney", country: "AU" },
];

export default function CitySearch({
  onSearch,
  onGeolocate,
  currentCity,
  isSearching,
  onSelectFavorite,
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem("weather_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    } else {
      setFavorites(PRESET_CITIES);
    }
  }, []);

  const saveFavorites = (newFavs: FavoriteCity[]) => {
    setFavorites(newFavs);
    localStorage.setItem("weather_favorites", JSON.stringify(newFavs));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const toggleFavorite = () => {
    const cleaned = currentCity.trim();
    if (!cleaned) return;
    
    const isFav = favorites.some((f) => f.city.toLowerCase() === cleaned.toLowerCase());
    if (isFav) {
      const filtered = favorites.filter((f) => f.city.toLowerCase() !== cleaned.toLowerCase());
      saveFavorites(filtered);
    } else {
      const added = [...favorites, { city: cleaned, country: "Global" }];
      saveFavorites(added);
    }
  };

  const deleteFavorite = (cityToDelete: string) => {
    const filtered = favorites.filter((f) => f.city.toLowerCase() !== cityToDelete.toLowerCase());
    saveFavorites(filtered);
  };

  const isCurrentFavorite = favorites.some((f) => f.city.toLowerCase() === currentCity.toLowerCase());

  return (
    <div id="city-search" className="w-full space-y-4">
      {/* Top Search bar block */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            id="city-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for global cities (e.g. Paris, Tokyo, London)..."
            className="w-full pl-11 pr-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 font-sans transition-all duration-300"
          />
          {isSearching && (
            <div className="absolute right-3 top-3.5 flex items-center space-x-1.5" id="loader">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs text-cyan-400 font-mono">Syncing...</span>
            </div>
          )}
        </form>

        <div className="flex gap-2">
          {/* Geolocation Button */}
          <button
            type="button"
            id="btn-geolocate"
            onClick={onGeolocate}
            title="Use current location"
            className="flex items-center justify-center p-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl active:scale-95 transition-all duration-200"
          >
            <Navigation className="h-5 w-5" />
            <span className="ml-2 hidden md:inline text-xs font-semibold uppercase tracking-wider font-display">Local</span>
          </button>

          {/* Add Favorite Button */}
          <button
            type="button"
            id="btn-favorite"
            onClick={toggleFavorite}
            disabled={!currentCity}
            title={isCurrentFavorite ? "Remove from favorite cities" : "Add to favorite cities"}
            className={`flex items-center justify-center p-3.5 border rounded-2xl active:scale-95 transition-all duration-200 ${
              isCurrentFavorite
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Heart className={`h-5 w-5 ${isCurrentFavorite ? "fill-rose-400" : ""}`} />
            <span className="ml-2 hidden md:inline text-xs font-semibold uppercase tracking-wider font-display">
              {isCurrentFavorite ? "Saved" : "Save"}
            </span>
          </button>
        </div>
      </div>

      {/* Suggested Favorites Row */}
      <div id="favorites-container" className="flex items-center space-x-2 overflow-x-auto pb-1 select-none">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-display whitespace-nowrap">Favorites:</span>
        <div className="flex gap-2">
          {favorites.map((fav, index) => {
            const isSelected = fav.city.toLowerCase() === currentCity.toLowerCase();
            return (
              <div
                key={index}
                id={`fav-city-${fav.city.toLowerCase()}`}
                className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-white/10 border-white/30 text-white scale-102"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15"
                }`}
              >
                <span onClick={() => onSelectFavorite(fav)} className="font-sans">
                  {fav.city} {fav.country ? `(${fav.country})` : ""}
                </span>
                
                {/* Delete button option */}
                <button
                  type="button"
                  id={`btn-delete-${fav.city.toLowerCase()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFavorite(fav.city);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400 transition-opacity duration-200"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {favorites.length === 0 && (
            <span className="text-xs text-slate-500 italic">No favorite cities saved.</span>
          )}
        </div>
      </div>
    </div>
  );
}
