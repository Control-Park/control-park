import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { RootStackParamList } from "../navigation/AppNavigator";
import {
  fetchHostingReservations,
  approveReservation,
  rejectReservation,
  Reservation,
  ReservationStatus,
} from "../api/reservations";

type Props = NativeStackScreenProps<RootStackParamList, "HostReservations">;

const MAX_WIDTH = 428;

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

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (start: string, end: string) => {
  const mins = Math.max(
    15,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
};

export default function HostReservationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading, isError, refetch } = useQuery<Reservation[]>({
    queryKey: ["hosting-reservations"],
    queryFn: fetchHostingReservations,
  });

  const approveMutation = useMutation({
    mutationFn: approveReservation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hosting-reservations"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to approve reservation";
      console.error("approve error:", msg);
      setTimeout(() => Alert.alert("Error", msg), 300);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReservation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hosting-reservations"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to reject reservation";
      console.error("reject error:", msg);
      setTimeout(() => Alert.alert("Error", msg), 300);
    },
  });

  const handleApprove = (r: Reservation) => {
    approveMutation.mutate(r.id);
  };

  const handleReject = (r: Reservation) => {
    rejectMutation.mutate(r.id);
  };

  const pending = reservations?.filter((r) => r.status === "pending") ?? [];
  const others = reservations?.filter((r) => r.status !== "pending") ?? [];

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
            </View>

            <Text style={styles.title}>Manage Reservations</Text>

            {isLoading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#ECAA00" />
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load.</Text>
                <Pressable onPress={() => void refetch()} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {pending.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>Awaiting Approval</Text>
                    {pending.map((r) => (
                      <ReservationCard
                        key={r.id}
                        reservation={r}
                        onApprove={() => handleApprove(r)}
                        onReject={() => handleReject(r)}
                        isApproving={approveMutation.isPending && approveMutation.variables === r.id}
                        isRejecting={rejectMutation.isPending && rejectMutation.variables === r.id}
                      />
                    ))}
                  </>
                )}

                {others.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>History</Text>
                    {others.map((r) => (
                      <ReservationCard key={r.id} reservation={r} />
                    ))}
                  </>
                )}

                {(!reservations || reservations.length === 0) && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No reservations yet</Text>
                    <Text style={styles.emptyText}>
                      Guests reserve your listings and they will appear here.
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={{ height: 60 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface CardProps {
  reservation: Reservation;
  onApprove?: () => void;
  onReject?: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

function ReservationCard({ reservation: r, onApprove, onReject, isApproving, isRejecting }: CardProps) {
  const status = r.status;
  const isPending = status === "pending";
  const guestName = r.guest
    ? `${r.guest.first_name} ${r.guest.last_name}`
    : "Guest";

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={[cardStyles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
          <Text style={cardStyles.badgeText}>{STATUS_LABELS[status]}</Text>
        </View>
        <Text style={cardStyles.price}>${r.total_price.toFixed(2)}</Text>
      </View>

      <Text style={cardStyles.listing} numberOfLines={1}>
        {r.listing?.title ?? "Listing"}
      </Text>
      <Text style={cardStyles.guest}>{guestName}</Text>
      <Text style={cardStyles.time}>
        {formatDateTime(r.start_time)} → {formatDateTime(r.end_time)}
      </Text>
      <Text style={cardStyles.duration}>
        {formatDuration(r.start_time, r.end_time)}
      </Text>

      {isPending && onApprove && onReject && (
        <View style={cardStyles.actions}>
          <Pressable
            style={({ pressed }) => [
              cardStyles.btn,
              cardStyles.rejectBtn,
              (pressed || isRejecting) && { opacity: 0.7 },
            ]}
            onPress={onReject}
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text style={cardStyles.rejectText}>Reject</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              cardStyles.btn,
              cardStyles.approveBtn,
              (pressed || isApproving) && { opacity: 0.7 },
            ]}
            onPress={onApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <ActivityIndicator size="small" color="#111111" />
            ) : (
              <Text style={cardStyles.approveText}>Approve</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1 },
  pageMax: {
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  topArea: { backgroundColor: "#FFFFFF" },
  topRow: {
    height: 44,
    justifyContent: "flex-start",
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 12,
    marginTop: 4,
  },
  errorContainer: { alignItems: "center", marginTop: 40 },
  errorText: { color: "#EF4444", marginBottom: 12 },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  retryText: { fontWeight: "600", color: "#111111" },
  emptyState: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#111111" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#555555", lineHeight: 18 },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  price: { fontSize: 16, fontWeight: "600", color: "#111111" },
  listing: { fontSize: 16, fontWeight: "500", color: "#111111", marginBottom: 2 },
  guest: { fontSize: 14, color: "#555555", marginBottom: 2 },
  time: { fontSize: 13, color: "#555555", marginBottom: 2 },
  duration: { fontSize: 13, fontWeight: "500", color: "#111111" },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rejectText: { color: "#EF4444", fontWeight: "600", fontSize: 14 },
  approveBtn: { backgroundColor: "#ECAA00" },
  approveText: { color: "#111111", fontWeight: "700", fontSize: 14 },
});
