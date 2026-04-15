import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuthSession } from "../context/AuthSessionContext";

export type TabKey = "Listings" | "Home" | "Messages" | "Profile";

type Props = {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "Home", label: "Home" },
  { key: "Listings", label: "Listings" },
  { key: "Messages", label: "Messages" },
  { key: "Profile", label: "Profile" },
];

const iconNameByTab: Record<TabKey, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Listings: "bookmark-outline",
  Messages: "chatbubble-ellipses-outline",
  Profile: "person-outline",
};

const activeIconNameByTab: Record<TabKey, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Listings: "bookmark",
  Messages: "chatbubble-ellipses",
  Profile: "person",
};

export default function Navbar({ activeTab, onTabPress }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isGuest } = useAuthSession();

  const handlePress = (tab: TabKey) => {
    if (tab === "Profile" && isGuest) {
      Toast.show({
        type: "error",
        text1: "Sign in required",
        text2: "Sign in to access profile tab",
        topOffset: 100,
      });
      navigation.navigate("Login");
      return;
    }

    switch (tab) {
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
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              hitSlop={10}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  name={isActive ? activeIconNameByTab[t.key] : iconNameByTab[t.key]}
                  size={22}
                  color={isActive ? "#111111" : "#7C8799"}
                />
              </View>

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
    borderTopColor: "#ECECEC",
  },
  bar: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 10,
    minHeight: 64,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  itemPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  iconWrapActive: {
    transform: [{ translateY: -1 }],
  },
  label: {
    fontSize: 12,
    color: "#7C8799",
    fontWeight: "500",
  },
  labelActive: {
    color: "#111111",
    fontWeight: "700",
  },
});
