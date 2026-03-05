import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export type TabKey = "Explore" | "Listings" | "Home" | "Messages" | "Profile";

type Props = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "Explore", label: "Explore" },
  { key: "Listings", label: "Listings" },
  { key: "Home", label: "Home" },
  { key: "Messages", label: "Messages" },
  { key: "Profile", label: "Profile" },
];

export default function Navbar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const isActive = activeTab === t.key;

        return (
          <Pressable key={t.key} onPress={() => onTabPress(t.key)} style={styles.item}>
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#EAEAEA",
    borderTopWidth: 1,
    borderTopColor: "#D9D9D9",
  },
  item: {
    width: "20%",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
  },
  labelActive: {
    color: "#111111",
    fontWeight: "700",
  },
  labelInactive: {
    color: "#9A9A9A",
    fontWeight: "500",
  },
});