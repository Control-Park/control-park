import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  amenities?: string;
};

export default function ListingAmenities({ amenities }: Props) {
  return (
    <View className="flex w-full items-start px-10 py-4">
      <View className="flex-row items-center">
        <FontAwesome name="hand-o-right" size={28} color="black" />
        <View className="flex-col ml-4 gap-1.5 flex-1">
          <Text className="font-abeezee">{amenities}</Text>
        </View>
      </View>
    </View>
  );
}
