import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPress?: () => void;
};

export default function NotificationsButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();

  // position a little below the top inset and slightly inset from the right edge
  const top = Math.max(insets.top, 12) + 6; // e.g. statusbar + 6px
  const right = 16;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[styles.button, { top, right }]}
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={20} color="#111827" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",

    // ✅ make sure it renders above other content
    zIndex: 50,
    elevation: 10, // Android stacking too

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
  },
});