import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image } from "react-native";
import CustomButton from "../CustomButton";

type Props = {
  originalPrice?: number;
  price?: number;
};

export default function ListingBooking({ originalPrice, price }: Props) {
  return (
    <View className="flex-row w-full items-center justify-between px-8 py-4">
      <View className="flex-col">
        <View className="flex-row items-center">
          <Text className="font-abeezee text-lg line-through text-[#6A6A6A]">
            $ {originalPrice}
          </Text>
          <Text className="font-abeezee text-lg"> ${price}</Text>
        </View>
        <Text className="font-abeezee text-md text-[#6A6A6A]">
          For 1 day{"  "}Aug 1
        </Text>
      </View>

      <CustomButton
        title="Reserve"
        color="#ECAA00"
        className="items-center justify-center w-44 h-16 rounded-full font-abeezee"
        // onPress={() => navigation.navigate("Reserve")}
      />
    </View>
  );
}
