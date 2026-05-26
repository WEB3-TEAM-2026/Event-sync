"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextType {
  favorites: string[];
  toggle: (sessionId: string) => void;
  isFavorite: (sessionId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggle: () => {},
  isFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("eventsync_favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  function toggle(sessionId: string) {
    setFavorites((prev) => {
      const next = prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId];
      try {
        localStorage.setItem("eventsync_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function isFavorite(sessionId: string) {
    return favorites.includes(sessionId);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
