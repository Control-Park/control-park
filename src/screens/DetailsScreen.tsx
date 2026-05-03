import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { supabase } from "../utils/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

import ListingImage from "../components/listing/ListingImage";
import ListingHeader from "../components/listing/ListingHeader";
import ListingPerks from "../components/listing/ListingPerks";
import ListingDescription from "../components/listing/ListingDescription";
import ListingAmenities from "../components/listing/ListingAmenities";
import ListingBooking from "../components/listing/ListingBooking";
import { useWindowDimensions } from "react-native";

import ReportButton from "../components/ReportButton";
import SaveButton from "../components/SaveButton";
import { useFavoritesStore } from "../context/favoritesStore";

import { useQuery } from "@tanstack/react-query";
import { fetchListingById } from "../api/listings";
import { Listing } from "../types/listing";
import { getListingImages } from "../utils/listingImages";
import DetailsScreenSkeleton from "../components/skeletons/DetailsScreenSkeleton";

const MAX_WIDTH = 480;

export default function DetailsScreen({ route, navigation }: Props) {
  const { width } = useWindowDimensions();
  const { id } = route.params;
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorited = favorites[id];

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
  });

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  if (isLoading || showSkeleton) return <DetailsScreenSkeleton />;
  if (isError) return <Text>Error: {(error as Error)?.message}</Text>;
  if (!listing) return null;

  const textStyle = { fontFamily: "ABeeZee-Regular" };
  const perks = listing.perks ?? [];
  const incentives = listing.incentives ?? [];
  const amenities = listing.amenities ?? [];

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage
            source={getListingImages(listing)[0]}
            imageWidth={width}
          />
          <ReportButton listingId={id} />
          <SaveButton
            listingId={id}
            onPress={() => toggleFavorite(id)}
            isFavorited={isFavorited}
          />
        </View>

        <View className="mt-4">
          <ListingHeader
            title={listing.title}
            address={listing.address}
            location={listing.structure_name}
            accessDetails={listing.sub_heading}
            rating={listing.rating ?? "0.00"}
            review_count={listing.review_count ?? 0}
            isGuestFavorite={listing.is_guest_favorite}
            host_name={listing.host_name}
            host_type={listing.host_type}
          />
        </View>

        <View className="flex items-center justify-center px-6">
          <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
        </View>

        {perks.length || incentives.length ? (
          <>
            <View className={`py-4 ${textStyle}`}>
              {perks.map((perk, index) => (
                <ListingPerks key={`perk-${index}`} perk={perk} />
              ))}
              {incentives.map((incentive, index) => (
                <ListingPerks key={`incentive-${index}`} perk={incentive} />
              ))}
            </View>

            <View className="flex items-center justify-center px-6">
              <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
            </View>
          </>
        ) : null}

        <ListingDescription description={listing.description} />

        {listing.description?.trim() ? (
          <View className="flex items-center justify-center px-6">
            <View className="h-[1px] w-[100%] bg-[#c5c5c5]" />
          </View>
        ) : null}

        {amenities.length ? (
          <View className={`py-4 ${textStyle}`}>
            {amenities.map((amenity, index) => (
              <ListingAmenities key={index} amenities={amenity} />
            ))}
          </View>
        ) : null}

        {listing.is_popular ? (
          <View>
            <View className="h-[2px] w-[100%] bg-[#ECAA00]" />
            <View className="flex justify-end">
              <View className="bg-[#cacaca] h-[52px] flex justify-center items-center">
                <Text className="font-abeezee">
                  Popular! This place is usually booked
                </Text>
              </View>
            </View>
            <View className="h-[2px] w-[100%] bg-[#ECAA00] mb-2" />
          </View>
        ) : null}

        <View className="px-6 pb-3">
          <Pressable
            disabled={currentUserId === listing.host_id}
            className="h-[48px] rounded-full border border-[#111111] items-center justify-center"
            style={currentUserId === listing.host_id ? { opacity: 0.35 } : undefined}
            onPress={() =>
              navigation.navigate("Conversation", {
                hostId: listing.host_id,
                hostName: listing.host_name,
                listingId: listing.id,
                listingImage: getListingImages(listing)[0],
                listingTitle: listing.title,
              })
            }
          >
            <Text className="font-abeezee text-[15px] text-[#111111]">
              Message Host
            </Text>
          </Pressable>
        </View>

        <ListingBooking
          original_price={listing.original_price ?? 0}
          price={listing.price_per_hour ?? 0}
          id={listing.id}
        />
      </View>
    </ScrollView>
  );
}
