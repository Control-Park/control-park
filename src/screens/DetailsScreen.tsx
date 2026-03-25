import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;
import ListingImage from "../components/listing/ListingImage";
import ListingHeader from "../components/listing/ListingHeader";
import ListingPerks from "../components/listing/ListingPerks";
import ListingDescription from "../components/listing/ListingDescription";
import ListingAmenities from "../components/listing/ListingAmenities";
import ListingBooking from "../components/listing/ListingBooking";
import { useWindowDimensions } from "react-native";

import ReportButton from "../components/ReportButton";
import SaveButton from "../components/SaveButton";
import { useFavoritesStore } from "../context/favoritesStore";

import { useQuery } from "@tanstack/react-query";
import { fetchListingById } from "../api/listings";
import { Listing } from "../types/listing";
import { getListingImages } from "../utils/listingImages";
import DetailsScreenSkeleton from "../components/skeletons/DetailsScreenSkeleton";

const MAX_WIDTH = 480;

export default function DetailsScreen({ route }: Props) {
  const { width } = useWindowDimensions();
  const { id } = route.params;
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorited = favorites[id];

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
  });
  const [showSkeleton, setShowSkeleton] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSkeleton) return <DetailsScreenSkeleton />;
  if (isError) return <Text>Error: {(error as Error)?.message}</Text>;
  if (!listing) return null;

  console.log(listing.review_count);
  console.log(fetchListingById);
  const textStyle = { fontFamily: "ABeeZee-Regular" };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage
            source={getListingImages(listing)[0]}
            imageWidth={width}
          />
          <ReportButton />
          <SaveButton
            onPress={() => toggleFavorite(id)}
            isFavorited={isFavorited}
          />
        </View>

        <View className="mt-4">
          <ListingHeader
            title={listing?.title}
            address={listing?.address}
            rating={listing?.rating ?? "0.00"}
            review_count={listing?.review_count ?? 0}
            isGuestFavorite={listing?.is_guest_favorite} 
            host_name={listing?.host_name}
            host_type={listing?.host_type}
          />
        </View>
        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>
        <View className={`py-4 ${textStyle}`}>
          {listing?.perks.map((perk, index) => (
            <ListingPerks
              key={index}
              perk={perk}
              subHeading={listing?.subHeading?.[index]}
            />
          ))}
        </View>

        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>

        <ListingDescription description={listing?.description} />

        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>

        <View className={`py-4 ${textStyle}`}>
          {listing?.amenities.map((amenities, index) => (
            <ListingAmenities key={index} amenities={amenities} />
          ))}
        </View>

        <View className="h-[2px] w-[100%] bg-[#ECAA00]" />

        <View className="flex justify-end">
          <View className="bg-[#cacaca] h-[52px] flex justify-center items-center">
            <Text className="font-abeezee">
              Popular! This place is usually booked
            </Text>
          </View>
        </View>
        <View className="h-[2px] w-[100%] bg-[#ECAA00] mb-2" />

        <ListingBooking
          original_price={listing?.original_price ?? 0}
          price={listing?.price_per_hour ?? 0}
          id={listing?.id}
        />
      </View>
    </ScrollView>
  );
}
