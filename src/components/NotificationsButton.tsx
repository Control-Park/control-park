import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { fetchNotifications } from "../api/notifications";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = {
  onPress?: () => void;
};

export default function NotificationsButton({ onPress }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 60_000,
  });
  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.is_read,
  );

  return (
    <Pressable
      onPress={onPress ?? (() => navigation.navigate("Notification"))}
      hitSlop={10}
      style={styles.button}
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={20} color="#111827" />
      {hasUnreadNotifications ? <View style={styles.unreadIndicator} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  unreadIndicator: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
