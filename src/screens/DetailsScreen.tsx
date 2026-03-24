import React from "react";
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
  } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
  });

  if (isLoading) return <Text>Listing not added to API yet...</Text>;
  if (isError) return <Text>Something went wrong</Text>;
  if (!listing) return null;

  const textStyle = { fontFamily: "ABeeZee-Regular" };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage source={listing?.images[0]} imageWidth={width} />
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
            reviewCount={listing?.reviewCount ?? 0}
            isGuestFavorite={listing?.isGuestFavorite}
            host={listing?.host}
          />
        </View>
        {/* Divider */}
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

        {/* Divider */}
        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>

        <ListingDescription description={listing?.description} />

        {/* Divider */}
        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>

        <View className={`py-4 ${textStyle}`}>
          {listing?.amenities.map((amenities, index) => (
            <ListingAmenities key={index} amenities={amenities} />
          ))}
        </View>

        <View className="h-[2px] w-[100%] bg-[#ECAA00]" />

        {/* Banner */}
        <View className="flex justify-end">
          <View className="bg-[#cacaca] h-[52px] flex justify-center items-center">
            <Text className="font-abeezee">
              Popular! This place is usually booked
            </Text>
          </View>
        </View>
        <View className="h-[2px] w-[100%] bg-[#ECAA00] mb-2" />

        <ListingBooking
          originalPrice={listing?.originalPrice}
          price={listing?.price}
          id={listing?.id}
        />
      </View>
      {/* <View style={{ height: 25 }} /> */}
    </ScrollView>
  );
}
