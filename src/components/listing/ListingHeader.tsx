import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import UserAvatar from "../UserAvatar";

type Props = {
  title?: string;
  address?: string;
  location?: string;
  accessDetails?: string[];
  rating?: number | string | null;
  review_count?: number;
  isGuestFavorite?: boolean;
  host_name?: string;
  hostId?: string;
  hostProfileImage?: null | string;
  host_type?: string;
  hostInitial?: string;
  onHostPress?: () => void;
  onReviewsPress?: () => void;
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
  hostId,
  hostProfileImage,
  host_type,
  hostInitial,
  onHostPress,
  onReviewsPress,
}: Props) {
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-[#6A6A6A] font-md mt-4 text-md";
  const meta = [location, ...(accessDetails ?? [])].filter(Boolean).join(" · ");
  const ratingText = formatRating(rating);
  const numericRating =
    typeof rating === "number" ? rating : Number.parseFloat(String(rating ?? 0));
  const reviews = review_count ?? 0;
  const showGuestFavorite =
    isGuestFavorite ||
    (Number.isFinite(numericRating) && numericRating >= 4 && reviews >= 10);
  const badgeLines = showGuestFavorite ? ["Guest", "favorite"] : ["New", "Listing"];

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

        <View className="w-[1px] h-10 bg-[#c5c5c5]" />
        <View className="items-center px-10">
          <Text style={textStyle} className="text-lg font-medium">
            {badgeLines[0]}
          </Text>
          <Text style={textStyle} className="text-lg font-medium -mt-2">
            {badgeLines[1]}
          </Text>
        </View>

        <View className="w-[1px] h-10 bg-[#c5c5c5]" />
        <Pressable
          className="items-center px-6"
          disabled={!onReviewsPress}
          onPress={onReviewsPress}
          style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
        >
          <Text style={textStyle} className="text-xl">
            {reviews}
          </Text>
          <Text style={textStyle} className="text-xs">
            Reviews
          </Text>
        </Pressable>
      </View>

      {host_name ? (
        <View className="flex w-full items-start">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />

          <Pressable
            className="flex-row items-center justify-center py-4"
            disabled={!onHostPress}
            onPress={onHostPress}
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
          >
            {hostId || hostProfileImage || hostInitial ? (
              <UserAvatar
                imageUri={hostProfileImage}
                name={host_name || hostInitial}
                size={50}
                userId={hostId}
              />
            ) : (
              <Image
                source={require("../../../assets/csulb-logo.png")}
                style={{ width: 50, height: 50 }}
              />
            )}
            <View className="flex-col ml-4 gap-1.5">
              <Text className="font-abeezee">Hosted by {host_name}</Text>
              <Text className="font-abeezee text-[#525252]">{host_type}</Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
