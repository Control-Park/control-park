import client, { apiBaseUrl } from "./client";
import { Listing } from "../types/listing";
import axios from "axios";
import {
  applyListingImageOverrides,
  persistListingImage,
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

function withoutImages(payload: Partial<Listing>): Partial<Listing> {
  const { images: _images, ...rest } = payload;
  return rest;
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
  const uploadedImageUri =
    typeof listingData.images?.[0] === "string"
      ? await persistListingImage(listingData.images[0])
      : null;
  const payload = uploadedImageUri
    ? {
        ...withoutImages(listingData),
        images: [uploadedImageUri],
      }
    : listingData;

  console.log("POST /listings", {
    baseURL: apiBaseUrl,
    hasImage: !!uploadedImageUri,
  });

  const { data } = await client.post(`/listings`, payload);
  if (uploadedImageUri) {
    await saveListingImageOverride(data.id, uploadedImageUri);
    return {
      ...data,
      images: [uploadedImageUri],
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
  const uploadedImageUri =
    typeof payload.images?.[0] === "string"
      ? await persistListingImage(payload.images[0])
      : null;
  const requestPayload = uploadedImageUri
    ? {
        ...withoutImages(payload),
        images: [uploadedImageUri],
      }
    : payload;

  const { data } = await client.patch<Listing>(`/listings/${id}`, requestPayload);
  if (uploadedImageUri) {
    await saveListingImageOverride(id, uploadedImageUri);
    return {
      ...data,
      images: [uploadedImageUri],
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
  const uploadedImageUri =
    typeof payload.images?.[0] === "string"
      ? await persistListingImage(payload.images[0])
      : null;
  const requestPayload = uploadedImageUri
    ? {
        ...withoutImages(payload),
        images: [uploadedImageUri],
      }
    : payload;

  console.log("POST /listings/draft", {
    baseURL: apiBaseUrl,
    hasImage: !!uploadedImageUri,
  });

  const { data } = await client.post<Listing>("/listings/draft", requestPayload);
  if (uploadedImageUri) {
    await saveListingImageOverride(data.id, uploadedImageUri);
    return {
      ...data,
      images: [uploadedImageUri],
    };
  }

  return data;
};

// RESERVATIONS:
