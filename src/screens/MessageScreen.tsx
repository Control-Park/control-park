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

import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";

const MAX_WIDTH = 428;

export default function MessageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={20} color="#111111" />
              </Pressable>

              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            <Text style={styles.title}>Messages</Text>

            <View style={styles.divider} />

            <View style={styles.emptyStateWrapper}>
              <Text style={styles.emptyTitle}>No new messages</Text>

              <Text style={styles.emptySubtitle}>
                You’ve got a blank slate (for now). We will let you know when
                updates arrive
              </Text>

              <Pressable
                onPress={() => navigation.navigate("Listings")}
                style={({ pressed }) => [
                  styles.getStartedButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.getStartedButtonText}>
                  Get started
                </Text>
              </Pressable>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Messages" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  topRow: {
    height: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 140,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    textAlign: "center",
    maxWidth: 300,
  },
  getStartedButton: {
    marginTop: 26,
    backgroundColor: "#ECAA00",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedButtonText: {
    fontSize: 16,
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
});