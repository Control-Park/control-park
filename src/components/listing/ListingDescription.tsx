import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  description?: string;
};

export default function ListingDescription({ description }: Props) {
  return (
    <View className="flex px-6 py-6 ">
      <Text className="font-abeezee text-xl">{description}</Text>
      <Text className="font-abeezee text-xl">
        {"\n"}Ideal for students, faculty, campus visitors, and event attendees.
        The structure provides ample parking, multiple entry points, and a short
        walk to campus destinations.
      </Text>
      <Text className="font-abeezee text-xl">
        {"\n"}Perfect for classes, meetings, athletic events, and on-campus
        activities.
      </Text>
      
    </View>
  );
}
