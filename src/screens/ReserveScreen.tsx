import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";

type Props = NativeStackScreenProps<RootStackParamList, "Reserve">;
import ListingImage from "../components/listing/ListingImage";
import { useWindowDimensions } from "react-native";

import ReportButton from "../components/ReportButton";
import SaveButton from "../components/SaveButton";
import { useFavoritesStore } from "../context/favoritesStore";
import CustomButton from "../components/CustomButton";
const MAX_WIDTH = 480;

export default function ReserveScreen({ route }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { id } = route.params;
  const isFavorited = favorites[id];

  const { width } = useWindowDimensions();
  const listing = allListings.find((item) => item.id === id);
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
          <SaveButton
            onPress={() => toggleFavorite(id)}
            isFavorited={isFavorited}
          />
        </View>

        {/* TODO: make new reserve components similar to /components/listing folder components */}
        {/* <ListingHeader title={listing?.title} address={listing?.address} /> */}
        {/* <ReservationDetails /> */}
        {/* <Price Summary /> */}
        {/* <Active Vehicle /> */}
        {/* <Payments /> */}

        <View className="mt-4">
          <Text>Address Detail</Text>
          {listing?.address}

          {/* Divider */}
          <View className="flex items-center justify-center px-6">
            <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
          </View>
        </View>

        <CustomButton
          title="Reserve"
          color="#ECAA00"
          className="flex items-center justify-center my-4 rounded-full font-abeezee"
          //  onPress={() => navigation.navigate("Reserve", { id: id ?? "" })}
        />
      </View>
      {/* <View style={{ height: 25 }} /> */}
    </ScrollView>
  );
}
