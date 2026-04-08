import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView, Text, Pressable, Image } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import SectionHeader from "../components/SectionHeader";
import ParkingCard, { ParkingCardData } from "../components/ParkingCard";
import CustomButton from "../components/CustomButton";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar, { TabKey } from "../components/Navbar";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

// import { parkingLots, lotsNearYou } from "../data/mockListings";
import { useFavoritesStore } from "../context/favoritesStore";
import { showSavedRemove, showSavedSuccess } from "../utils/validation";
import { fetchListings } from "../api/listings";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "../types/listing";
import { getListingImages } from "../utils/listingImages";

const MAX_WIDTH = 428;

export default function HomeScreen({ navigation }: Props) {
  // const [listings, setListings] = useState<ParkingCardData[]>([]);

  // placeholder: move function to another screen once implemented
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const renderCard = ({ item }: { item: Listing }) => (
    <View style={{ marginRight: 12 }}>
      <ParkingCard
        data={{
          id: item.id,
          title: item.title || item.structure_name,
          subtitle: `$${item.price_per_hour} per hour`,
          images: getListingImages(item),
          isGuestFavorite: !!item.is_guest_favorite,
          isFavorited: !!favorites[item.id],
        }}
        onToggleFavorite={() => {
          const isCurrentlyFavorited = !!favorites[item.id];
          toggleFavorite(item.id);
          if (!isCurrentlyFavorited) {
            showSavedSuccess("Added to your saved listings");
          } else {
            showSavedRemove("Removed from saved listings");
          }
        }}
        onPress={() => navigation.navigate("Details", { id: item.id })}
      />
    </View>
  );

  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: () => fetchListings(),
  });
  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {(error as Error)?.message}</Text>;
  if (!Array.isArray(listings)) {
    return <Text>Listings response is invalid</Text>;
  }

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    const normalized = trimmed.toLowerCase();
    const filtered = listings.filter((listing) => {
      const fields = [
        listing.title,
        listing.structure_name,
        listing.address,
        listing.description,
      ];
      return fields.some((field) => field?.toLowerCase().includes(normalized));
    });

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchResults(null);
  };

  const renderSearchResult = ({ item }: { item: Listing }) => (
    <Pressable
      style={styles.searchResult}
      onPress={() => navigation.navigate("Details", { id: item.id })}
    >
      <Image source={getListingImages(item)[0]} style={styles.searchResultImage} />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultTitle}>{item.title}</Text>
        <Text style={styles.searchResultSubtitle}>{item.address}</Text>
      </View>
    </Pressable>
  );

  const parkingLots = listings.slice(0, 3);
  const lotsNearYou = listings.slice(3, 6);
  console.log(listings);

  const showSearchResults = searchResults !== null;
  const trimmedSearch = searchValue.trim();

  return (
    <View style={styles.safe}>
      {/* Scrollable content */}
      <ScrollView style={styles.scrollContainer} className="overflow-scroll">
        {/* top area (centered on large screens) */}
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top + 0 }]}>
            <View style={styles.topRow}>
              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            {/* Spacing + make search bar shorter (centered) */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchInner}>
                <SearchBar
                  value={searchValue}
                  onChangeText={setSearchValue}
                  onSubmit={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </View>
            </View>
            {(isSearchFocused || searchValue) && (
              <View style={styles.searchActions}>
                <Pressable onPress={clearSearch}>
                  <Text style={styles.searchClear}>Clear</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.topSpacer} />
          </View>
        </View>

        {/* Background section */}
        <View style={styles.sectionsBackground}>
          <View style={styles.sectionsInner}>
            {showSearchResults ? (
              <View style={styles.searchResults}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    Showing {searchResults?.length ?? 0} result
                    {searchResults?.length === 1 ? "" : "s"} for "{trimmedSearch}"
                  </Text>
                  <Pressable onPress={clearSearch}>
                    <Text style={styles.searchClear}>Clear</Text>
                  </Pressable>
                </View>
                {isSearching ? (
                  <Text style={styles.searchingText}>Searching...</Text>
                ) : searchResults?.length ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.searchList}
                  />
                ) : (
                  <Text style={styles.noResults}>No listings found</Text>
                )}
              </View>
            ) : (
              <>
                {/* Parking Lots section */}
                <SectionHeader title="Parking Lots" />
                <FlatList
                  data={parkingLots}
                  renderItem={renderCard}
                  keyExtractor={(i) => i.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rowContent}
                />

                <View style={styles.sectionGap} />

                {/* Lots Near You section */}
                <SectionHeader title="Lots Near You" />
                <FlatList
                  data={lotsNearYou}
                  renderItem={renderCard}
                  keyExtractor={(i) => i.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rowContent}
                />
              </>
            )}

            {/* placeholder for testing signup and login buttons */}
            {/* <CustomButton
              title="signup (placeholder to test)"
              color="#ECAA00"
              className="flex items-center justify-center mt-6"
              onPress={() => navigation.navigate("Login")}
            /> */}

            {/* Extra bottom padding to ensure content doesn't hide behind navbar */}
            <View style={{ height: 80 }} />
          </View>
        </View>
      </ScrollView>

      {/* Navbar - fixed at bottom */}
      <View style={[styles.navbarWrapper]}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Home" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  scrollContainer: {
    flex: 1,
  },

  pageMax: {
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },

  topArea: {
    backgroundColor: "#F6F6F6",
  },

  topRow: {
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  topSpacer: {
    height: 35,
  },

  searchWrapper: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },

  searchInner: {
    width: "96%",
    maxWidth: 400,
  },

  sectionsBackground: {
    backgroundColor: "#EAEAEA",
    width: "100%",
  },

  sectionsInner: {
    paddingHorizontal: 16,
    paddingTop: 6,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },

  rowContent: {
    paddingTop: 4,
    paddingBottom: 6,
    paddingRight: 8,
  },

  sectionGap: {
    height: 6,
  },

  searchActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  searchClear: {
    color: "#111827",
    fontWeight: "600",
  },

  searchResults: {
    paddingVertical: 8,
  },

  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  searchingText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 12,
  },

  noResults: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 12,
  },

  searchList: {
    paddingBottom: 12,
  },

  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  searchResultImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
  },

  searchResultText: {
    flex: 1,
  },

  searchResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  searchResultSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  // Navbar styles
  navbarWrapper: {
    backgroundColor: "#F6F6F6",
  },

  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});
