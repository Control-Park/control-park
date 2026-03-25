import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  title?: string;
  address?: string;
  rating?: any;
  review_count?: number;
  isGuestFavorite?: boolean;
  host_name?: string;
  host_type?: string;
};

export default function ListingHeader({
  title,
  address,
  rating,
  review_count,
  isGuestFavorite,
  host_name,
  host_type,
}: Props) {
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-[#6A6A6A] font-md mt-4 text-md";

  const stats = [
    String(rating),
    isGuestFavorite ? "Guest Favorite" : "Student Favorite",
    String(review_count),
  ].join("     |     ");

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
      <Text
        style={[{ textAlign: "center", marginTop: 4 }, textStyle]}
        className={subTextClass}
      >
        Campus Parking Lot · Multiple Levels · Easy Access
      </Text>

      <View className="flex-row items-center justify-center py-6">
        <View className="items-center px-6">
          <Text style={textStyle} className="text-xl">
            {rating}
          </Text>
        </View>
        <View className="w-[1px] h-10 bg-[#c5c5c5]" />
        <View className="items-center px-10">
          <Text style={textStyle} className="text-lg font-medium">
            {isGuestFavorite ? "Guest" : "Student"}
          </Text>
          <Text style={textStyle} className="text-lg font-medium -mt-2">
            favorite
          </Text>
        </View>
        <View className="w-[1px] h-10 bg-[#c5c5c5]" />
        <View className="items-center px-6">
          <Text style={textStyle} className="text-xl">
            {review_count}
          </Text>
          <Text style={textStyle} className="text-xs">
            Reviews
          </Text>
        </View>
      </View>

      {host_name ? ( // if host passed as param, load it. otherwise hide
        <View className="flex w-full items-start">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />

          <View className="flex-row items-center justify-center py-4">
            <Image
              source={require("../../../assets/csulb-logo.png")}
              style={{ width: 50, height: 50 }}
            />
            <View className="flex-col ml-4 gap-1.5">
              <Text className="font-abeezee">
                {host_name ? "Hosted by" : ""} {host_name}
              </Text>
              <Text className="font-abeezee text-[#525252]">{host_type}</Text>
            </View>
          </View>

        </View>
      ) : (
        ""
      )}
    </View>
  );
}
