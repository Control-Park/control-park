import React from "react";
import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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

export default function ReserveScreen({ route, navigation }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { id } = route.params;
  const isFavorited = favorites[id];

  const { width } = useWindowDimensions();
  const listing = allListings.find((item) => item.id === id);

  const test = async () => {
    console.log("report");
  };

  const reservationDuration = "For 1 day";
  const reservationDate = "August 1, 2026";
  const tripTime = "15 min";
  const subtotal = listing?.price ?? 0;

  const activeVehicleName = "2014 BMW 328i";
  const activeVehiclePlate = "6BAK571";

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-black">Listing not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage source={listing.images[0]} imageWidth={width} />
          <ReportButton onPress={test} />
          <SaveButton
            onPress={() => toggleFavorite(id)}
            isFavorited={isFavorited}
          />
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            {listing.title}
          </Text>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            Address details
          </Text>
          <Text className="mt-2 text-[14px] text-[#555555]">
            {listing.address}
          </Text>
          <Text className="mt-1 text-[13px] text-[#777777]">
            Campus Parking Lot • Multiple Levels • Easy Access
          </Text>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#111111]">
              Reservation details
            </Text>
            <Ionicons name="create-outline" size={18} color="#111111" />
          </View>

          <View className="mt-3">
            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Duration</Text>
              <Text className="text-[14px] text-[#555555]">
                {reservationDuration}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Date</Text>
              <Text className="text-[14px] text-[#555555]">
                {reservationDate}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Trip Time</Text>
              <Text className="text-[14px] text-[#555555]">{tripTime}</Text>
            </View>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            Price summary
          </Text>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-[14px] text-[#555555]">Subtotal</Text>
            <Text className="text-[14px] text-[#111111]">${subtotal}</Text>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row justify-between">
            <Text className="text-[18px] font-bold text-[#111111]">
              Active Vehicle
            </Text>
            <Ionicons name="create-outline" size={18} color="#111111" />
          </View>

          <View className="mt-3 flex-row justify-between items-center">
            <View>
              <Text className="text-[14px] text-[#555555]">
                {activeVehicleName}
              </Text>
              <Text className="mt-1 text-[13px] text-[#8a8a8a]">
                {activeVehiclePlate}
              </Text>
            </View>

            <View className="h-[72px] w-[110px] items-center justify-center rounded-md bg-[#d9d9d9]">
              <Text className="text-[13px] text-[#555555]">Vehicle</Text>
            </View>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-[12px] text-[#555555]">Default</Text>

            <View className="flex-row items-center gap-5">
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={16} color="#111111" />
                <Text className="ml-1 text-[12px] text-[#111111]">
                  Add payment
                </Text>
              </View>
              <Ionicons name="add" size={18} color="#111111" />
            </View>
          </View>

          <View className="mt-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-[#1A1F71] px-2 py-1 rounded-sm">
                <Text className="text-[10px] text-white font-bold">VISA</Text>
              </View>
              <Text className="ml-3 text-[13px] text-[#555555]">
                Visa...1234
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 pb-6 pt-6">
          <CustomButton
            title="Reserve"
            color="#ECAA00"
            className="flex items-center justify-center rounded-full font-abeezee"
            onPress={() => {
              console.log("Reserve pressed");
              navigation.navigate("ActiveReservation");
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}