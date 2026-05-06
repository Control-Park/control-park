import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import type { RootStackParamList } from "../navigation/AppNavigator";
import { fetchUserById } from "../api/user";
import {
  approveReservation,
  fetchReservationForHost,
  rejectReservation,
} from "../api/reservations";
import { fetchUserReviews } from "../api/reviews";
import { supabase } from "../utils/supabase";
import NotificationsButton from "../components/NotificationsButton";
import UserAvatar from "../components/UserAvatar";

type ExtendedRootStackParamList = RootStackParamList & {
  GuestReviews: {
    guestId: string;
    guestName: string;
  };
};

type NavProp = NativeStackNavigationProp<ExtendedRootStackParamList>;
type RouteProp = NativeStackScreenProps<
  RootStackParamList,
  "GuestProfile"
>["route"];

const MAX_WIDTH = 428;
const EMPTY_GUEST_BIO_MESSAGE = "This guest has not added a bio yet.";

const REPORT_REASONS = [
  "Overstayed booking",
  "False identity",
  "Inappropriate",
] as const;

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

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [showApprovalSuccessModal, setShowApprovalSuccessModal] =
    useState(false);
  const [showRejectionSuccessModal, setShowRejectionSuccessModal] =
    useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<
    (typeof REPORT_REASONS)[number] | null
  >(null);

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
  const guestBio = guest?.bio?.trim() ?? "";

  const totalRatings = reviews.length;
  const avgRating = totalRatings
    ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      ).toFixed(1)
    : null;

  const displayedReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  const handleMessage = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const myId = session?.user?.id;
    if (!myId || !reservation) return;

    navigation.navigate("Conversation", {
      listingId: reservation.listing_id,
      hostId: myId,
      guestId,
      hostName: guestName,
      listingTitle: reservation.listing?.title,
    });
  };

  const confirmApprove = async () => {
    setShowApproveModal(false);
    setApprovingId(reservationId);

    try {
      await approveReservation(reservationId);
      setActionDone(true);
      setShowApprovalSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setApprovingId(null);
    }
  };

  const confirmReject = async () => {
    setShowRejectModal(false);
    setRejectingId(reservationId);

    try {
      await rejectReservation(reservationId);
      setActionDone(true);
      setShowRejectionSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject";
      setTimeout(() => Alert.alert("Error", msg), 300);
    } finally {
      setRejectingId(null);
    }
  };

  const handleOpenApproveModal = () => {
    if (approvingId || rejectingId) return;
    setShowApproveModal(true);
  };

  const handleOpenRejectModal = () => {
    if (approvingId || rejectingId) return;
    setShowRejectModal(true);
  };

  const handleViewAllReviews = () => {
    navigation.navigate("GuestReviews", {
      guestId,
      guestName,
    });
  };

  const handleSubmitReport = () => {
    if (!selectedReportReason) return;

    setShowReportModal(false);
    setShowReportSuccessModal(true);
    setSelectedReportReason(null);
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
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pageMax, { paddingTop: insets.top + 10 }]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.iconCircle,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color="#111" />
            </Pressable>

            <View style={styles.headerRight}>
              <Pressable
                onPress={() => setShowReportModal(true)}
                style={({ pressed }) => [
                  styles.iconCircle,
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={10}
                accessibilityLabel="Report guest"
              >
                <Ionicons name="alert-circle-outline" size={18} color="#111" />
              </Pressable>

              <NotificationsButton />
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {guest?.profile_image ? (
                <Image
                  source={{ uri: guest.profile_image }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {guest?.first_name?.[0]?.toUpperCase() ?? "G"}
                </Text>
              )}
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
                style={({ pressed }) => [
                  styles.messageBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleMessage}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color="#111111"
                />
                <Text style={styles.messageBtnText}>Message Guest</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>Bio</Text>
            <Text style={[styles.bioText, !guestBio && styles.emptyBioText]}>
              {guestBio || EMPTY_GUEST_BIO_MESSAGE}
            </Text>
          </View>

          <View style={styles.ratingCard}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Total Ratings</Text>
              <Text style={styles.ratingValue}>{totalRatings}</Text>
            </View>
            <View style={styles.ratingDivider} />
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Average Rating</Text>
              <Text style={styles.ratingValue}>
                {avgRating ? `${avgRating} / 5` : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Pressable
              onPress={handleViewAllReviews}
              hitSlop={8}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.viewAllText}>View all reviews</Text>
            </Pressable>
          </View>

          {displayedReviews.length > 0 ? (
            displayedReviews.map((r) => (
              <Pressable
                key={r.id}
                style={({ pressed }) => [
                  styles.reviewRow,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() =>
                  navigation.navigate("ViewProfile", { userId: r.reviewer_id })
                }
              >
                <View style={styles.reviewAvatar}>
                  <UserAvatar
                    imageUri={r.reviewer?.profile_image}
                    name={
                      r.reviewer
                        ? `${r.reviewer.first_name} ${r.reviewer.last_name}`
                        : undefined
                    }
                    userId={r.reviewer_id}
                  />
                </View>

                <View style={styles.reviewContent}>
                  <View style={styles.reviewTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>
                        {r.reviewer
                          ? `${r.reviewer.first_name} ${r.reviewer.last_name}`
                          : "Host"}
                      </Text>

                      <Text style={styles.reviewListingTitle}>
                        {r.reservation?.listing?.title ?? "Unknown listing"}
                      </Text>
                    </View>

                    <StarRow rating={r.rating} />
                  </View>

                  <Text style={styles.reviewText}>
                    {r.comment?.trim() ? r.comment : "No written review."}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyReviewsCard}>
              <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
              <Text style={styles.emptyReviewsText}>
                This guest has not received any reviews yet.
              </Text>
            </View>
          )}

          {reservation && (
            <>
              <Text style={styles.bookingTitle}>Booking Request</Text>

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
                    {startDate?.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }) ?? "—"}
                    {" – "}
                    {endDate?.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }) ?? "—"}
                  </Text>
                </View>

                <View style={styles.whiteCard}>
                  <Text style={styles.cardLabel}>Listing</Text>
                  <Text style={styles.cardMain} numberOfLines={2}>
                    {reservation.listing?.title ?? "—"}
                  </Text>

                  <Text style={styles.cardLabel}>Earnings</Text>
                  <Text style={styles.cardMain}>
                    ${reservation.total_price.toFixed(2)}
                  </Text>
                </View>
              </View>

              {!actionDone && reservation.status === "pending" && (
                <>
                  <Pressable
                    style={[styles.approveBtn, busy && { opacity: 0.5 }]}
                    onPress={handleOpenApproveModal}
                    disabled={busy}
                  >
                    <Text style={styles.approveBtnText}>
                      {approvingId ? "Approving..." : "Approve Booking"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.rejectBtn, busy && { opacity: 0.5 }]}
                    onPress={handleOpenRejectModal}
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

      <Modal
        visible={showApproveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApproveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmModalTitle}>Approve booking?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to approve this booking request?
            </Text>

            <View style={styles.confirmButtonRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setShowApproveModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSuccessBtn}
                onPress={confirmApprove}
              >
                <Text style={styles.modalSuccessBtnText}>Approve</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmModalTitle}>Reject booking?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to reject this booking request?
            </Text>

            <View style={styles.confirmButtonRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalDangerBtn}
                onPress={confirmReject}
              >
                <Text style={styles.modalDangerBtnText}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showApprovalSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowApprovalSuccessModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Text style={styles.successTitle}>Confirmation Successful</Text>
            <Text style={styles.successText}>
              The booking request has been successfully approved.
            </Text>

            <Pressable
              style={styles.successOkBtn}
              onPress={() => {
                setShowApprovalSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successOkBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRejectionSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRejectionSuccessModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Text style={styles.successTitle}>Rejection Successful</Text>
            <Text style={styles.successText}>
              The booking request has been successfully rejected.
            </Text>

            <Pressable
              style={styles.successOkBtn}
              onPress={() => {
                setShowRejectionSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successOkBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalCard}>
            <View style={styles.reportHeaderRow}>
              <Text style={styles.reportTitle}>Report User</Text>
              <Pressable
                onPress={() => setShowReportModal(false)}
                hitSlop={8}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Ionicons name="close" size={20} color="#111111" />
              </Pressable>
            </View>

            <Text style={styles.reportSubtitle}>
              Why are you reporting this user?
            </Text>

            <View style={styles.reportOptionsWrap}>
              {REPORT_REASONS.map((reason) => {
                const selected = selectedReportReason === reason;

                return (
                  <Pressable
                    key={reason}
                    onPress={() => setSelectedReportReason(reason)}
                    style={[
                      styles.reportOption,
                      selected && styles.reportOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reportOptionText,
                        selected && styles.reportOptionTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>

                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#ECAA00"
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.reportActionRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedReportReason(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.reportSubmitBtn,
                  !selectedReportReason && { opacity: 0.5 },
                ]}
                onPress={handleSubmitReport}
                disabled={!selectedReportReason}
              >
                <Text style={styles.reportSubmitBtnText}>Submit Report</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReportSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Text style={styles.successTitle}>Report Successful</Text>
            <Text style={styles.successText}>We will review this user.</Text>

            <Pressable
              style={styles.successOkBtn}
              onPress={() => setShowReportSuccessModal(false)}
            >
              <Text style={styles.successOkBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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

  header: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
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
    overflow: "hidden",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },
  profileInfo: { flex: 1 },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: "#ECAA00",
    fontWeight: "600",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 10,
  },
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
  messageBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },

  bioCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  bioText: {
    fontSize: 13,
    color: "#444444",
    lineHeight: 20,
  },
  emptyBioText: {
    color: "#777777",
  },

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

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ECAA00",
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
    marginTop: 2,
    overflow: "hidden",
  },
  reviewAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  reviewContent: {
    flex: 1,
  },
  reviewTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  reviewListingTitle: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 13,
    color: "#555555",
    lineHeight: 18,
  },

  emptyReviewsCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  emptyReviewsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 4,
  },
  emptyReviewsText: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },

  bookingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginTop: 20,
    marginBottom: 12,
  },
  bookingRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
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
  cardLabel: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 2,
  },
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
  approveBtnText: {
    fontWeight: "600",
    color: "#FFFFFF",
    fontSize: 15,
  },

  rejectBtn: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  rejectBtnText: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
  confirmButtonRow: {
    flexDirection: "row",
    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalDangerBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalDangerBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalSuccessBtn: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSuccessBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  reportModalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  reportHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  reportSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 14,
  },
  reportOptionsWrap: {
    gap: 10,
    marginBottom: 18,
  },
  reportOption: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportOptionSelected: {
    borderColor: "#ECAA00",
    backgroundColor: "#FFF8E1",
  },
  reportOptionText: {
    fontSize: 14,
    color: "#111111",
    fontWeight: "500",
  },
  reportOptionTextSelected: {
    color: "#B98100",
    fontWeight: "600",
  },
  reportActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  reportSubmitBtn: {
    flex: 1,
    backgroundColor: "#ECAA00",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  reportSubmitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },

  successModalCard: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  successOkBtn: {
    backgroundColor: "#ECAA00",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  successOkBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});
