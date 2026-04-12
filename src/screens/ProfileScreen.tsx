import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const MAX_WIDTH = 428;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>

              <View style={styles.headerIcons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => console.log("Search pressed")}
                >
                  <Feather name="search" size={20} color="#111111" />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => navigation.navigate("NotificationSettings")}
                >
                  <Ionicons name="settings-outline" size={20} color="#111111" />
                </Pressable>
              </View>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>M</Text>
              </View>

              <Text style={styles.name}>Minh</Text>
              <Text style={styles.role}>Guest</Text>
            </View>

            <TouchableOpacity
              style={styles.reservationsCard}
              onPress={() => navigation.navigate("Reservations")}
              activeOpacity={0.8}
            >
              <Text style={styles.reservationsText}>Reservations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hostCard}
              onPress={() => console.log("Become a host pressed")}
              activeOpacity={0.8}
            >
              <Text style={styles.hostTitle}>Become a host</Text>
              <Text style={styles.hostSubtitle}>
                It’s easy to start hosting and earn extra income.
              </Text>
            </TouchableOpacity>

            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => console.log("Account settings pressed")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-cog-outline"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>Account settings</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate("VehicleManagement")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="car-outline"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>Vehicles</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => console.log("View profile pressed")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>View profile</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate("NotificationSettings")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>Notification settings</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => console.log("Payment methods pressed")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>Payment methods</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#111111"
                />
                <Text style={styles.menuText}>Log out</Text>
                <Ionicons name="chevron-forward" size={22} color="#111111" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Profile" />
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
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 44,
    marginTop: 4,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  profileCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#232326",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "300",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111111",
    lineHeight: 34,
  },
  role: {
    fontSize: 15,
    fontWeight: "400",
    color: "#555555",
    marginTop: 4,
  },
  reservationsCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  reservationsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
  },
  hostCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  hostTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 4,
  },
  hostSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#555555",
    lineHeight: 20,
  },
  menuList: {
    marginTop: 4,
  },
  menuRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "400",
    color: "#1F1F1F",
    marginLeft: 14,
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