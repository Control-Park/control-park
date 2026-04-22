import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  removeReservation: (reservationId: string) => void;
};

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set) => ({
      dismissedCancelledIds: [],
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
      dismissCancelledReservation: (reservationId) =>
        set((state) => ({
          dismissedCancelledIds: state.dismissedCancelledIds.includes(
            reservationId,
          )
            ? state.dismissedCancelledIds
            : [...state.dismissedCancelledIds, reservationId],
        })),
      removeReservation: (reservationId) =>
        set((state) => ({
          reservations: state.reservations.filter(
            (reservation) => reservation.id !== reservationId,
          ),
        })),
    }),
    {
      name: "reservation-store",
      partialize: (state) => ({
        dismissedCancelledIds: state.dismissedCancelledIds,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
