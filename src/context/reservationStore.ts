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
  reservations: ReservationRecord[];
  addReservation: (
    reservation: Omit<ReservationRecord, "id" | "createdAt">,
  ) => void;
  removeReservation: (reservationId: string) => void;
};

export const useReservationStore = create<ReservationStore>((set) => ({
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
  removeReservation: (reservationId) =>
    set((state) => ({
      reservations: state.reservations.filter(
        (reservation) => reservation.id !== reservationId,
      ),
    })),
}));
