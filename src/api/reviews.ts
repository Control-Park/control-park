import client from "./client";
import type { Listing } from "../types/listing";

export interface Review {
  id: string;
  reservation_id: string;
  reviewer_id: string;
  target_user_id: string | null;
  target_listing_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  listing_rating?: number | null;
  listing_review_count?: number;
  listing?: Pick<Listing, "id" | "rating" | "review_count">;
  reviewer?: { first_name: string; last_name: string };
  reservation?: { listing?: { title: string } };
}

export interface CompletedReservation {
  id: string;
  listing_id: string;
  listing?: { id: string; title: string };
  guest?: { id: string; first_name: string; last_name: string };
  user_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  role: "host" | "guest";
}

export const fetchUserReviews = async (userId: string): Promise<Review[]> => {
  const res = await client.get<Review[]>(`/reviews/user/${userId}`);
  return res.data;
};

export const fetchPendingReviews = async (): Promise<CompletedReservation[]> => {
  const res = await client.get<CompletedReservation[]>("/reviews/mine/pending");
  return res.data;
};

export interface CreateReviewPayload {
  reservation_id: string;
  rating: number;
  comment?: string;
  target_user_id?: string;
  target_listing_id?: string;
}

export const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
  const res = await client.post<Review>("/reviews", payload);
  return res.data;
};
