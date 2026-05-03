import React from "react";
import { View, Text } from "react-native";

type Props = {
  description?: string;
};

export default function ListingDescription({ description }: Props) {
  if (!description?.trim()) {
    return null;
  }

  return (
    <View className="flex px-6 py-6">
      <Text className="font-abeezee text-xl">{description}</Text>
    </View>
  );
}
