import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { fetchUserById } from "../api/user";
import { approveReservation, fetchReservationForHost, rejectReservation } from "../api/reservations";
import { fetchUserReviews } from "../api/reviews";
import { supabase } from "../utils/supabase";

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = NativeStackScreenProps<RootStackParamList, "GuestProfile">["route"];

const MAX_WIDTH = 428;

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function GuestProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp>();
  const insets = useSafeAreaInsets();
  const { guestId, reservationId } = route.params;

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState(false);

  const { data: guest, isLoading: loadingGuest } = useQuery({
    queryKey: ["user", guestId],
    queryFn: () => fetchUserById(guestId),
  });

  const { data: reservation, isLoading: loadingReservation } = useQuery({
    queryKey: ["reservation-for-host", reservationId],
    queryFn: () => fetchReservationForHost(reservationId),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews-user", guestId],
    queryFn: () => fetchUserReviews(guestId),
  });

  const isLoading = loadingGuest || loadingReservation;

  const guestName = guest ? `${guest.first_name} ${guest.last_name}` : "Guest";

  const totalRatings = reviews.length;
  const avgRating = totalRatings
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : null;

  const handleMessage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const myId = session?.user?.id;
    if (!myId || !reservation) return;

    // Caller is the host — pass their ID as hostId and the guest's ID as guestId
    navigation.navigate("Conversation", {
      listingId: reservation.listing_id,
      hostId: myId,
      guestId,
      hostName: guestName,
      listingTitle: reservation.listing?.title,
    });
  };

  const handleApprove = async () => {
    setApprovingId(reservationId);
    try {
      await approveReservation(reservationId);
      setActionDone(true);
      Alert.alert("Approved", "Reservation approved.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    setRejectingId(reservationId);
    try {
      await rejectReservation(reservationId);
      setActionDone(true);
      Alert.alert("Rejected", "Reservation rejected.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setRejectingId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#ECAA00" />
      </View>
    );
  }

  const startDate = reservation ? new Date(reservation.start_time) : null;
  const endDate = reservation ? new Date(reservation.end_time) : null;
  const busy = !!approvingId || !!rejectingId;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.pageMax, { paddingTop: insets.top + 10 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>
        </View>

        {/* Profile row */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {guest?.first_name?.[0]?.toUpperCase() ?? "G"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{guestName}</Text>
            <Text style={styles.role}>Guest</Text>
            <Text style={styles.memberSince}>
              Member since{" "}
              {guest
                ? new Date(guest.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.messageBtn, pressed && { opacity: 0.8 }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={14} color="#111111" />
              <Text style={styles.messageBtnText}>Message Guest</Text>
            </Pressable>
          </View>
        </View>

        {/* Ratings summary */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Total Ratings</Text>
            <Text style={styles.ratingValue}>{totalRatings}</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Average Rating</Text>
            <Text style={styles.ratingValue}>{avgRating ? `${avgRating} / 5` : "—"}</Text>
          </View>
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Previous Reviews</Text>
            {reviews.map((r) => (
              <View key={r.id} style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {r.reviewer?.first_name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>
                    {r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}` : "Host"}
                  </Text>
                  {r.reservation?.listing?.title ? (
                    <Text style={styles.reviewListingTitle}>{r.reservation.listing.title}</Text>
                  ) : null}
                  <StarRow rating={r.rating} />
                  {r.comment ? <Text style={styles.reviewText}>{r.comment}</Text> : null}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Booking request */}
        {reservation && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: reviews.length > 0 ? 20 : 0 }]}>
              Booking Request
            </Text>

            <View style={styles.bookingRow}>
              <View style={styles.yellowCard}>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardMain}>
                  {startDate?.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }) ?? "—"}
                </Text>
                <Text style={styles.cardLabel}>Time Range</Text>
                <Text style={styles.cardMain}>
                  {startDate?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) ?? "—"}
                  {" – "}
                  {endDate?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) ?? "—"}
                </Text>
              </View>

              <View style={styles.whiteCard}>
                <Text style={styles.cardLabel}>Listing</Text>
                <Text style={styles.cardMain} numberOfLines={2}>
                  {reservation.listing?.title ?? "—"}
                </Text>
                <Text style={styles.cardLabel}>Earnings</Text>
                <Text style={styles.cardMain}>${reservation.total_price.toFixed(2)}</Text>
              </View>
            </View>

            {!actionDone && reservation.status === "pending" && (
              <>
                <Pressable
                  style={[styles.approveBtn, busy && { opacity: 0.5 }]}
                  onPress={handleApprove}
                  disabled={busy}
                >
                  <Text style={styles.approveBtnText}>
                    {approvingId ? "Approving..." : "Approve Booking"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.rejectBtn, busy && { opacity: 0.5 }]}
                  onPress={handleReject}
                  disabled={busy}
                >
                  <Text style={styles.rejectBtnText}>
                    {rejectingId ? "Rejecting..." : "Reject"}
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  header: { marginBottom: 16 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 28, fontWeight: "700", color: "#111111" },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "600", color: "#111111", marginBottom: 2 },
  role: { fontSize: 14, color: "#ECAA00", fontWeight: "600", marginBottom: 4 },
  memberSince: { fontSize: 13, color: "#777777", marginBottom: 10 },
  messageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECAA00",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  messageBtnText: { fontSize: 13, fontWeight: "600", color: "#111111" },
  ratingCard: {
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ratingItem: { flex: 1, alignItems: "center" },
  ratingDivider: { width: 1, backgroundColor: "#E5E5E5" },
  ratingLabel: { fontSize: 12, color: "#777777", marginBottom: 4 },
  ratingValue: { fontSize: 20, fontWeight: "700", color: "#111111" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 12,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 14, fontWeight: "700", color: "#111111" },
  reviewerName: { fontSize: 14, fontWeight: "600", color: "#111111", marginBottom: 2 },
  reviewListingTitle: { fontSize: 12, color: "#777777", marginBottom: 4 },
  reviewText: { fontSize: 13, color: "#555555", marginTop: 4 },
  bookingRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  yellowCard: {
    flex: 1,
    backgroundColor: "#ECAA00",
    padding: 14,
    borderRadius: 16,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    padding: 14,
    borderRadius: 16,
  },
  cardLabel: { fontSize: 12, color: "#555555", marginBottom: 2 },
  cardMain: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 10,
  },
  approveBtn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  approveBtnText: { fontWeight: "600", color: "#FFFFFF", fontSize: 15 },
  rejectBtn: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  rejectBtnText: { fontWeight: "600", color: "#374151", fontSize: 15 },
});
