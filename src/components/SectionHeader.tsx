import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
};

export default function SectionHeader({ title }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-forward" size={22} color="#111827" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111827",
  },
});