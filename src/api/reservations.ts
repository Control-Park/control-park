import client from "./client";
import { applyReservationListingImageOverrides } from "../utils/localImagePersistence";

export type ApprovalStatus = "approved" | "cancelled" | "pending" | "rejected";
export type ReservationStatus = "active" | "approved" | "cancelled" | "expired" | "pending" | "rejected" | "upcoming";

export interface ReservationListing {
  address: string;
  host_id: string;
  id: string;
  images: string[];
  price_per_hour: number;
  title: string;
}

export interface Reservation {
  approval_status: ApprovalStatus;
  created_at: string;
  end_time: string;
  guest?: { email: string; first_name: string; id: string; last_name: string };
  id: string;
  listing?: ReservationListing;
  listing_id: string;
  payment_intent_id: null | string;
  payment_method_id: null | string;
  start_time: string;
  status: ReservationStatus;
  total_price: number;
  updated_at: string;
  user_id: string;
  vehicle_id: null | string;
}

export interface CreateReservationPayload {
  end_time: string;
  listing_id: string;
  payment_method_id: string;
  start_time: string;
  vehicle_id: string;
}

export const fetchReservations = async (): Promise<Reservation[]> => {
  const res = await client.get<Reservation[]>("/reservations");
  return applyReservationListingImageOverrides(res.data);
};

export const fetchHostingReservations = async (): Promise<Reservation[]> => {
  const res = await client.get<Reservation[]>("/reservations/hosting");
  return res.data;
};

export const createReservation = async (payload: CreateReservationPayload): Promise<Reservation> => {
  const res = await client.post<Reservation>("/reservations", payload);
  return res.data;
};

export const approveReservation = async (id: string): Promise<Reservation> => {
  const res = await client.patch<Reservation>(`/reservations/${id}/approve`);
  return res.data;
};

export const rejectReservation = async (id: string): Promise<Reservation> => {
  const res = await client.patch<Reservation>(`/reservations/${id}/reject`);
  return res.data;
};

export const cancelReservation = async (id: string): Promise<Reservation> => {
  const res = await client.patch<Reservation>(`/reservations/${id}/cancel`);
  return res.data;
};

export interface HostStats {
  completed_bookings: number;
  wallet_balance: number;
}

export const fetchHostStats = async (): Promise<HostStats> => {
  const res = await client.get<HostStats>("/reservations/host/stats");
  return res.data;
};

export interface BookedRange {
  end_time: string;
  start_time: string;
}

export const fetchBookedRanges = async (listingId: string): Promise<BookedRange[]> => {
  const res = await client.get<BookedRange[]>(`/reservations/listing/${listingId}/booked`);
  return res.data;
};

export const fetchReservationForHost = async (id: string): Promise<Reservation> => {
  const res = await client.get<Reservation>(`/reservations/${id}/for-host`);
  return res.data;
};
