import React from "react";
import { View, Text, Image } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type Props = {
  perk?: string;
  subHeading?: string;
};

export default function ListingPerks({ perk, subHeading }: Props) {
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-[#6A6A6A] font-md mt-4 text-md";

  return (
    <View className="flex w-full items-start px-10 py-4">
      <View className="flex-row items-center">
        <FontAwesome name="hand-o-right" size={28} color="black" />
        <View className="flex-col ml-4 gap-1.5 flex-1">
          <Text className="font-abeezee">{perk}</Text>
          <Text className="font-abeezee text-[#525252]">{subHeading}</Text>
        </View>
      </View>
    </View>
  );
}
