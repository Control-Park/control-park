import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Text,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import SectionHeader from "../components/SectionHeader";
import ParkingCard from "../components/ParkingCard";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import { useFavoritesStore } from "../context/favoritesStore";
import { showSavedRemove, showSavedSuccess } from "../utils/validation";
import { fetchListings } from "../api/listings";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "../types/listing";
import { getListingImages } from "../utils/listingImages";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type PriceFilter = "any" | "under5" | "5to10" | "10plus";
type AvailabilityFilter = "any" | "availableNow";
type SortFilter = "none" | "highestRated" | "highestReview";

const MAX_WIDTH = 428;

const PRICE_FILTER_OPTIONS: { label: string; value: PriceFilter }[] = [
  { label: "Any price", value: "any" },
  { label: "Under $5", value: "under5" },
  { label: "$5 - $10", value: "5to10" },
  { label: "$10+", value: "10plus" },
];

const AVAILABILITY_FILTER_OPTIONS: {
  label: string;
  value: AvailabilityFilter;
}[] = [
  { label: "Any time", value: "any" },
  { label: "Available now", value: "availableNow" },
];

const SORT_FILTER_OPTIONS: { label: string; value: SortFilter }[] = [
  { label: "Default", value: "none" },
  { label: "Highest rated", value: "highestRated" },
  { label: "Highest review", value: "highestReview" },
];

const isListingAvailableNow = (listing: Listing) => {
  if (!listing.is_active) {
    return false;
  }

  const now = Date.now();
  const availableFrom = new Date(listing.available_from).getTime();
  const availableUntil = new Date(listing.available_until).getTime();

  if (Number.isNaN(availableFrom) || Number.isNaN(availableUntil)) {
    return listing.is_active;
  }

  return availableFrom <= now && now <= availableUntil;
};

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("any");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("any");
  const [sortFilter, setSortFilter] = useState<SortFilter>("none");

  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: () => fetchListings(),
  });

  const filteredAndSortedListings = useMemo(() => {
    if (!Array.isArray(listings)) {
      return [];
    }

    const filtered = listings.filter((listing) => {
      const matchesPrice =
        priceFilter === "any" ||
        (priceFilter === "under5" && listing.price_per_hour < 5) ||
        (priceFilter === "5to10" &&
          listing.price_per_hour >= 5 &&
          listing.price_per_hour <= 10) ||
        (priceFilter === "10plus" && listing.price_per_hour > 10);

      const matchesAvailability =
        availabilityFilter === "any" ||
        (availabilityFilter === "availableNow" &&
          isListingAvailableNow(listing));

      return matchesPrice && matchesAvailability;
    });

    const sorted = [...filtered];

    if (sortFilter === "highestRated") {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    if (sortFilter === "highestReview") {
      sorted.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    }

    return sorted;
  }, [availabilityFilter, listings, priceFilter, sortFilter]);

  const activeFilters = useMemo(() => {
    const filters: {
      key: "price" | "availability" | "sort";
      label: string;
    }[] = [];

    if (priceFilter !== "any") {
      const label =
        PRICE_FILTER_OPTIONS.find((option) => option.value === priceFilter)
          ?.label ?? "Price";
      filters.push({ key: "price", label });
    }

    if (availabilityFilter !== "any") {
      const label =
        AVAILABILITY_FILTER_OPTIONS.find(
          (option) => option.value === availabilityFilter,
        )?.label ?? "Availability";
      filters.push({ key: "availability", label });
    }

    if (sortFilter !== "none") {
      const label =
        SORT_FILTER_OPTIONS.find((option) => option.value === sortFilter)
          ?.label ?? "Sort";
      filters.push({ key: "sort", label });
    }

    return filters;
  }, [availabilityFilter, priceFilter, sortFilter]);

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
    const filtered = filteredAndSortedListings.filter((listing) => {
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

  const removeFilter = (key: "price" | "availability" | "sort") => {
    if (key === "price") {
      setPriceFilter("any");
    }

    if (key === "availability") {
      setAvailabilityFilter("any");
    }

    if (key === "sort") {
      setSortFilter("none");
    }

    if (searchResults !== null) {
      setSearchResults(null);
    }
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

  const parkingLots = filteredAndSortedListings.slice(0, 3);
  const lotsNearYou = filteredAndSortedListings.slice(3, 6);
  const showSearchResults = searchResults !== null;
  const trimmedSearch = searchValue.trim();

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scrollContainer} className="overflow-scroll">
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            <View style={styles.searchWrapper}>
              <View style={styles.searchControlsRow}>
                <View style={styles.searchInner}>
                  <SearchBar
                    value={searchValue}
                    onChangeText={setSearchValue}
                    onSubmit={handleSearch}
                    onClear={clearSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </View>

                <Pressable
                  style={[
                    styles.filterButton,
                    (isFilterOpen || activeFilters.length > 0) &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setIsFilterOpen((current) => !current)}
                >
                  <Ionicons name="funnel-outline" size={22} color="#111111" />
                </Pressable>
              </View>
            </View>

            {activeFilters.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activeFiltersRow}
              >
                {activeFilters.map((filter) => (
                  <Pressable
                    key={filter.key}
                    style={styles.activeFilterChip}
                    onPress={() => removeFilter(filter.key)}
                  >
                    <Text style={styles.activeFilterText}>{filter.label}</Text>
                    <Ionicons name="close" size={14} color="#111111" />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {isFilterOpen ? (
              <View style={styles.filterPanel}>
                <Text style={styles.filterSectionTitle}>Price range</Text>
                <View style={styles.filterOptionsRow}>
                  {PRICE_FILTER_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.filterChip,
                        priceFilter === option.value && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setPriceFilter(option.value);
                        setSearchResults(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          priceFilter === option.value &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.filterSectionTitle}>Availability</Text>
                <View style={styles.filterOptionsRow}>
                  {AVAILABILITY_FILTER_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.filterChip,
                        availabilityFilter === option.value &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setAvailabilityFilter(option.value);
                        setSearchResults(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          availabilityFilter === option.value &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.filterSectionTitle}>Sort</Text>
                <View style={styles.filterOptionsRow}>
                  {SORT_FILTER_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.filterChip,
                        sortFilter === option.value && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSortFilter(option.value);
                        setSearchResults(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          sortFilter === option.value &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.topSpacer} />
          </View>
        </View>

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

            <View style={{ height: 80 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
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
    height: 24,
  },
  searchWrapper: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  searchControlsRow: {
    width: "96%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInner: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#F7E2A4",
    borderColor: "#ECAA00",
  },
  activeFiltersRow: {
    gap: 8,
    paddingTop: 14,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ECAA00",
  },
  activeFilterText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "600",
  },
  filterPanel: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 10,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: "#ECAA00",
  },
  filterChipText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#111111",
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
    flex: 1,
    paddingRight: 12,
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
  navbarWrapper: {
    backgroundColor: "#F6F6F6",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});
