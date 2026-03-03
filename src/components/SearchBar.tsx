import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  placeholder?: string;
};

export default function SearchBar({ placeholder = "Start your search" }: Props) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color="#6B7280" />
      <Text style={styles.text}>{placeholder}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
});