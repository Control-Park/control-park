import React, { useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
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
    queryFn: fetchListings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: (_data, reservationId) => {
      dismissCancelledReservation(reservationId);
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

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
                      onPress={() =>
                        navigation.navigate("ActiveReservation", { reservationId: r.id })
                      }
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
                        onPress={() => {
                          if (status === "active" || status === "upcoming" || status === "approved") {
                            navigation.navigate("ActiveReservation", { reservationId: r.id });
                          }
                        }}
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
                            onPress={() => cancelMutation.mutate(r.id)}
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

              {savedListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.listItem,
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
  listItem: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
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
