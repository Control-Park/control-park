import AsyncStorage from "@react-native-async-storage/async-storage";

type ListingLike = {
  id: string;
  images?: unknown[];
};

type ReservationLike = {
  listing?: {
    id: string;
    images?: string[];
  };
};

const LISTING_IMAGE_OVERRIDES_KEY = "local-listing-image-overrides";
const VEHICLE_IMAGE_OVERRIDES_KEY = "local-vehicle-image-overrides";

async function readOverrideMap(key: string): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeOverrideMap(key: string, value: Record<string, string>) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function normalizePickedImage(asset: {
  base64?: null | string;
  mimeType?: null | string;
  uri: string;
}): string {
  if (asset.base64) {
    return `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
  }

  return asset.uri;
}

export async function getVehicleImageOverrides(): Promise<Record<string, string>> {
  return readOverrideMap(VEHICLE_IMAGE_OVERRIDES_KEY);
}

export async function saveVehicleImageOverride(vehicleId: string, imageUri: string) {
  const next = await getVehicleImageOverrides();
  next[vehicleId] = imageUri;
  await writeOverrideMap(VEHICLE_IMAGE_OVERRIDES_KEY, next);
}

export async function removeVehicleImageOverride(vehicleId: string) {
  const next = await getVehicleImageOverrides();
  delete next[vehicleId];
  await writeOverrideMap(VEHICLE_IMAGE_OVERRIDES_KEY, next);
}

export async function getListingImageOverrides(): Promise<Record<string, string>> {
  return readOverrideMap(LISTING_IMAGE_OVERRIDES_KEY);
}

export async function saveListingImageOverride(listingId: string, imageUri: string) {
  const next = await getListingImageOverrides();
  next[listingId] = imageUri;
  await writeOverrideMap(LISTING_IMAGE_OVERRIDES_KEY, next);
}

export async function removeListingImageOverride(listingId: string) {
  const next = await getListingImageOverrides();
  delete next[listingId];
  await writeOverrideMap(LISTING_IMAGE_OVERRIDES_KEY, next);
}

export async function applyListingImageOverrides<T extends ListingLike>(listings: T[]): Promise<T[]> {
  const overrides = await getListingImageOverrides();

  return listings.map((listing) => {
    const override = overrides[listing.id];
    if (!override) {
      return listing;
    }

    return {
      ...listing,
      images: [override],
    };
  });
}

export async function applyReservationListingImageOverrides<T extends ReservationLike>(
  reservations: T[],
): Promise<T[]> {
  const overrides = await getListingImageOverrides();

  return reservations.map((reservation) => {
    const listingId = reservation.listing?.id;
    if (!listingId) {
      return reservation;
    }

    const override = overrides[listingId];
    if (!override || !reservation.listing) {
      return reservation;
    }

    return {
      ...reservation,
      listing: {
        ...reservation.listing,
        images: [override],
      },
    };
  });
}
