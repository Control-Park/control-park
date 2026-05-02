import client from "./client";
import { Listing } from "../types/listing";
import axios from "axios";
import {
  applyListingImageOverrides,
  removeListingImageOverride,
  saveListingImageOverride,
} from "../utils/localImagePersistence";

export interface ListingSearchParams {
  availability?: string;
  location?: string;
  name?: string;
  priceMax?: number;
  priceMin?: number;
}

// LISTINGS:
export const fetchListings = async (params?: ListingSearchParams): Promise<Listing[]> => {
  try {
    const res = await client.get("/listings", { params });

    if (Array.isArray(res.data)) {
      return applyListingImageOverrides(res.data as Listing[]);
    }

    if (Array.isArray(res.data.listings)) {
      return applyListingImageOverrides(res.data.listings as Listing[]);
    }

    if (Array.isArray(res.data.data)) {
      return applyListingImageOverrides(res.data.data as Listing[]);
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
  const imageUri = typeof listingData.images?.[0] === "string" ? listingData.images[0] : null;
  if (imageUri) {
    await saveListingImageOverride(data.id, imageUri);
    return {
      ...data,
      images: [imageUri],
    };
  }
  return data;
};

export const fetchListingById = async (id: string): Promise<Listing> => {
  const { data } = await client.get(`/listings/${id}`);
  const [listing] = await applyListingImageOverrides([data as Listing]);
  return listing;
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

export const updateListing = async (id: string, payload: Partial<Listing>): Promise<Listing> => {
  const { data } = await client.patch<Listing>(`/listings/${id}`, payload);
  const imageUri = typeof payload.images?.[0] === "string" ? payload.images[0] : null;
  if (imageUri) {
    await saveListingImageOverride(id, imageUri);
    return {
      ...data,
      images: [imageUri],
    };
  }

  const [listing] = await applyListingImageOverrides([data]);
  return listing;
};

export const deleteListing = async (id: string): Promise<void> => {
  await client.delete(`/listings/${id}`);
  await removeListingImageOverride(id);
};

export const fetchMyListings = async (): Promise<Listing[]> => {
  const { data } = await client.get<Listing[]>("/listings/mine");
  return applyListingImageOverrides(data);
};

export const saveListingAsDraft = async (payload: Partial<Listing> & { title: string }): Promise<Listing> => {
  const { data } = await client.post<Listing>("/listings/draft", payload);
  const imageUri = typeof payload.images?.[0] === "string" ? payload.images[0] : null;
  if (imageUri) {
    await saveListingImageOverride(data.id, imageUri);
    return {
      ...data,
      images: [imageUri],
    };
  }
  return data;
};

// RESERVATIONS:
