import React from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Notification">;

const MAX_WIDTH = 428;

export default function NotificationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

              <NotificationsButton onPress={() => {}} />
            </View>

            <Text style={styles.title}>Notifications</Text>

            <View style={styles.divider} />

            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyTitle}>No new notifications</Text>

              <Text style={styles.emptyText}>
                You&apos;ve got a blank slate (for now). We will let you know
                when updates arrive
              </Text>

              <Pressable style={styles.settingsButton}>
                <Text style={styles.settingsButtonText}>
                  Notification Settings
                </Text>
              </Pressable>
            </View>

            <View style={{ height: 120 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Home" />
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageMax: {
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    flex: 1,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
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
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 28,
  },
  emptyStateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    minHeight: 420,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 260,
    marginBottom: 28,
  },
  settingsButton: {
    backgroundColor: "#ECAA00",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "500",
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
});