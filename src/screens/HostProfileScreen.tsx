import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  GestureResponderEvent,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";
import { getMyProfile, UserProfile } from "../api/user";
import { usePaymentMethods } from "../context/paymentMethodsContext";
import { deleteListing, fetchMyListings } from "../api/listings";
import {
  approveReservation,
  fetchHostingReservations,
  fetchHostStats,
  HostStats,
  rejectReservation,
  Reservation,
} from "../api/reservations";
import {
  CompletedReservation,
  createReview,
  fetchPendingReviews,
} from "../api/reviews";
import type { Listing } from "../types/listing";
import { getListingImage } from "../utils/listingImages";
import { supabase } from "../utils/supabase";
import { getProfileDisplayName, getProfileInitial } from "../utils/profile";
import { useProfileImage } from "../hooks/useProfileImage";

type ExtendedRootStackParamList = RootStackParamList & {
  GuestReviews: {
    guestId: string;
    guestName: string;
  };
};

type HostProfileScreenNavigationProp = NativeStackNavigationProp<
  ExtendedRootStackParamList,
  "Profile"
>;
type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const MAX_WIDTH = 428;
let cachedHostProfile: UserProfile | null = null;

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

function ListingRowActions({
  listing,
  onEdit,
  onOpenActions,
  badge,
}: {
  listing: Listing;
  onEdit: () => void;
  onOpenActions: () => void;
  badge: React.ReactNode;
}) {
  return (
    <View style={styles.inactiveCard}>
      <Pressable
        onPress={onOpenActions}
        style={({ pressed }) => [
          styles.inactiveMenuButton,
          pressed && styles.pressed,
        ]}
        hitSlop={10}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color="#555555" />
      </Pressable>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.inactiveCardContent,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.inactiveCardInfo}>
          <Text style={styles.inactiveCardTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={styles.inactiveCardSub}>
            {listing.is_draft ? "Tap to continue editing" : listing.address}
          </Text>
        </View>
        {badge}
      </Pressable>
    </View>
  );
}

