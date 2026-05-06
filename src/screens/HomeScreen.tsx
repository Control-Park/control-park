import React, { useEffect, useMemo, useState } from "react";
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
import ParkingCard from "../components/ParkingCard";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import { useFavoritesStore } from "../context/favoritesStore";
import {
  showSavedRemove,
  showSavedSuccess,
  showSignInRequired,
} from "../utils/validation";
import { fetchListings, saveListing, unsaveListing } from "../api/listings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Listing } from "../types/listing";
import { getListingImages } from "../utils/listingImages";
import { supabase } from "../utils/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type PriceFilter = "any" | "under5" | "5to10" | "10plus";
type AvailabilityFilter = "any" | "availableNow";
type SortFilter = "none" | "highestRated" | "highestReview";
type ViewMode = "grid" | "list";

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
  const queryClient = useQueryClient();
  const { favorites, hydrateFavorites, setFavorite } = useFavoritesStore();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("any");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("any");
  const [sortFilter, setSortFilter] = useState<SortFilter>("none");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: () => fetchListings(),
  });

  useEffect(() => {
    if (Array.isArray(listings)) {
      hydrateFavorites(listings);
    }
  }, [hydrateFavorites, listings]);

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

  const handleToggleFavorite = (item: Listing, isFavorited: boolean) => {
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        showSignInRequired();
        return;
      }

      void (async () => {
        setFavorite(item.id, !isFavorited);
        try {
          if (isFavorited) {
            await unsaveListing(item.id);
            showSavedRemove("Removed from saved listings");
          } else {
            await saveListing(item.id);
            showSavedSuccess("Added to your saved listings");
          }

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["listings"] }),
            queryClient.invalidateQueries({ queryKey: ["listing", item.id] }),
          ]);
        } catch (err) {
          setFavorite(item.id, isFavorited);
          console.error("Failed to update saved listing:", err);
        }
      })();
    });
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {(error as Error)?.message}</Text>;
  if (!Array.isArray(listings)) {
    return <Text>Listings response is invalid</Text>;
  }

  const getPriceParams = () => {
    switch (priceFilter) {
      case "under5":
        return { priceMin: 0, priceMax: 5 };
      case "5to10":
        return { priceMin: 5, priceMax: 10 };
      case "10plus":
        return { priceMin: 10 };
      default:
        return {};
    }
  };

  const handleSearch = async () => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const priceParams = getPriceParams();
      const availabilityParam =
        availabilityFilter === "availableNow"
          ? new Date().toISOString()
          : undefined;
      const response = await fetchListings({
        name: trimmed,
        ...priceParams,
        availability: availabilityParam,
      });
      setSearchResults(response);
    } finally {
      setIsSearching(false);
    }
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
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.noResults}>No listings found</Text>
                )}
              </View>
            ) : (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Parking Lots</Text>
                  <View style={styles.viewToggleRow}>
                    <Pressable
                      style={[
                        styles.viewToggleBtn,
                        viewMode === "list" && styles.viewToggleBtnActive,
                      ]}
                      onPress={() => setViewMode("list")}
                    >
                      <Ionicons name="list" size={18} color="#111111" />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.viewToggleBtn,
                        viewMode === "grid" && styles.viewToggleBtnActive,
                      ]}
                      onPress={() => setViewMode("grid")}
                    >
                      <Ionicons name="grid" size={18} color="#111111" />
                    </Pressable>
                  </View>
                </View>

                {viewMode === "grid" ? (
                  <View style={styles.gridContainer}>
                    {filteredAndSortedListings.map((item) => {
                      const isFavorited = favorites[item.id] ?? !!item.is_saved;
                      return (
                        <View key={item.id} style={styles.gridItem}>
                          <ParkingCard
                            data={{
                              id: item.id,
                              title: item.title || item.structure_name,
                              subtitle: `$${item.price_per_hour} per hour`,
                              images: getListingImages(item),
                              isGuestFavorite: !!item.is_guest_favorite,
                              isFavorited,
                            }}
                            onToggleFavorite={() =>
                              handleToggleFavorite(item, isFavorited)
                            }
                            onPress={() =>
                              navigation.navigate("Details", { id: item.id })
                            }
                            style={{ width: "100%" }}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.listContainer}>
                    {filteredAndSortedListings.map((item) => {
                      const isFavorited = favorites[item.id] ?? !!item.is_saved;
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.listItem}
                          onPress={() =>
                            navigation.navigate("Details", { id: item.id })
                          }
                        >
                          <Image
                            source={getListingImages(item)[0]}
                            style={styles.listImage}
                          />
                          <View style={styles.listTextWrap}>
                            <Text style={styles.listTitle} numberOfLines={1}>
                              {item.title || item.structure_name}
                            </Text>
                            <Text style={styles.listSubtitle}>
                              ${item.price_per_hour} per hour
                            </Text>
                            {item.description ? (
                              <Text
                                style={styles.listDescription}
                                numberOfLines={2}
                              >
                                {item.description}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item, isFavorited);
                            }}
                            hitSlop={10}
                          >
                            <Ionicons
                              name={isFavorited ? "heart" : "heart-outline"}
                              size={22}
                              color={isFavorited ? "#EF4444" : "#9CA3AF"}
                            />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111827",
  },
  viewToggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  viewToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  viewToggleBtnActive: {
    backgroundColor: "#ECAA00",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingVertical: 4,
  },
  gridItem: {
    width: "48%",
  },
  listContainer: {
    flexDirection: "column",
    gap: 12,
    paddingVertical: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  listImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  listTextWrap: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  listSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  listDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
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
