import React from "react";
import {
  ActivityIndicator,
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
import { fetchUserReviews } from "../api/reviews";
import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";

type ExtendedRootStackParamList = RootStackParamList & {
  GuestReviews: {
    guestId: string;
    guestName: string;
  };
};

type NavProp = NativeStackNavigationProp<ExtendedRootStackParamList>;
type RouteProp = NativeStackScreenProps<
  ExtendedRootStackParamList,
  "GuestReviews"
>["route"];

const MAX_WIDTH = 428;

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

export default function GuestReviewsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp>();
  const insets = useSafeAreaInsets();
  const { guestId, guestName } = route.params;

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reviews-user", guestId],
    queryFn: () => fetchUserReviews(guestId),
    enabled: !!guestId,
  });

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

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Guest Reviews</Text>
            <Text style={styles.subtitle}>{guestName}</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#ECAA00" />
            </View>
          ) : null}

          {!isLoading && reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewRow}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.reviewer?.first_name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>

                  <View style={styles.reviewContent}>
                    <View style={styles.reviewTopRow}>
                      <View style={styles.reviewHeaderText}>
                        <Text style={styles.reviewerName}>
                          {review.reviewer
                            ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                            : "User"}
                        </Text>
                        <Text style={styles.reviewListingTitle}>
                          {review.reservation?.listing?.title ?? "Unknown listing"}
                        </Text>
                      </View>

                      <StarRow rating={review.rating} />
                    </View>

                    <Text style={styles.reviewText}>
                      {review.comment?.trim() ? review.comment : "No written review."}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {!isLoading && reviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color="#999999"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {isError ? "Unable to load reviews" : "No reviews yet"}
              </Text>
              <Text style={styles.emptyText}>
                {isError
                  ? "Please try again in a moment."
                  : "This guest has no reviews yet."}
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
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
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
  titleWrap: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#ECAA00",
    fontWeight: "600",
  },
  loadingCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewsList: {
    gap: 14,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
  reviewHeaderText: {
    flex: 1,
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
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    color: "#555555",
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
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
