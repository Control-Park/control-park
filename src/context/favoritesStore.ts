import { create } from "zustand";
import type { Listing } from "../types/listing";

type FavoritesStore = {
  favorites: Record<string, boolean>;
  hydrateFavorites: (listings: Listing[]) => void;
  setFavorite: (id: string, value: boolean) => void;
  toggleFavorite: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  favorites: {},
  hydrateFavorites: (listings) =>
    set((state) => {
      const nextFavorites = { ...state.favorites };

      listings.forEach((listing) => {
        if (typeof listing.is_saved === "boolean") {
          nextFavorites[listing.id] = listing.is_saved;
        }
      });

      return { favorites: nextFavorites };
    }),
  setFavorite: (id, value) =>
    set((state) => ({
      favorites: { ...state.favorites, [id]: value },
    })),
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: { ...state.favorites, [id]: !state.favorites[id] },
    })),
}));
