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
import { useQuery } from "@tanstack/react-query";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchNotifications, Notification } from "../api/notifications";

type Props = NativeStackScreenProps<RootStackParamList, "Notification">;

const MAX_WIDTH = 428;

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function NotificationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

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

            {isLoading ? (
              <View style={styles.emptyStateWrap}>
                <ActivityIndicator size="small" color="#111111" />
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            ) : isError ? (
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyTitle}>Unable to load notifications</Text>
                <Text style={styles.emptyText}>
                  {(error as Error)?.message || "Something went wrong."}
                </Text>
              </View>
            ) : !notifications || notifications.length === 0 ? (
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyTitle}>No new notifications</Text>
                <Text style={styles.emptyText}>
                  You&apos;ve got a blank slate (for now). We will let you know
                  when updates arrive
                </Text>

                <Pressable
                  style={styles.settingsButton}
                  onPress={() => console.log("Open notification settings")}
                >
                  <Text style={styles.settingsButtonText}>
                    Notification Settings
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.list}>
                {notifications.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() =>
                      console.log("Pressed notification:", item.id)
                    }
                  >
                    <View style={styles.iconWrap}>
                      <Ionicons
                        name="notifications-outline"
                        size={22}
                        color="#111111"
                      />
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        <Text style={styles.timestamp}>
                          {formatNotificationTime(item.created_at)}
                        </Text>
                      </View>

                      <Text style={styles.cardMessage} numberOfLines={2}>
                        {item.body}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={{ height: 110 }} />
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
    marginBottom: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 18,
    marginHorizontal: 16,
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
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
  list: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
    paddingTop: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
  },
  timestamp: {
    fontSize: 12,
    color: "#111111",
    marginTop: 1,
  },
  cardMessage: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: "#333333",
    paddingRight: 8,
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