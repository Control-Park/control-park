import React from "react";
import { View, Text } from "react-native";

type Props = {
  title?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  isGuestFavorite?: boolean;
};

export default function ListingHeader({
  title,
  address,
  rating,
  reviewCount,
  isGuestFavorite,
}: Props) {
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-gray-500 font-medium mt-4 text-md";

  const stats = [
    String(rating),
    isGuestFavorite ? "Guest Favorite" : "Student Favorite",
    String(reviewCount),
  ].join("     |     ");

  return (
    <View className="items-center justify-center px-6">
      <Text
        style={{
          fontFamily: "ABeeZee-Regular",
          fontSize: 28,
          textAlign: "center",
        }}
        className="mt-6"
      >
        {title}
      </Text>
      <Text
        style={[{ textAlign: "center" }, textStyle]}
        className={subTextClass}
      >
        {address}
      </Text>
      <Text
        style={[{ textAlign: "center", marginTop: 4 }, textStyle]}
        className={subTextClass}
      >
        Campus Parking Lot · Multiple Levels · Easy Access
      </Text>
      <View className="flex-row">
        <Text
        className="text-xl my-4">{stats}</Text>
      </View>
    </View>
  );
}
