import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";
import { getMyProfile, updateMyProfile } from "../api/user";
import { fetchMyReservations } from "../api/reservations";
import { fetchUserReviews } from "../api/reviews";
import { getProfileDisplayName, getProfileInitial } from "../utils/profile";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_WIDTH = 428;
const DEFAULT_BIO =
  "I am a college student using this app to reserve parking for my classes, study sessions, campus events, and part-time work. I usually look for reliable spots that make it easier for me to get to school on time and manage a busy weekly schedule.";

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
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

export default function ViewProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile-view"],
    queryFn: getMyProfile,
  });

  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ["my-reservations-view-profile"],
    queryFn: fetchMyReservations,
  });

  const latestReservation = useMemo(() => {
    if (!reservations.length) return null;

    return [...reservations].sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    )[0];
  }, [reservations]);

  const userId = profile?.id ?? "";

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["reviews-user-self-profile", userId],
    queryFn: () => fetchUserReviews(userId),
    enabled: !!userId,
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsEditingBio(false);
      };
    }, []),
  );

  const isLoading = loadingProfile || loadingReservations || loadingReviews;

  const displayName = profile ? getProfileDisplayName(profile) : "User";
  const avatarInitial = profile ? getProfileInitial(profile) : "U";

  const totalRatings = reviews.length;
  const avgRating = totalRatings
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : null;

  const displayedReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const currentBio =
    bio ||
    profile?.bio?.trim() ||
    DEFAULT_BIO;

  const handleStartEditingBio = () => {
    setBio(profile?.bio?.trim() || DEFAULT_BIO);
    setIsEditingBio(true);
  };

  const handleCancelEditBio = () => {
    setBio("");
    setIsEditingBio(false);
  };

  const handleSaveBio = async () => {
    const nextBio = bio.trim();

    if (!nextBio) {
      Alert.alert("Bio required", "Please enter a short bio before saving.");
      return;
    }

    try {
      setIsSavingBio(true);
      await updateMyProfile({ bio: nextBio });
      await queryClient.invalidateQueries({ queryKey: ["my-profile-view"] });
      setIsEditingBio(false);
      Alert.alert("Saved", "Your bio was updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update bio";
      Alert.alert("Error", msg);
    } finally {
      setIsSavingBio(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.safe}>
        <View style={[styles.loadingWrap, { paddingTop: insets.top }]}>
          <ActivityIndicator color="#ECAA00" />
        </View>
        <View style={styles.navbarWrapper}>
          <View style={styles.navbarContent}>
            <Navbar activeTab="Profile" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
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
                pressed && styles.pressed,
              ]}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color="#111111" />
            </Pressable>

            <View style={styles.headerRight}>
              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>{profile?.host ? "Host" : "Guest"}</Text>
              <Text style={styles.memberSince}>Member since {memberSince}</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.messageBtn,
                  pressed && styles.pressed,
                ]}
                onPress={handleStartEditingBio}
              >
                <Ionicons name="create-outline" size={14} color="#111111" />
                <Text style={styles.messageBtnText}>Edit Bio</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.bioCard}>
            <View style={styles.bioHeader}>
              <Text style={styles.bioTitle}>Bio</Text>

              {!isEditingBio ? (
                <Pressable
                  onPress={handleStartEditingBio}
                  style={({ pressed }) => pressed && styles.pressed}
                  hitSlop={8}
                >
                  <Text style={styles.editLink}>Edit</Text>
                </Pressable>
              ) : null}
            </View>

            {isEditingBio ? (
              <>
                <TextInput
                  style={styles.bioInput}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  textAlignVertical="top"
                  placeholder="Write a short bio about yourself"
                  placeholderTextColor="#9CA3AF"
                  maxLength={280}
                />

                <View style={styles.bioActions}>
                  <Pressable
                    style={styles.bioCancelBtn}
                    onPress={handleCancelEditBio}
                    disabled={isSavingBio}
                  >
                    <Text style={styles.bioCancelBtnText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.bioSaveBtn,
                      isSavingBio && { opacity: 0.6 },
                    ]}
                    onPress={handleSaveBio}
                    disabled={isSavingBio}
                  >
                    <Text style={styles.bioSaveBtnText}>
                      {isSavingBio ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text style={styles.bioText}>{currentBio}</Text>
            )}
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
              onPress={() =>
                navigation.navigate("GuestReviews", {
                  guestId: userId,
                  guestName: displayName,
                })
              }
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.viewAllText}>View all reviews</Text>
            </Pressable>
          </View>

          {displayedReviews.length > 0 ? (
            displayedReviews.map((r) => (
              <View key={r.id} style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {r.reviewer?.first_name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>

                <View style={styles.reviewContent}>
                  <View style={styles.reviewTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>
                        {r.reviewer
                          ? `${r.reviewer.first_name} ${r.reviewer.last_name}`
                          : "User"}
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
              </View>
            ))
          ) : (
            <View style={styles.emptyReviewsCard}>
              <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
              <Text style={styles.emptyReviewsText}>
                This profile has not received any reviews yet.
              </Text>
            </View>
          )}

          {latestReservation ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Recent Reservation</Text>
              <Text style={styles.infoCardText}>
                {new Date(latestReservation.start_time).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </Text>
              <Text style={styles.infoCardSubText}>
                {new Date(latestReservation.start_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
                {" – "}
                {new Date(latestReservation.end_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
              </Text>
            </View>
          ) : null}

          <View style={{ height: 100 }} />
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  pressed: {
    opacity: 0.75,
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
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },
  profileInfo: {
    flex: 1,
  },
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
  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  editLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ECAA00",
  },
  bioText: {
    fontSize: 13,
    color: "#444444",
    lineHeight: 20,
  },
  bioInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111111",
  },
  bioActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  bioCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  bioCancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  bioSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#ECAA00",
  },
  bioSaveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  ratingCard: {
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ratingItem: {
    flex: 1,
    alignItems: "center",
  },
  ratingDivider: {
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  ratingLabel: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },
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
  starRow: {
    flexDirection: "row",
    gap: 2,
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
  infoCard: {
    marginTop: 20,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 4,
  },
  infoCardSubText: {
    fontSize: 13,
    color: "#666666",
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});