export default function HostProfileScreen({ route }: Props) {
  const navigation = useNavigation<HostProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { defaultMethod } = usePaymentMethods();

  const [profile, setProfile] = useState<UserProfile | null>(cachedHostProfile);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<HostStats>({
    completed_bookings: 0,
    wallet_balance: 0,
  });
  const [occupiedListingIds, setOccupiedListingIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>(
    [],
  );
  const [completedReservations, setCompletedReservations] = useState<
    CompletedReservation[]
  >([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<Reservation | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Reservation | null>(null);
  const [showApproveSuccessModal, setShowApproveSuccessModal] = useState(false);
  const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);

  const [reviewTarget, setReviewTarget] = useState<CompletedReservation | null>(
    null,
  );
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isListingActionsVisible, setIsListingActionsVisible] = useState(false);
  const [pendingDeleteListing, setPendingDeleteListing] =
    useState<Listing | null>(null);
  const [deletedListingIds, setDeletedListingIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const nextProfile = await getMyProfile();
      cachedHostProfile = nextProfile;
      setProfile(nextProfile);
    } catch {
      cachedHostProfile = null;
      setProfile(null);
    }
  }, []);

  const loadHostListings = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      if (!userId) {
        setListings([]);
        return;
      }

      const [myListings, hostStats, hostingReservations] = await Promise.all([
        fetchMyListings(),
        fetchHostStats(),
        fetchHostingReservations(),
      ]);

      setListings(
        myListings.filter((listing) => !deletedListingIds.has(listing.id)),
      );
      setStats(hostStats);

      const activeIds = new Set<string>(
        hostingReservations
          .filter((r: { status: string }) => r.status === "active")
          .map((r: { listing_id: string }) => r.listing_id),
      );
      setOccupiedListingIds(activeIds);
      setPendingReservations(
        hostingReservations.filter((r: { status: string }) => r.status === "pending"),
      );

      const completed = await fetchPendingReviews();
      setCompletedReservations(
        completed.sort(
          (a, b) =>
            new Date(b.end_time).getTime() - new Date(a.end_time).getTime(),
        ),
      );
    } catch (error) {
      console.error("Failed to load host data:", error);
      setListings([]);
    }
  }, [deletedListingIds]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
      void loadHostListings();
    }, [loadProfile, loadHostListings]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!route.params?.refreshKey) {
        return undefined;
      }

      void loadHostListings();
      return undefined;
    }, [loadHostListings, route.params?.refreshKey]),
  );

  const hostName = useMemo(() => getProfileDisplayName(profile), [profile]);
  const avatarInitial = getProfileInitial(profile);
  const { profileImageUri } = useProfileImage(profile?.id);

  const balance = stats.wallet_balance;
  const completedBookings = stats.completed_bookings;
  const hasPaymentMethod = !!defaultMethod;
  const activeListings = listings.filter((l) => l.is_active && !l.is_draft);
  const inactiveListings = listings.filter((l) => !l.is_active && !l.is_draft);
  const draftListings = listings.filter((l) => l.is_draft);
  const hasListings = listings.length > 0;
  const hasBalance = balance > 0;
  const hasCompletedBookings = completedBookings > 0;

  const openApproveModal = (reservation: Reservation) => {
    if (approvingId || rejectingId) return;
    setApproveTarget(reservation);
  };

  const closeApproveModal = () => {
    if (approvingId) return;
    setApproveTarget(null);
  };

  const openRejectModal = (reservation: Reservation) => {
    if (approvingId || rejectingId) return;
    setRejectTarget(reservation);
  };

  const closeRejectModal = () => {
    if (rejectingId) return;
    setRejectTarget(null);
  };

  const handleApprove = async () => {
    const target = approveTarget;
    if (!target) return;

    setApproveTarget(null);
    setApprovingId(target.id);

    try {
      await approveReservation(target.id);
      setPendingReservations((prev) => prev.filter((r) => r.id !== target.id));
      await loadHostListings();
      setShowApproveSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    const target = rejectTarget;
    if (!target) return;

    setRejectTarget(null);
    setRejectingId(target.id);

    try {
      await rejectReservation(target.id);
      setPendingReservations((prev) => prev.filter((r) => r.id !== target.id));
      await loadHostListings();
      setShowRejectSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setRejectingId(null);
    }
  };

  const openReviewModal = (reservation: CompletedReservation) => {
    setReviewTarget(reservation);
    setReviewRating(0);
    setReviewComment("");
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || reviewRating === 0 || isSubmittingReview) {
      return;
    }

    setIsSubmittingReview(true);
    try {
      await createReview({
        reservation_id: reviewTarget.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
        target_user_id:
          reviewTarget.role === "host" ? reviewTarget.guest?.id : undefined,
        target_listing_id:
          reviewTarget.role === "guest" ? reviewTarget.listing_id : undefined,
      });

      setCompletedReservations((prev) =>
        prev.filter(
          (reservation) =>
            !(
              reservation.id === reviewTarget.id &&
              reservation.role === reviewTarget.role
            ),
        ),
      );
      closeReviewModal();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit review";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenListing = (listing: Listing) => {
    navigation.navigate("Details", { id: listing.id });
  };

  const openListingActions = (
    listing: Listing,
    event?: GestureResponderEvent,
  ) => {
    event?.stopPropagation();
    setSelectedListing(listing);
    setIsListingActionsVisible(true);
  };

  const closeListingActions = () => {
    setSelectedListing(null);
    setIsListingActionsVisible(false);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setPendingDeleteListing(null);
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
    closeListingActions();
    setPendingDeleteListing(listing);
  };

  const confirmDeleteListing = async () => {
    const listing = pendingDeleteListing;
    if (!listing || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteListing(listing.id);
      setDeletedListingIds((prev) => {
        const next = new Set(prev);
        next.add(listing.id);
        return next;
      });
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      setOccupiedListingIds((prev) => {
        const next = new Set(prev);
        next.delete(listing.id);
        return next;
      });
      setPendingDeleteListing(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete listing";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setIsDeleting(false);
    }
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
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color="#111111"
                  />
                </Pressable>

                <NotificationsButton
                  onPress={() => navigation.navigate("Notification")}
                />
              </View>
            </View>

            <View style={styles.hostHeaderRow}>
              <View style={styles.hostAvatar}>
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.hostAvatarImage}
                  />
                ) : (
                  <Text style={styles.hostAvatarText}>{avatarInitial}</Text>
                )}
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
                <Text style={styles.metricFooterValue}>{completedBookings}</Text>
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

                {activeListings.map((listing) => {
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
                        onPress={(event) => openListingActions(listing, event)}
                        style={({ pressed }) => [
                          styles.listingMenuButton,
                          pressed && styles.pressed,
                        ]}
                        hitSlop={10}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={15}
                          color="#555555"
                        />
                      </Pressable>

                      <View style={styles.listingThumbnailPlaceholder}>
                        <Image
                          source={getListingImage(listing)}
                          style={styles.listingThumbnailImage}
                          resizeMode="cover"
                        />
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
                        <Text
                          style={[
                            styles.listingStatus,
                            { color: getStatusColor(listing) },
                          ]}
                        >
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

            {pendingReservations.length > 0 && (
              <View style={styles.pendingSection}>
                <Text style={styles.pendingSectionTitle}>Pending Approval</Text>
                {pendingReservations.map((r) => {
                  const start = new Date(r.start_time);
                  const end = new Date(r.end_time);
                  const isApproving = approvingId === r.id;
                  const isRejecting = rejectingId === r.id;
                  const busy = isApproving || isRejecting;

                  return (
                    <View key={r.id} style={styles.pendingCard}>
                      <View style={styles.pendingCardInfo}>
                        <Text style={styles.pendingCardTitle} numberOfLines={1}>
                          {r.listing?.title ?? "Listing"}
                        </Text>
                        <Text style={styles.pendingCardMeta}>
                          {r.guest
                            ? `${r.guest.first_name} ${r.guest.last_name}`
                            : "Guest"}
                        </Text>
                        <Text style={styles.pendingCardTime}>
                          {start.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {" · "}
                          {start.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {end.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                        <Text style={styles.pendingCardPrice}>
                          ${r.total_price.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.pendingCardActions}>
                        <Pressable
                          style={styles.viewProfileButton}
                          onPress={() =>
                            navigation.navigate("GuestProfile", {
                              guestId: r.user_id,
                              reservationId: r.id,
                            })
                          }
                        >
                          <Text style={styles.viewProfileButtonText}>
                            View Profile
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[styles.approveButton, busy && { opacity: 0.5 }]}
                          onPress={() => openApproveModal(r)}
                          disabled={busy}
                        >
                          <Text style={styles.approveButtonText}>
                            {isApproving ? "..." : "Approve"}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[styles.rejectButton, busy && { opacity: 0.5 }]}
                          onPress={() => openRejectModal(r)}
                          disabled={busy}
                        >
                          <Text style={styles.rejectButtonText}>
                            {isRejecting ? "..." : "Reject"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {completedReservations.length > 0 && (
              <View style={styles.completedSection}>
                <Text style={styles.completedSectionTitle}>
                  Completed Listings
                </Text>
                {completedReservations.map((reservation) => {
                  const start = new Date(reservation.start_time);
                  const cardTitle =
                    reservation.role === "host"
                      ? reservation.guest
                        ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                        : "Guest"
                      : reservation.listing?.title ?? "Listing";

                  return (
                    <Pressable
                      key={`${reservation.id}-${reservation.role}`}
                      style={({ pressed }) => [
                        styles.completedCard,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => openReviewModal(reservation)}
                    >
                      <View style={styles.completedCardInfo}>
                        <Text
                          style={styles.completedCardTitle}
                          numberOfLines={1}
                        >
                          {cardTitle}
                        </Text>
                        <Text style={styles.completedCardSub}>
                          {reservation.role === "host"
                            ? "Review guest"
                            : "Review listing"}
                        </Text>
                        <Text style={styles.completedCardDate}>
                          {start.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#AAAAAA"
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}

            {draftListings.length > 0 && (
              <View style={styles.inactiveSection}>
                <Text style={styles.inactiveSectionTitle}>Draft Listings</Text>
                {draftListings.map((listing) => (
                  <ListingRowActions
                    key={listing.id}
                    listing={listing}
                    onEdit={() =>
                      navigation.navigate("EditListing", { listing })
                    }
                    onOpenActions={() => openListingActions(listing)}
                    badge={
                      <View
                        style={[
                          styles.inactiveBadge,
                          { backgroundColor: "#FEF3C7" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.inactiveBadgeText,
                            { color: "#92400E" },
                          ]}
                        >
                          Draft
                        </Text>
                      </View>
                    }
                  />
                ))}
              </View>
            )}

            {inactiveListings.length > 0 && (
              <View style={styles.inactiveSection}>
                <Text style={styles.inactiveSectionTitle}>
                  Inactive Listings
                </Text>
                {inactiveListings.map((listing) => (
                  <ListingRowActions
                    key={listing.id}
                    listing={listing}
                    onEdit={() =>
                      navigation.navigate("EditListing", { listing })
                    }
                    onOpenActions={() => openListingActions(listing)}
                    badge={
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>Inactive</Text>
                      </View>
                    }
                  />
                ))}
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
        visible={approveTarget !== null}
        onRequestClose={closeApproveModal}
      >
        <Pressable style={styles.actionsBackdrop} onPress={closeApproveModal}>
          <Pressable
            style={styles.confirmModalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.confirmModalTitle}>Approve booking?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to approve this booking request?
            </Text>

            <View style={styles.confirmModalActions}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={closeApproveModal}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmApproveButton}
                onPress={() => void handleApprove()}
              >
                <Text style={styles.confirmApproveText}>Approve</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={rejectTarget !== null}
        onRequestClose={closeRejectModal}
      >
        <Pressable style={styles.actionsBackdrop} onPress={closeRejectModal}>
          <Pressable
            style={styles.confirmModalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.confirmModalTitle}>Reject booking?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to reject this booking request?
            </Text>

            <View style={styles.confirmModalActions}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={closeRejectModal}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmRejectButton}
                onPress={() => void handleReject()}
              >
                <Text style={styles.confirmRejectText}>Reject</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showApproveSuccessModal}
        onRequestClose={() => setShowApproveSuccessModal(false)}
      >
        <View style={styles.actionsBackdrop}>
          <View style={styles.successModalCard}>
            <Text style={styles.successModalTitle}>
              Confirmation Successful
            </Text>
            <Text style={styles.successModalText}>
              The booking request has been successfully approved.
            </Text>

            <Pressable
              style={styles.successModalButton}
              onPress={() => setShowApproveSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={showRejectSuccessModal}
        onRequestClose={() => setShowRejectSuccessModal(false)}
      >
        <View style={styles.actionsBackdrop}>
          <View style={styles.successModalCard}>
            <Text style={styles.successModalTitle}>Rejection Successful</Text>
            <Text style={styles.successModalText}>
              The booking request has been successfully rejected.
            </Text>

            <Pressable
              style={styles.successModalButton}
              onPress={() => setShowRejectSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={!!reviewTarget}
        onRequestClose={closeReviewModal}
      >
        <Pressable style={styles.actionsBackdrop} onPress={closeReviewModal}>
          <Pressable
            style={styles.reviewModalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.reviewModalTitle}>
              {reviewTarget?.role === "host" ? "Rate Guest" : "Rate Listing"}
            </Text>
            <Text style={styles.reviewModalSub} numberOfLines={1}>
              {reviewTarget?.role === "host"
                ? reviewTarget.guest
                  ? `${reviewTarget.guest.first_name} ${reviewTarget.guest.last_name}`
                  : "Guest"
                : reviewTarget?.listing?.title ?? "Listing"}
            </Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable
                  key={i}
                  onPress={() => setReviewRating(i)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={i <= reviewRating ? "star" : "star-outline"}
                    size={32}
                    color="#F59E0B"
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor="#AAAAAA"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={[
                styles.reviewSubmitBtn,
                (reviewRating === 0 || isSubmittingReview) &&
                  styles.reviewSubmitDisabled,
              ]}
              onPress={() => void handleSubmitReview()}
              disabled={reviewRating === 0 || isSubmittingReview}
            >
              <Text style={styles.reviewSubmitBtnText}>
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isListingActionsVisible}
        onRequestClose={closeListingActions}
      >
        <Pressable style={styles.actionsBackdrop} onPress={closeListingActions}>
          <Pressable
            style={styles.actionsCard}
            onPress={(event) => event.stopPropagation()}
          >
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
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={pendingDeleteListing !== null}
        onRequestClose={closeDeleteModal}
      >
        <Pressable style={styles.actionsBackdrop} onPress={closeDeleteModal}>
          <Pressable
            style={styles.deleteConfirmCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.deleteConfirmTitle}>Delete listing?</Text>
            <Text style={styles.deleteConfirmText}>
              {pendingDeleteListing
                ? `Remove "${pendingDeleteListing.title}"? Listings with active reservations cannot be deleted.`
                : "Remove this listing?"}
            </Text>

            <View style={styles.deleteConfirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteCancelButton,
                  (pressed || isDeleting) && styles.pressed,
                ]}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteConfirmButton,
                  (pressed || isDeleting) && styles.pressed,
                ]}
                onPress={() => void confirmDeleteListing()}
                disabled={isDeleting}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
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
    overflow: "hidden",
  },
  hostAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    overflow: "hidden",
    backgroundColor: "#F3E6E6",
  },
  listingThumbnailImage: {
    width: "100%",
    height: "100%",
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
  deleteConfirmCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  deleteConfirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  deleteConfirmText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555555",
  },
  deleteConfirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  deleteCancelButton: {
    minWidth: 96,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  deleteCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  deleteConfirmButton: {
    minWidth: 96,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#DC2626",
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
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
  pendingSection: {
    marginTop: 24,
  },
  pendingSectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 12,
  },
  pendingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  pendingCardInfo: {
    flex: 1,
  },
  pendingCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  pendingCardMeta: {
    fontSize: 13,
    color: "#555555",
    marginBottom: 2,
  },
  pendingCardTime: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 4,
  },
  pendingCardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  pendingCardActions: {
    gap: 8,
  },
  approveButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    alignItems: "center",
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  viewProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  viewProfileButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },
  completedSection: {
    marginTop: 24,
  },
  completedSectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 12,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  completedCardInfo: {
    flex: 1,
  },
  completedCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  completedCardSub: {
    fontSize: 12,
    color: "#ECAA00",
    fontWeight: "600",
    marginBottom: 2,
  },
  completedCardDate: {
    fontSize: 12,
    color: "#777777",
  },
  reviewModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  reviewModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
    textAlign: "center",
  },
  reviewModalSub: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginBottom: 20,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  reviewInput: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111111",
    marginBottom: 16,
  },
  reviewSubmitBtn: {
    backgroundColor: "#ECAA00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  reviewSubmitDisabled: {
    opacity: 0.5,
  },
  reviewSubmitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  inactiveSection: {
    marginTop: 24,
  },
  inactiveSectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 12,
  },
  inactiveCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    opacity: 0.75,
  },
  inactiveCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  inactiveMenuButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  inactiveCardInfo: {
    flex: 1,
  },
  inactiveCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  inactiveCardSub: {
    fontSize: 12,
    color: "#777777",
  },
  inactiveBadge: {
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
  },

  confirmModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  confirmModalText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 18,
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confirmApproveButton: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmApproveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confirmRejectButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmRejectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  successModalCard: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    textAlign: "center",
  },
  successModalText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  successModalButton: {
    backgroundColor: "#ECAA00",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  successModalButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});
