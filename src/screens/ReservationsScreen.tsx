import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useFavoritesStore } from "../context/favoritesStore";
import { useReservationStore } from "../context/reservationStore";
import {
  fetchReservations,
  cancelReservation,
  Reservation,
  ReservationStatus,
} from "../api/reservations";
import { fetchListings } from "../api/listings";
import { Listing } from "../types/listing";
import { getListingImage } from "../utils/listingImages";

type Props = NativeStackScreenProps<RootStackParamList, "Reservations">;

const MAX_WIDTH = 428;

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const formatDuration = (start: Date, end: Date) => {
  const mins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}.${Math.floor((m / 60) * 10)} hrs`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  active: "#22C55E",
  upcoming: "#F59E0B",
  expired: "#9CA3AF",
  pending: "#3B82F6",
  approved: "#22C55E",
  rejected: "#EF4444",
  cancelled: "#9CA3AF",
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  active: "Active",
  upcoming: "Upcoming",
  expired: "Expired",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function ReservationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavoritesStore();
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [pendingCancelReservation, setPendingCancelReservation] =
    useState<Reservation | null>(null);
  const dismissedCancelledIds = useReservationStore(
    (state) => state.dismissedCancelledIds,
  );
  const dismissCancelledReservation = useReservationStore(
    (state) => state.dismissCancelledReservation,
  );
  const hydrateDismissedReservations = useReservationStore(
    (state) => state.hydrateDismissedReservations,
  );

  useEffect(() => {
    void hydrateDismissedReservations();
  }, [hydrateDismissedReservations]);

  const { data: reservations, isLoading, isError } = useQuery<Reservation[]>({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
  });

  const { data: listings } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: () => fetchListings(),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: (_data, reservationId) => {
      dismissCancelledReservation(reservationId);
      setPendingCancelReservation(null);
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  const handleConfirmCancel = () => {
    if (!pendingCancelReservation || cancelMutation.isPending) {
      return;
    }

    cancelMutation.mutate(pendingCancelReservation.id);
  };

  const closeReservationDetails = () => {
    setSelectedReservation(null);
  };

  const selectedReservationStart = selectedReservation
    ? new Date(selectedReservation.start_time)
    : null;
  const selectedReservationEnd = selectedReservation
    ? new Date(selectedReservation.end_time)
    : null;

  const savedListings = listings?.filter((l) => favorites[l.id]) ?? [];
  const visibleReservations = useMemo(
    () =>
      reservations?.filter(
        (reservation) => !dismissedCancelledIds.includes(reservation.id),
      ) ?? [],
    [dismissedCancelledIds, reservations],
  );

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={10}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
              </Pressable>
              <NotificationsButton onPress={() => navigation.navigate("Notification")} />
            </View>

            <Text style={styles.title}>Reservations</Text>

            {isLoading ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color="#ECAA00" />
            ) : isError ? (
              <Text style={styles.errorText}>Failed to load reservations.</Text>
            ) : (
              <>
                {/* Currently Active */}
                {visibleReservations.filter((r) => r.status === "active").map((r) => {
                  const start = new Date(r.start_time);
                  const end = new Date(r.end_time);
                  return (
                    <Pressable
                      key={r.id}
                      style={({ pressed }) => [
                        styles.activeCard,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => setSelectedReservation(r)}
                    >
                      <View style={styles.activeCardHeader}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeCardLabel}>Currently Parked</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.activeCardTitle} numberOfLines={1}>
                        {r.listing?.title ?? "Listing"}
                      </Text>
                      <Text style={styles.activeCardAddress} numberOfLines={1}>
                        {r.listing?.address ?? ""}
                      </Text>
                      <Text style={styles.activeCardTime}>
                        {formatTime(start)} – {formatTime(end)} · {formatDate(start)}
                      </Text>
                    </Pressable>
                  );
                })}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {!visibleReservations || visibleReservations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No reservations yet</Text>
                    <Text style={styles.emptyText}>
                      Reserve a listing and it will show up here.
                    </Text>
                  </View>
                ) : (
                  visibleReservations.map((r) => {
                    const start = new Date(r.start_time);
                    const end = new Date(r.end_time);
                    const status = r.status;
                    const isDimmed = status === "expired" || status === "rejected" || status === "cancelled";
                    const canCancel = status === "pending";
                    const canDismiss =
                      status === "cancelled" ||
                      status === "expired" ||
                      status === "rejected";

                    return (
                      <Pressable
                        key={r.id}
                        style={({ pressed }) => [
                          styles.card,
                          isDimmed && styles.dimmedCard,
                          pressed && { opacity: 0.75 },
                        ]}
                        onPress={() => setSelectedReservation(r)}
                      >
                        <View style={styles.cardImageWrapper}>
                          {r.listing ? (
                            <Image
                              source={getListingImage(r.listing as unknown as Listing)}
                              style={styles.cardImage}
                            />
                          ) : (
                            <View style={[styles.cardImage, styles.imagePlaceholder]} />
                          )}
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: STATUS_COLORS[status] },
                            ]}
                          >
                            <Text style={styles.statusBadgeText}>
                              {STATUS_LABELS[status]}
                            </Text>
                          </View>

                          {canDismiss ? (
                            <Pressable
                              style={({ pressed }) => [
                                styles.dismissButton,
                                pressed && styles.dismissButtonPressed,
                              ]}
                              onPress={(event) => {
                                event.stopPropagation();
                                dismissCancelledReservation(r.id);
                              }}
                              hitSlop={8}
                            >
                              <Ionicons name="close" size={14} color="#111111" />
                            </Pressable>
                          ) : null}
                        </View>

                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {r.listing?.title ?? "Listing"}
                        </Text>
                        <Text style={styles.cardMeta}>
                          {formatDate(start)} | {formatTime(start)}
                        </Text>
                        <Text style={styles.cardDuration}>
                          {formatDuration(start, end)}
                        </Text>

                        {canCancel && (
                          <Pressable
                            style={[
                              styles.actionButton,
                              styles.cancelButton,
                              cancelMutation.isPending && { opacity: 0.6 },
                            ]}
                            onPress={() => setPendingCancelReservation(r)}
                            disabled={cancelMutation.isPending}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </Pressable>
                        )}

                        {(status === "expired") && (
                          <Pressable
                            style={[styles.actionButton, styles.renewButton]}
                            onPress={() =>
                              navigation.navigate("Reserve", { id: r.listing_id })
                            }
                          >
                            <Text style={styles.renewButtonText}>Renew</Text>
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
              </>
            )}

            <View style={styles.section}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Saved Listings</Text>

              {savedListings.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.listItem,
                    index < savedListings.length - 1 && styles.listItemDivider,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => navigation.navigate("Details", { id: item.id })}
                >
                  <Image source={getListingImage(item)} style={styles.avatarImage} />
                  <View style={styles.listTextBlock}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>{item.rating ?? "New"}</Text>
                      {item.rating ? (
                        <Ionicons name="star" size={14} color="#F59E0B" style={{ marginLeft: 4 }} />
                      ) : null}
                    </View>
                    <Text style={styles.savedAddress}>{item.address}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Listings" />
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={pendingCancelReservation !== null}
        onRequestClose={() => {
          if (!cancelMutation.isPending) {
            setPendingCancelReservation(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Cancel reservation?</Text>
            <Text style={styles.confirmText}>
              {pendingCancelReservation
                ? `Are you sure you want to cancel ${
                    pendingCancelReservation.listing?.title ?? "this reservation"
                  }?`
                : ""}
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonBorder,
                  pressed && styles.dismissButtonPressed,
                ]}
                onPress={() => setPendingCancelReservation(null)}
                disabled={cancelMutation.isPending}
              >
                <Text style={styles.confirmKeepText}>Keep</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.dismissButtonPressed,
                ]}
                onPress={handleConfirmCancel}
                disabled={cancelMutation.isPending}
              >
                <Text style={styles.confirmCancelText}>
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel reservation"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={selectedReservation !== null}
        onRequestClose={closeReservationDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Reservation Details</Text>
              <Pressable onPress={closeReservationDetails} hitSlop={10}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </Pressable>
            </View>

            {selectedReservation && selectedReservationStart && selectedReservationEnd ? (
              <>
                <View style={styles.detailsStatusRow}>
                  <Text style={styles.detailsListingTitle}>
                    {selectedReservation.listing?.title ?? "Listing"}
                  </Text>
                  <View
                    style={[
                      styles.detailsStatusBadge,
                      {
                        backgroundColor:
                          STATUS_COLORS[selectedReservation.status],
                      },
                    ]}
                  >
                    <Text style={styles.detailsStatusText}>
                      {STATUS_LABELS[selectedReservation.status]}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailsAddress}>
                  {selectedReservation.listing?.address ?? "Address not available"}
                </Text>

                <View style={styles.detailsList}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Date</Text>
                    <Text style={styles.detailsValue}>
                      {formatDate(selectedReservationStart)}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Time</Text>
                    <Text style={styles.detailsValue}>
                      {formatTime(selectedReservationStart)} -{" "}
                      {formatTime(selectedReservationEnd)}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Duration</Text>
                    <Text style={styles.detailsValue}>
                      {formatDuration(
                        selectedReservationStart,
                        selectedReservationEnd,
                      )}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Total</Text>
                    <Text style={styles.detailsValue}>
                      ${selectedReservation.total_price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsActions}>
                  {selectedReservation.status === "pending" ? (
                    <Pressable
                      style={({ pressed }) => [
                        styles.detailsPrimaryButton,
                        pressed && styles.dismissButtonPressed,
                      ]}
                      onPress={() => {
                        setPendingCancelReservation(selectedReservation);
                        closeReservationDetails();
                      }}
                    >
                      <Text style={styles.detailsPrimaryButtonText}>
                        Cancel reservation
                      </Text>
                    </Pressable>
                  ) : null}

                  {selectedReservation.status === "expired" ? (
                    <Pressable
                      style={({ pressed }) => [
                        styles.detailsPrimaryButton,
                        pressed && styles.dismissButtonPressed,
                      ]}
                      onPress={() => {
                        const listingId = selectedReservation.listing_id;
                        closeReservationDetails();
                        navigation.navigate("Reserve", { id: listingId });
                      }}
                    >
                      <Text style={styles.detailsPrimaryButtonText}>Renew</Text>
                    </Pressable>
                  ) : null}

                  {(selectedReservation.status === "active" ||
                    selectedReservation.status === "approved" ||
                    selectedReservation.status === "upcoming") ? (
                    <Pressable
                      style={({ pressed }) => [
                        styles.detailsPrimaryButton,
                        pressed && styles.dismissButtonPressed,
                      ]}
                      onPress={() => {
                        const reservationId = selectedReservation.id;
                        closeReservationDetails();
                        navigation.navigate("ActiveReservation", {
                          reservationId,
                        });
                      }}
                    >
                      <Text style={styles.detailsPrimaryButtonText}>
                        View reservation
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.detailsSecondaryButton,
                      pressed && styles.dismissButtonPressed,
                    ]}
                    onPress={closeReservationDetails}
                  >
                    <Text style={styles.detailsSecondaryButtonText}>Close</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  activeCard: {
    backgroundColor: "#22C55E",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  activeCardLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  activeCardAddress: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  activeCardTime: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  scrollContainer: { flex: 1 },
  pageMax: {
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  topArea: { backgroundColor: "#FFFFFF" },
  topRow: {
    height: 44,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
    marginTop: 20,
    marginBottom: 18,
  },
  errorText: { color: "#EF4444", marginBottom: 16 },
  cardsRow: { paddingBottom: 26 },
  emptyState: {
    width: 220,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#111111" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#555555", lineHeight: 18 },
  card: { width: 134, marginRight: 18, alignItems: "center" },
  dimmedCard: { opacity: 0.75 },
  cardImageWrapper: { position: "relative" },
  cardImage: { width: 118, height: 118, borderRadius: 18, marginBottom: 6 },
  imagePlaceholder: { backgroundColor: "#E5E5E5" },
  dismissButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButtonPressed: {
    opacity: 0.72,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  confirmTitle: {
    paddingTop: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },
  confirmText: {
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 24,
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    textAlign: "center",
  },
  confirmActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonBorder: {
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  confirmKeepText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#D97706",
  },
  detailsCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111111",
  },
  detailsStatusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  detailsListingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  detailsStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailsStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsAddress: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsList: {
    gap: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  detailsValue: {
    flex: 1,
    fontSize: 14,
    color: "#111111",
    textAlign: "right",
  },
  detailsActions: {
    marginTop: 24,
    gap: 12,
  },
  detailsPrimaryButton: {
    backgroundColor: "#ECAA00",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  detailsPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  detailsSecondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 14,
    alignItems: "center",
  },
  detailsSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
  },
  statusBadge: {
    position: "absolute",
    bottom: 12,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },
  cardMeta: { fontSize: 12, color: "#555555", textAlign: "center", marginTop: 2 },
  cardDuration: {
    fontSize: 12,
    color: "#111111",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#D1D5DB" },
  cancelButtonText: { color: "#374151", fontSize: 12, fontWeight: "600" },
  renewButton: { backgroundColor: "#ECAA00" },
  renewButtonText: { color: "#111111", fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 14,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 14,
  },
  listItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  listTextBlock: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 2,
  },
  savedAddress: { fontSize: 14, color: "#111111", marginTop: 2 },
  navbarWrapper: { backgroundColor: "#FFFFFF" },
  navbarContent: { width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  ratingText: { fontSize: 14, color: "#111111" },
  sectionDivider: { height: 1, backgroundColor: "#E5E5E5", marginBottom: 18 },
});
