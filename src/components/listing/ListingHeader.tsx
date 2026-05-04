import React from "react";
import { View, Text, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  title?: string;
  address?: string;
  location?: string;
  accessDetails?: string[];
  rating?: number | string | null;
  review_count?: number;
  isGuestFavorite?: boolean;
  host_name?: string;
  host_type?: string;
};

function formatRating(rating?: number | string | null) {
  const numericRating =
    typeof rating === "number" ? rating : Number.parseFloat(String(rating ?? 0));

  if (!Number.isFinite(numericRating)) {
    return "0";
  }

  return Number.isInteger(numericRating)
    ? String(numericRating)
    : numericRating.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function ListingHeader({
  title,
  address,
  location,
  accessDetails,
  rating,
  review_count,
  isGuestFavorite,
  host_name,
  host_type,
}: Props) {
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-[#6A6A6A] font-md mt-4 text-md";
  const meta = [location, ...(accessDetails ?? [])].filter(Boolean).join(" · ");
  const ratingText = formatRating(rating);

  return (
    <View className="items-center justify-center px-6">
      <Text
        style={{
          fontFamily: "ABeeZee-Regular",
          fontSize: 28,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={[{ textAlign: "center" }, textStyle]}
        className={subTextClass}
      >
        {address}
      </Text>
      {meta ? (
        <Text
          style={[{ textAlign: "center", marginTop: 4 }, textStyle]}
          className={subTextClass}
        >
          {meta}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-center py-6">
        <View className="items-center px-6">
          <View className="flex-row items-center gap-1">
            <Text style={textStyle} className="text-xl">
              {ratingText}
            </Text>
            <FontAwesome name="star" size={14} color="#ECAA00" />
          </View>
        </View>
        {isGuestFavorite ? (
          <>
            <View className="w-[1px] h-10 bg-[#c5c5c5]" />
            <View className="items-center px-10">
              <Text style={textStyle} className="text-lg font-medium">
                Guest
              </Text>
              <Text style={textStyle} className="text-lg font-medium -mt-2">
                favorite
              </Text>
            </View>
          </>
        ) : null}
        <View className="w-[1px] h-10 bg-[#c5c5c5]" />
        <View className="items-center px-6">
          <Text style={textStyle} className="text-xl">
            {review_count ?? 0}
          </Text>
          <Text style={textStyle} className="text-xs">
            Reviews
          </Text>
        </View>
      </View>

      {host_name ? (
        <View className="flex w-full items-start">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />

          <View className="flex-row items-center justify-center py-4">
            <Image
              source={require("../../../assets/csulb-logo.png")}
              style={{ width: 50, height: 50 }}
            />
            <View className="flex-col ml-4 gap-1.5">
              <Text className="font-abeezee">Hosted by {host_name}</Text>
              <Text className="font-abeezee text-[#525252]">{host_type}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
