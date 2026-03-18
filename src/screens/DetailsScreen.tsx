import React from "react";
import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;
import ListingImage from "../components/listing/ListingImage";
import ListingHeader from "../components/listing/ListingHeader";

const MAX_WIDTH = 428;

export default function DetailsScreen({ route }: Props) {
  const { id } = route.params;
  const listing = allListings.find((item) => item.id === id);
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-gray-500 font-medium mt-4 text-md";

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <ListingImage source={listing?.images[0]} />
        <ListingHeader
          title={listing?.title}
          address={listing?.address}
          rating={listing?.rating}
          reviewCount={listing?.reviewCount}
          isGuestFavorite={listing?.isGuestFavorite}
        />

        {/* Divider */}
        <View className="flex justify-center items-center">
          <View className="h-[1px] w-[90%] bg-gray-500 my-4" />
          <View className="flex text-left">
            <Text>Hosted by {listing?.host.name}</Text>
            <Text>{listing?.host.type}</Text>
          </View>
          <View className="h-[1px] w-[90%] bg-gray-500 my-4 self-center" />

          <View style={{ height: 400 }} />
        </View>
      </View>
    </ScrollView>
  );
}
