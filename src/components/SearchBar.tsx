import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  placeholder?: string;
};

export default function SearchBar({ placeholder = "Start your search" }: Props) {
  return (
    <View style={styles.wrapper}>
        <View style={styles.centerRow}>
      <Ionicons name="search" size={18} color="#111827" />
      <Text style={styles.text}>{placeholder}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    // Stronger shadow (closer to your design)
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
  },
});