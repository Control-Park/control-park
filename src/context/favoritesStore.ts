import { create } from "zustand";

type FavoritesStore = {
  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  favorites: {},
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: { ...state.favorites, [id]: !state.favorites[id] },
    })),
}));
