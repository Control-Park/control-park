import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress?: () => void;
};

export default function ReportButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.button}
      accessibilityLabel="Report"
    >
      <Ionicons name="alert-circle-outline" size={20} color="#111827" />
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
});