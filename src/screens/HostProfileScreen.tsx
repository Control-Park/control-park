import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";
import { getMyProfile, UserProfile } from "../api/user";
import { usePaymentMethods } from "../context/paymentMethodsContext";
import type { HostListing, ListingStatus } from "./CreateListingScreen";

type HostProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

type HostProfileRouteProp = RouteProp<RootStackParamList, "Profile">;

const MAX_WIDTH = 428;

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function getStatusColor(status: ListingStatus) {
  switch (status) {
    case "active":
      return "#2E8B57";
    case "inactive":
      return "#7A7A7A";
    case "draft":
      return "#D99000";
    default:
      return "#7A7A7A";
  }
}

export default function HostProfileScreen() {
  const navigation = useNavigation<HostProfileScreenNavigationProp>();
  const route = useRoute<HostProfileRouteProp>();
  const insets = useSafeAreaInsets();
  const { defaultMethod } = usePaymentMethods();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const nextProfile = await getMyProfile();
      setProfile(nextProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const hostName = useMemo(() => {
    const fullName =
      `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
    return fullName || "Host";
  }, [profile]);

  const avatarInitial = (
    profile?.first_name?.[0] ??
    hostName?.[0] ??
    "H"
  ).toUpperCase();

  const balance = 0;
  const completedBookings = 0;
  const hasPaymentMethod = !!defaultMethod;

  const createdListing = route.params?.createdListing;
  const existingListings = route.params?.existingListings ?? [];
  const listings: HostListing[] = createdListing
    ? [createdListing, ...existingListings.filter((item) => item.id !== createdListing.id)]
    : existingListings;

  const hasListings = listings.length > 0;
  const hasBalance = balance > 0;
  const hasCompletedBookings = completedBookings > 0;

  const handleOpenListing = (listing: HostListing) => {
    Alert.alert(
      "Listing created locally",
      "This listing is showing on your host profile, but your current Details screen only opens listings that already exist in your backend. Save it to your listings table first, then navigate to Details with the real database id.",
    );
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>

              <View style={styles.headerActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.headerIconButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => navigation.navigate("ProfileSettings")}
                >
                  <Ionicons name="settings-outline" size={20} color="#111111" />
                </Pressable>

                <NotificationsButton
                  onPress={() => navigation.navigate("NotificationSettings")}
                />
              </View>
            </View>

            <View style={styles.hostHeaderRow}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>{avatarInitial}</Text>
              </View>

              <View style={styles.hostIdentity}>
                <Text style={styles.hostName}>{hostName}</Text>
                <Text style={styles.hostRole}>Host</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Wallet Balance:</Text>
                <Text style={styles.metricValue}>{formatCurrency(balance)}</Text>

                <Text style={styles.metricFooterLabel}>
                  Total Booking Completed
                </Text>
                <Text style={styles.metricFooterValue}>
                  {completedBookings}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.paymentCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate("Payment")}
              >
                <Text style={styles.paymentTopLabel}>Payment Method</Text>

                {hasPaymentMethod ? (
                  <View style={styles.paymentFilledContent}>
                    <Text style={styles.paymentBrandText}>
                      {defaultMethod?.brand ?? "Card"}
                    </Text>
                    <Text style={styles.paymentMaskedText}>
                      •••• {defaultMethod?.last4}
                    </Text>
                    <Text style={styles.paymentCardholderText}>
                      {defaultMethod?.holder || hostName}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.paymentEmptyContent}>
                    <Text style={styles.paymentEmptyText}>
                      No payment method added
                    </Text>

                    <Pressable
                      onPress={() => navigation.navigate("Payment")}
                      style={({ pressed }) => [
                        styles.paymentAddButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}
              </Pressable>
            </View>

            {!hasBalance ? (
              <View style={styles.infoBanner}>
                <Ionicons name="wallet-outline" size={18} color="#7A7A7A" />
                <Text style={styles.infoBannerText}>
                  No earnings yet. Your wallet balance will appear once you start
                  receiving bookings.
                </Text>
              </View>
            ) : null}

            {!hasCompletedBookings ? (
              <View style={styles.infoBanner}>
                <Ionicons name="calendar-outline" size={18} color="#7A7A7A" />
                <Text style={styles.infoBannerText}>
                  No completed bookings yet.
                </Text>
              </View>
            ) : null}

            <View style={styles.listingsHeader}>
              <Text style={styles.listingsTitle}>Your Listings</Text>
            </View>

            {hasListings ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listingsScrollContent}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.addListingCard,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("CreateListing", {
                      existingListings: listings,
                    })
                  }
                >
                  <View style={styles.addListingCircle}>
                    <Ionicons name="add" size={20} color="#111111" />
                  </View>
                  <Text style={styles.addListingText}>Add Listing</Text>
                </Pressable>

                {listings.map((listing) => (
                  <Pressable
                    key={listing.id}
                    style={({ pressed }) => [
                      styles.listingCard,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleOpenListing(listing)}
                  >
                    <View style={styles.listingThumbnailPlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color="#B8B8B8"
                      />
                    </View>

                    <Text style={styles.listingCardTitle} numberOfLines={2}>
                      {listing.title}
                    </Text>

                    <Text
                      style={[
                        styles.listingStatus,
                        { color: getStatusColor(listing.status) },
                      ]}
                    >
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyListingsState}>
                <Ionicons name="home-outline" size={30} color="#999999" />
                <Text style={styles.emptyListingsTitle}>No listings yet</Text>
                <Text style={styles.emptyListingsText}>
                  Create your first listing to start hosting.
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.emptyListingsButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    navigation.navigate("CreateListing", {
                      existingListings: listings,
                    })
                  }
                >
                  <Text style={styles.emptyListingsButtonText}>
                    Create Listing
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Profile" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 44,
    marginTop: 4,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
  },
  hostHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
  },
  hostAvatarText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  hostIdentity: {
    marginLeft: 16,
    flex: 1,
  },
  hostName: {
    fontSize: 30,
    fontWeight: "500",
    color: "#111111",
    lineHeight: 34,
  },
  hostRole: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "500",
    color: "#ECAA00",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 22,
  },
  metricCard: {
    flex: 1,
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#444444",
    textAlign: "center",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ECAA00",
    textAlign: "center",
    marginBottom: 14,
  },
  metricFooterLabel: {
    fontSize: 12,
    color: "#444444",
    textAlign: "center",
    marginBottom: 4,
  },
  metricFooterValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#D99000",
    textAlign: "center",
  },
  paymentCard: {
    flex: 1,
    minHeight: 140,
    backgroundColor: "#ECAA00",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  paymentTopLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "right",
  },
  paymentEmptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  paymentEmptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  paymentFilledContent: {
    flex: 1,
    justifyContent: "center",
  },
  paymentBrandText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 14,
  },
  paymentMaskedText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  paymentCardholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#555555",
    lineHeight: 18,
  },
  listingsHeader: {
    marginTop: 12,
    marginBottom: 14,
  },
  listingsTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111111",
  },
  listingsScrollContent: {
    paddingRight: 8,
    gap: 12,
  },
  addListingCard: {
    width: 92,
    minHeight: 112,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addListingCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addListingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },
  listingCard: {
    width: 92,
    minHeight: 112,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listingThumbnailPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#F3E6E6",
  },
  listingCardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
    marginBottom: 6,
  },
  listingStatus: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyListingsState: {
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  emptyListingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginTop: 10,
    marginBottom: 6,
  },
  emptyListingsText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyListingsButton: {
    borderRadius: 999,
    backgroundColor: "#ECAA00",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  emptyListingsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  paymentAddButton: {
    marginTop: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
});