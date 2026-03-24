import client from "./client";
import { Listing } from "../types/listing";
import { lotsNearYou, parkingLots } from "../data/mockListings";

// LISTINGS:
export const fetchListings = async (): Promise<Listing[]> => {
  //   const {data} = await client.post(`/listings`);;
  //   return data;

  //   TEMPORARY:
  return [...parkingLots, ...lotsNearYou];
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
  reason: string,
): Promise<void> => {
  const { data } = await client.post(`/listings/${id}/report`, { reason });
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
