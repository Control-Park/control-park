import client from "./client";
import { Listing } from "../types/listing";
import { lotsNearYou, parkingLots } from "../data/mockListings";
import axios from "axios";

// LISTINGS:
export const fetchListings = async (): Promise<Listing[]> => {
  try {
    const res = await client.get("/listings");

    if (Array.isArray(res.data)) {
      return res.data;
    }

    if (Array.isArray(res.data.listings)) {
      return res.data.listings;
    }

    if (Array.isArray(res.data.data)) {
      return res.data.data;
    }

    throw new Error("Expected /listings to return an array");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error details:", err);

      if (err.response) {
        throw new Error(
          `Request failed: ${err.response.status} ${err.response.statusText}`,
        );
      }

      if (err.request) {
        throw new Error(
          "Could not reach the server. It may be down, the URL may be wrong, or CORS may be blocking the request.",
        );
      }
    }

    throw err;
  }
};

export const createNewListing = async (
  listingData: Partial<Listing>,
): Promise<Listing> => {
  const { data } = await client.post(`/listings`, listingData);
  return data;
};

export const fetchListingById = async (id: string): Promise<Listing> => {
  const { data } = await client.get(`/listings/${id}`);
  return data;
};

export const reportListing = async (
  id: string,
): Promise<void> => {
  const { data } = await client.post(`/listings/${id}/report`);
  return data;
};

export const saveListing = async (id: string): Promise<void> => {
  const { data } = await client.post(`/listings/${id}/save`);
  return data;
};

export const unsaveListing = async (id: string): Promise<void> => {
  const { data } = await client.delete(`/listings/${id}/save`);
  return data;
};

// RESERVATIONS:
