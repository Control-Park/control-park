import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

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
const PROFILE_IMAGE_OVERRIDES_KEY = "local-profile-image-overrides";
const VEHICLE_IMAGE_OVERRIDES_KEY = "local-vehicle-image-overrides";
const LISTING_IMAGE_DIRECTORY =
  FileSystem.documentDirectory ? `${FileSystem.documentDirectory}listing-images/` : null;

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

async function persistLocalImage(imageUri: string, directory: string | null) {
  if (
    !directory ||
    imageUri.startsWith("http://") ||
    imageUri.startsWith("https://") ||
    imageUri.startsWith("data:")
  ) {
    return imageUri;
  }

  try {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const extensionMatch = imageUri.match(/\.[a-zA-Z0-9]+(?:\?|$)/);
    const extension = extensionMatch?.[0]?.replace("?", "") ?? ".jpg";
    const destination = `${directory}${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}${extension}`;

    await FileSystem.copyAsync({ from: imageUri, to: destination });
    return destination;
  } catch {
    return imageUri;
  }
}

export function isPersistentListingImageUri(imageUri: string) {
  return !!LISTING_IMAGE_DIRECTORY && imageUri.startsWith(LISTING_IMAGE_DIRECTORY);
}

export async function persistListingImage(imageUri: string) {
  return persistLocalImage(imageUri, LISTING_IMAGE_DIRECTORY);
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
  next[listingId] = await persistListingImage(imageUri);
  await writeOverrideMap(LISTING_IMAGE_OVERRIDES_KEY, next);
}

export async function removeListingImageOverride(listingId: string) {
  const next = await getListingImageOverrides();
  delete next[listingId];
  await writeOverrideMap(LISTING_IMAGE_OVERRIDES_KEY, next);
}

export async function getProfileImageOverrides(): Promise<Record<string, string>> {
  return readOverrideMap(PROFILE_IMAGE_OVERRIDES_KEY);
}

export async function saveProfileImageOverride(userId: string, imageUri: string) {
  const next = await getProfileImageOverrides();
  next[userId] = imageUri;
  await writeOverrideMap(PROFILE_IMAGE_OVERRIDES_KEY, next);
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
