import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";

export type TabKey = "Explore" | "Listings" | "Home" | "Messages" | "Profile";

type Props = {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "Explore", label: "Explore" },
  { key: "Listings", label: "Listings" },
  { key: "Home", label: "Home" },
  { key: "Messages", label: "Messages" },
  { key: "Profile", label: "Profile" },
];

const iconNameByTab: Record<
  Exclude<TabKey, "Home">,
  keyof typeof Ionicons.glyphMap
> = {
  Explore: "search-outline",
  Listings: "heart-outline",
  Messages: "chatbox-outline",
  Profile: "person-outline",
};

export default function Navbar({ activeTab, onTabPress }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePress = (tab: TabKey) => {
    switch (tab) {
      case "Explore":
        navigation.navigate("Explore");
        break;
      case "Listings":
        navigation.navigate("Reservations");
        break;
      case "Home":
        navigation.navigate("Home");
        break;
      case "Messages":
        navigation.navigate("Message");
        break;
      case "Profile":
        navigation.navigate("Profile");
        break;
    }

    onTabPress?.(tab);
  };

  return (
    <View style={styles.outer}>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const isActive = activeTab === t.key;

          return (
            <Pressable
              key={t.key}
              onPress={() => handlePress(t.key)}
              style={styles.item}
              hitSlop={10}
            >
              {t.key === "Home" ? (
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.homeIcon}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name={iconNameByTab[t.key]}
                  size={24}
                  color={isActive ? "#111111" : "#9A9A9A"}
                />
              )}

              <Text style={[styles.label, isActive && styles.labelActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
  },
  bar: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 14,
  },
  item: {
    width: "20%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: "#9A9A9A",
    fontWeight: "500",
  },
  labelActive: {
    color: "#111111",
    fontWeight: "700",
  },
  homeIcon: {
    width: 26,
    height: 26,
  },
});