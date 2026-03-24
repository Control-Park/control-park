import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";
import ListingImage from "../components/listing/ListingImage";
import { useWindowDimensions } from "react-native";
import ReportButton from "../components/ReportButton";
import SaveButton from "../components/SaveButton";
import { useFavoritesStore } from "../context/favoritesStore";
import CustomButton from "../components/CustomButton";

type Props = NativeStackScreenProps<RootStackParamList, "Reserve">;

const MAX_WIDTH = 480;

export default function ReserveScreen({ route }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { id } = route.params;
  const isFavorited = favorites[id];

  const { width } = useWindowDimensions();
  const listing = allListings.find((item) => item.id === id);

  // Hardcoded for this sprint
  const reservationDate = "August 1, 2026";
  const reservationDuration = "15 min";
  const reservationTime = "For 1 day";
  const subtotal = listing?.price ?? 0;

  const activeVehicleName = "2014 BMW 328i";
  const activeVehiclePlate = "6BAK571";

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

        <View className="px-4 pt-4">
          <Text className="text-xl font-bold text-[#111111]">
            {listing?.title}
          </Text>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-xl font-bold text-[#111111]">
            Address details
          </Text>
          <Text className="mt-2 text-base text-[#555555]">
            {listing?.address}
          </Text>
          <Text className="mt-1 text-sm text-[#777777]">
            Campus Parking Lot • Multiple Levels • Easy Access
          </Text>

          <View className="flex items-center justify-center mt-4">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-[#111111]">
              Reservation details
            </Text>
            <Text className="text-base text-[#111111]">✎</Text>
          </View>

          <View className="mt-3">
            <View className="flex-row justify-between py-1">
              <Text className="text-base text-[#555555]">Duration</Text>
              <Text className="text-base text-[#555555]">
                {reservationTime}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-base text-[#555555]">Date</Text>
              <Text className="text-base text-[#555555]">
                {reservationDate}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-base text-[#555555]">Trip Time</Text>
              <Text className="text-base text-[#555555]">
                {reservationDuration}
              </Text>
            </View>
          </View>

          <View className="flex items-center justify-center mt-4">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-xl font-bold text-[#111111]">
            Price summary
          </Text>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-base text-[#555555]">Subtotal</Text>
            <Text className="text-base text-[#111111]">${subtotal}</Text>
          </View>

          <View className="flex items-center justify-center mt-4">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-[#111111]">
              Active Vehicle
            </Text>
            <Text className="text-base text-[#111111]">✎</Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-base text-[#555555]">
                {activeVehicleName}
              </Text>
              <Text className="mt-1 text-sm text-[#888888]">
                {activeVehiclePlate}
              </Text>
            </View>

            <Image
              source={require("../../assets/parking4.png")}
              className="h-[72px] w-[110px] rounded-md"
              resizeMode="cover"
            />
          </View>

          <View className="flex items-center justify-center mt-4">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-[#555555]">Default</Text>
            <View className="flex-row items-center gap-6">
              <Text className="text-base text-[#111111]">✎</Text>
              <Text className="text-base text-[#111111]">+</Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#1A1F71] px-2 py-1 rounded-sm">
                <Text className="text-white text-xs font-bold">VISA</Text>
              </View>
              <Text className="ml-3 text-sm text-[#555555]">Visa...1234</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="bg-[#1A1F71] px-2 py-1 rounded-sm">
                <Text className="text-white text-[10px] font-bold">VISA</Text>
              </View>
              <View className="bg-[#EB001B] px-2 py-1 rounded-sm">
                <Text className="text-white text-[10px] font-bold">MC</Text>
              </View>
              <View className="bg-black px-2 py-1 rounded-sm">
                <Text className="text-white text-[10px] font-bold">Pay</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 pb-6 pt-6">
          <CustomButton
            title="Reserve"
            color="#ECAA00"
            className="flex items-center justify-center rounded-full font-abeezee"
          />
        </View>
      </View>
    </ScrollView>
  );
}