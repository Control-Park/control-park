export type Listing = {
  id: string;
  host_id: string;
  structure_name: string;
  address: string;
  parking_type: string;
  price_per_hour: number;
  amenities: string[];
  images: any[];
  available_from: string;
  available_until: string;
  is_active: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  perks: string[];
  incentives: string[];
  // UI display fields - not from API
  subHeading?: string[];
  subtitle?: string;
  isGuestFavorite?: boolean;
  isFavorited?: boolean;
  rating?: number;
  reviewCount?: number;
  host?: { name: string; type: string };
  isPopular?: boolean;
  originalPrice?: number;
  price?: number;
}