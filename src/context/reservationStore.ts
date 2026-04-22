import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";

export type ReservationStatus = "Active" | "Upcoming" | "Expired";

export type ReservationRecord = {
  id: string;
  listingId: string;
  reservedFrom: string;
  reservedUntil: string;
  createdAt: string;
};

type ReservationStore = {
  dismissedCancelledIds: string[];
  reservations: ReservationRecord[];
  addReservation: (
    reservation: Omit<ReservationRecord, "id" | "createdAt">,
  ) => void;
  dismissCancelledReservation: (reservationId: string) => void;
  hydrateDismissedReservations: () => Promise<void>;
  removeReservation: (reservationId: string) => void;
};

const DISMISSED_STORAGE_KEY = "dismissed-reservations";

const parseDismissedIds = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const getInitialDismissedIds = () => {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return [];
  }

  return parseDismissedIds(window.localStorage.getItem(DISMISSED_STORAGE_KEY));
};

const persistDismissedIds = async (ids: string[]) => {
  const serialized = JSON.stringify(ids);

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, serialized);
    return;
  }

  await AsyncStorage.setItem(DISMISSED_STORAGE_KEY, serialized);
};

export const useReservationStore = create<ReservationStore>((set, get) => ({
  dismissedCancelledIds: getInitialDismissedIds(),
  reservations: [],
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [
        {
          id: `res-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...reservation,
        },
        ...state.reservations,
      ],
    })),
  dismissCancelledReservation: (reservationId) => {
    const currentIds = get().dismissedCancelledIds;
    const nextIds = currentIds.includes(reservationId)
      ? currentIds
      : [...currentIds, reservationId];

    set({ dismissedCancelledIds: nextIds });
    void persistDismissedIds(nextIds);
  },
  hydrateDismissedReservations: async () => {
    if (Platform.OS === "web") {
      set({
        dismissedCancelledIds: getInitialDismissedIds(),
      });
      return;
    }

    const storedValue = await AsyncStorage.getItem(DISMISSED_STORAGE_KEY);
    set({
      dismissedCancelledIds: parseDismissedIds(storedValue),
    });
  },
  removeReservation: (reservationId) =>
    set((state) => ({
      reservations: state.reservations.filter(
        (reservation) => reservation.id !== reservationId,
      ),
    })),
}));
