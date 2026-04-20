'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext({});

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem('favorites');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (product) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFavorite = (productId) => {
    setFavorites(prev => prev.filter(f => f.id !== productId));
  };

  const toggleFavorite = (product) => {
    if (favorites.find(f => f.id === product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  return (
    <FavoritesContext.Provider value={{
      favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, totalFavorites: favorites.length
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
