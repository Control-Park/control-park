import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";

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
const MAX_WIDTH = 480;

export default function DetailsScreen({ route }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { id } = route.params;
  const isFavorited = favorites[id];
  
  const { width } = useWindowDimensions();
  const listing = allListings.find((item) => item.id === id);
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const test = async () => {
    console.log("report");
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage source={listing?.images[0]} imageWidth={width} />
          <ReportButton onPress={test} />
          <SaveButton onPress={() => toggleFavorite(id)} isFavorited={isFavorited} />
        </View>

        <ListingHeader
          title={listing?.title}
          address={listing?.address}
          rating={listing?.rating}
          reviewCount={listing?.reviewCount}
          isGuestFavorite={listing?.isGuestFavorite}
          host={listing?.host}
        />
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

        <View className="h-[2px] w-[100%] bg-[#ECAA00] mb" />

        {/* Banner */}
        <View className="flex justify-end">
          <View className="bg-[#cacaca] h-[52px] flex justify-center items-center">
            <Text className="font-abeezee">
              Popular! This place is usually booked
            </Text>
          </View>
        </View>
        <View className="h-[2px] w-[100%] bg-[#ECAA00] mt" />

        <ListingBooking
          originalPrice={listing?.originalPrice}
          price={listing?.price}
        />
      </View>
      {/* <View style={{ height: 25 }} /> */}
    </ScrollView>
  );
}
