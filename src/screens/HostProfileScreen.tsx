import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";
import { getMyProfile, UserProfile } from "../api/user";
import { usePaymentMethods } from "../context/paymentMethodsContext";
import { deleteListing, fetchListings } from "../api/listings";
import { fetchHostingReservations, fetchHostStats, HostStats } from "../api/reservations";
import type { Listing } from "../types/listing";
import { supabase } from "../utils/supabase";
import { getProfileDisplayName, getProfileInitial } from "../utils/profile";

type HostProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const MAX_WIDTH = 428;

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function getStatusColor(listing: Listing) {
  return listing.is_active ? "#2E8B57" : "#7A7A7A";
}

function getListingStatusLabel(listing: Listing) {
  return listing.is_active ? "Active" : "Inactive";
}

export default function HostProfileScreen() {
  const navigation = useNavigation<HostProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { defaultMethod } = usePaymentMethods();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<HostStats>({ completed_bookings: 0, wallet_balance: 0 });
  const [occupiedListingIds, setOccupiedListingIds] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isListingActionsVisible, setIsListingActionsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const nextProfile = await getMyProfile();
      setProfile(nextProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  const loadHostListings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      if (!userId) { setListings([]); return; }

      const [allListings, hostStats, hostingReservations] = await Promise.all([
        fetchListings(),
        fetchHostStats(),
        fetchHostingReservations(),
      ]);
      setListings(allListings.filter((l) => l.host_id === userId));
      setStats(hostStats);
      const activeIds = new Set(
        hostingReservations
          .filter((r) => r.status === "active")
          .map((r) => r.listing_id),
      );
      setOccupiedListingIds(activeIds);
    } catch (error) {
      console.error("Failed to load host data:", error);
      setListings([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
      void loadHostListings();
    }, [loadProfile, loadHostListings]),
  );

  const hostName = useMemo(() => getProfileDisplayName(profile), [profile]);

  const avatarInitial = getProfileInitial(profile);

  const balance = stats.wallet_balance;
  const completedBookings = stats.completed_bookings;
  const hasPaymentMethod = !!defaultMethod;
  const hasListings = listings.length > 0;
  const hasBalance = balance > 0;
  const hasCompletedBookings = completedBookings > 0;

  const handleOpenListing = (listing: Listing) => {
    navigation.navigate("Details", { id: listing.id });
  };

  const openListingActions = (listing: Listing) => {
    setSelectedListing(listing);
    setIsListingActionsVisible(true);
  };

  const closeListingActions = () => {
    setSelectedListing(null);
    setIsListingActionsVisible(false);
  };

  const handleEditListing = () => {
    const listing = selectedListing;
    closeListingActions();
    if (!listing) return;
    navigation.navigate("EditListing", { listing });
  };

  const handleDeleteListing = () => {
    const listing = selectedListing;
    if (!listing) return;

    Alert.alert(
      "Delete listing",
      `Remove "${listing.title}"? Cannot delete listings with active reservations.`,
      [
        { text: "Cancel", style: "cancel", onPress: closeListingActions },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            closeListingActions();
            setIsDeleting(true);
            try {
              await deleteListing(listing.id);
              setListings((prev) => prev.filter((l) => l.id !== listing.id));
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Failed to delete listing";
              setTimeout(() => Alert.alert("Error", msg), 300);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
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
                  onPress={() => navigation.navigate("Notification")}
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
                  onPress={() => navigation.navigate("CreateListing")}
                >
                  <View style={styles.addListingCircle}>
                    <Ionicons name="add" size={20} color="#111111" />
                  </View>
                  <Text style={styles.addListingText}>Add Listing</Text>
                </Pressable>

                {listings.map((listing) => {
                  const isOccupied = occupiedListingIds.has(listing.id);
                  return (
                    <Pressable
                      key={listing.id}
                      style={({ pressed }) => [
                        styles.listingCard,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => handleOpenListing(listing)}
                    >
                      <Pressable
                        onPress={() => openListingActions(listing)}
                        style={({ pressed }) => [
                          styles.listingMenuButton,
                          pressed && styles.pressed,
                        ]}
                        hitSlop={10}
                      >
                        <Ionicons name="ellipsis-horizontal" size={15} color="#555555" />
                      </Pressable>

                      <View style={styles.listingThumbnailPlaceholder}>
                        <Ionicons name="image-outline" size={24} color="#B8B8B8" />
                      </View>

                      <Text style={styles.listingCardTitle} numberOfLines={2}>
                        {listing.title}
                      </Text>

                      {isOccupied ? (
                        <View style={styles.occupiedBadge}>
                          <View style={styles.occupiedDot} />
                          <Text style={styles.occupiedText}>Occupied</Text>
                        </View>
                      ) : (
                        <Text style={[styles.listingStatus, { color: getStatusColor(listing) }]}>
                          {getListingStatusLabel(listing)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
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
                  onPress={() => navigation.navigate("CreateListing")}
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

      <Modal
        transparent
        animationType="fade"
        visible={isListingActionsVisible}
        onRequestClose={closeListingActions}
      >
        <Pressable
          style={styles.actionsBackdrop}
          onPress={closeListingActions}
        >
          <View style={styles.actionsCard}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
              onPress={handleEditListing}
            >
              <Text style={styles.actionButtonText}>Edit listing</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteActionButton,
                pressed && styles.pressed,
              ]}
              onPress={handleDeleteListing}
            >
              <Text style={styles.deleteActionText}>Delete listing</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  paymentAddButton: {
    marginTop: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
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
    position: "relative",
  },
  listingMenuButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
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
  actionsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  actionsCard: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionButton: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
  },
  deleteActionButton: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DC2626",
  },
  deleteActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  occupiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  occupiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  occupiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22C55E",
  },
});
