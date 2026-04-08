import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
  Notification,
} from "../api/notifications";

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
  const queryClient = useQueryClient();
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(
    null,
  );

  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutate: removeNotification, isPending: isRemoving } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleRemoveNotification = (notificationId: string) => {
    removeNotification(notificationId, {
      onSuccess: () => {
        setActiveNotificationId((current) =>
          current === notificationId ? null : current,
        );
      },
    });
  };

const handleClearAllNotifications = () => {
  if (!notifications || notifications.length === 0 || isRemoving) {
    return;
  }

  const clearAll = () => {
    notifications.forEach((item) => {
      removeNotification(item.id);
    });
    setActiveNotificationId(null);
  };

  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      "Do you really want to clear all your notifications?",
    );

    if (confirmed) {
      clearAll();
    }

    return;
  }

  Alert.alert(
    "Clear all notifications",
    "Do you really want to clear all your notifications?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear All",
        style: "destructive",
        onPress: clearAll,
      },
    ],
  );
};

  const canClearAll =
    !isLoading && !isError && !!notifications && notifications.length > 0 && !isRemoving;

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

            <View style={styles.titleRow}>
              <Text style={styles.title}>Notifications</Text>

              <Pressable
                style={[
                  styles.clearAllButton,
                  !canClearAll && styles.clearAllButtonDisabled,
                ]}
                onPress={handleClearAllNotifications}
                disabled={!canClearAll}
                hitSlop={10}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={canClearAll ? "#111111" : "#9CA3AF"}
                />
              </Pressable>
            </View>

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
                  onPress={() => navigation.navigate("NotificationSettings")}
                >
                  <Text style={styles.settingsButtonText}>
                    Notification Settings
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.list}>
                {notifications.map((item) => {
                  const isRead = Boolean(item.is_read);

                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.card,
                        isRead ? styles.cardRead : styles.cardUnread,
                        pressed && styles.cardPressed,
                      ]}
                      onHoverIn={() => setActiveNotificationId(item.id)}
                      onHoverOut={() =>
                        setActiveNotificationId((current) =>
                          current === item.id ? null : current,
                        )
                      }
                      onPress={() => {
                        if (!isRead) {
                          markAsReadMutation.mutate(item.id);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.iconWrap,
                          isRead ? styles.iconWrapRead : styles.iconWrapUnread,
                        ]}
                      >
                        <Ionicons
                          name="notifications-outline"
                          size={22}
                          color="#111111"
                        />
                      </View>

                      <View style={styles.cardBody}>
                        <View style={styles.cardHeaderRow}>
                          <Text
                            style={[
                              styles.cardTitle,
                              isRead ? styles.cardTitleRead : styles.cardTitleUnread,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>

                          <View style={styles.headerRight}>
                            {!isRead && <View style={styles.unreadDot} />}
                            <Text style={styles.timestamp}>
                              {formatNotificationTime(item.created_at)}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.cardMessage,
                            isRead ? styles.cardMessageRead : styles.cardMessageUnread,
                          ]}
                          numberOfLines={2}
                        >
                          {item.body}
                        </Text>

                        <Text
                          style={[
                            styles.statusText,
                            isRead ? styles.statusRead : styles.statusUnread,
                          ]}
                        >
                          {isRead ? "Read" : "Unread"}
                        </Text>

                        {activeNotificationId === item.id ? (
                          <View style={styles.cardActions}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.removeButton,
                                pressed && styles.removeButtonPressed,
                              ]}
                              onHoverIn={() => setActiveNotificationId(item.id)}
                              onHoverOut={() =>
                                setActiveNotificationId((current) =>
                                  current === item.id ? null : current,
                                )
                              }
                              onPress={() => handleRemoveNotification(item.id)}
                              disabled={isRemoving}
                              hitSlop={6}
                            >
                              <Text style={styles.removeButtonText}>
                                {isRemoving ? "Removing..." : "Remove"}
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
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
  titleRow: {
    marginTop: 20,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
  },
  clearAllButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  clearAllButtonDisabled: {
    opacity: 0.5,
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
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: "relative",
  },
  cardUnread: {
    backgroundColor: "#FFF8E1",
  },
  cardRead: {
    backgroundColor: "#F8F8F8",
  },
  cardPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconWrapUnread: {
    backgroundColor: "#ECAA00",
  },
  iconWrapRead: {
    backgroundColor: "#E5E7EB",
  },
  cardBody: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 26,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ECAA00",
    marginTop: 1,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    color: "#111111",
  },
  cardTitleUnread: {
    fontWeight: "700",
  },
  cardTitleRead: {
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    color: "#111111",
    marginTop: 1,
  },
  cardMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 8,
  },
  cardMessageUnread: {
    color: "#333333",
  },
  cardMessageRead: {
    color: "#6B7280",
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  statusUnread: {
    color: "#B77900",
  },
  statusRead: {
    color: "#9CA3AF",
  },
  cardActions: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  removeButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonPressed: {
    opacity: 0.72,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
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