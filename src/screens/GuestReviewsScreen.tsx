import React from "react";
import {
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

import type { RootStackParamList } from "../navigation/AppNavigator";
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

export default function GuestReviewsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp>();
  const insets = useSafeAreaInsets();
  const { guestName } = route.params;

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

          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#999999" />
            </View>

            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>
              This guest has no reviews yet.
            </Text>
          </View>

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