import React from "react";
import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;
import ListingImage from "../components/listing/ListingImage";

const MAX_WIDTH = 428;

export default function DetailsScreen({ route }: Props) {
  const { id } = route.params;
  const listing = allListings.find((item) => item.id === id);
  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const subTextClass = "text-gray-500 font-medium mt-4 text-md";

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <ListingImage source={listing?.image} />

        <View className="flex items-center justify-center">
          <Text
            style={{
              fontFamily: "ABeeZee-Regular",
              fontSize: 28,
              textAlign: "center",
            }}
            className="mt-6"
          >
            {listing?.title}
          </Text>

          <Text
            style={[{ textAlign: "center" }, textStyle]}
            className={subTextClass}
          >
            {listing?.address}
            {"\n"}
            {listing?.tags}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-[2px] bg-gray-500" />
      </View>
    </ScrollView>
  );
}
