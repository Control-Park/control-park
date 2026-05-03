import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { supabase } from "../utils/supabase";
import { getMyProfile, UserProfile } from "../api/user";
import { useAuthSession } from "../context/AuthSessionContext";
import { getProfileDisplayName, getProfileInitial } from "../utils/profile";
import { useProfileImage } from "../hooks/useProfileImage";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const MAX_WIDTH = 428;
let cachedProfile: UserProfile | null = null;

function formatProfileRole(profile: UserProfile | null, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    return "Guest";
  }

  if (profile?.host) {
    return "Host";
  }

  if (!profile?.role) {
    return "Guest";
  }

  const normalizedRole = profile.role.toUpperCase();

  if (normalizedRole === "ANON" || normalizedRole === "GUEST") {
    return "Guest";
  }

  return profile.role;
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { displayName, isAuthenticated, session } = useAuthSession();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProfile = useCallback(async () => {
    if (!session?.user) {
      cachedProfile = null;
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await getMyProfile();
      cachedProfile = nextProfile;
      setProfile(nextProfile);
    } catch {
      cachedProfile = null;
      setProfile(null);
    }
  }, [session?.user]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const profileName = profile ? getProfileDisplayName(profile) : displayName;
  const profileRole = formatProfileRole(profile, isAuthenticated);
  const avatarInitial = profile ? getProfileInitial(profile) : (profileName?.[0] ?? "?").toUpperCase();
  const { profileImageUri } = useProfileImage(profile?.id ?? session?.user?.id);

  const menuItems = useMemo(
    () => [
      {
        icon: (
          <MaterialCommunityIcons
            name="account-cog-outline"
            size={24}
            color="#111111"
          />
        ),
        key: "account-settings",
        keywords: "account settings personal info name phone email address password profile",
        label: "Account settings",
        onPress: () => navigation.navigate("PersonalInfo"),
      },
      {
        icon: (
          <MaterialCommunityIcons name="car-outline" size={24} color="#111111" />
        ),
        key: "vehicles",
        keywords: "vehicles car plate vehicle management guest reservation",
        label: "Vehicles",
        onPress: () => navigation.navigate("VehicleManagement"),
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={24}
            color="#111111"
          />
        ),
        key: "manage-reservations",
        keywords: "manage reservations reservation requests bookings host calendar request",
        label: "Manage reservations",
        onPress: () => navigation.navigate("HostReservations"),
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="account-outline"
            size={24}
            color="#111111"
          />
        ),
        key: "view-profile",
        keywords: "view public profile guest host profile page",
        label: "View profile",
        onPress: () => navigation.navigate("ViewProfile"),
      },
      {
        icon: (
          <Ionicons name="notifications-outline" size={24} color="#111111" />
        ),
        key: "notification-settings",
        keywords: "notification notifications alerts push settings",
        label: "Notification settings",
        onPress: () => navigation.navigate("NotificationSettings"),
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={24}
            color="#111111"
          />
        ),
        key: "payment-methods",
        keywords: "payment methods card cards stripe billing checkout",
        label: "Payment methods",
        onPress: () => navigation.navigate("Payment"),
      },
      {
        icon: (
          <MaterialCommunityIcons name="logout" size={24} color="#111111" />
        ),
        key: "logout",
        keywords: "logout sign out leave account",
        label: "Log out",
        onPress: () => setIsLogoutModalVisible(true),
      },
    ],
    [navigation],
  );

  const filteredMenuItems = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    if (!trimmed) {
      return menuItems;
    }

    return menuItems.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(trimmed),
    );
  }, [menuItems, searchQuery]);

  const handleSearchSubmit = useCallback(() => {
    const [firstMatch] = filteredMenuItems;

    if (!firstMatch) {
      return;
    }

    firstMatch.onPress();
    setSearchVisible(false);
    setSearchQuery("");
  }, [filteredMenuItems]);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      setIsLogoutModalVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <Ionicons name="arrow-back" size={20} color="#111111" />
                </Pressable>

                <Text style={styles.headerTitle}>Profile</Text>
              </View>

              <View style={styles.headerIcons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setSearchVisible((prev) => !prev);
                    setSearchQuery("");
                  }}
                >
                  <Feather name="search" size={20} color="#111111" />
                </Pressable>
              </View>
            </View>

            {searchVisible ? (
              <View style={styles.searchWrap}>
                <SearchBar
                  placeholder="Search settings"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmit={handleSearchSubmit}
                  onClear={() => setSearchQuery("")}
                />
              </View>
            ) : null}

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>{avatarInitial}</Text>
                )}
              </View>

              <Text style={styles.name}>{profileName}</Text>
              <Text style={styles.role}>{profileRole}</Text>
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
              onPress={() => navigation.navigate("CreateListing")}
              activeOpacity={0.8}
            >
              <Text style={styles.hostTitle}>Become a host</Text>
              <Text style={styles.hostSubtitle}>
                It’s easy to start hosting and earn extra income.
              </Text>
            </TouchableOpacity>

            <View style={styles.menuList}>
              {filteredMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  {item.icon}
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={22} color="#111111" />
                </TouchableOpacity>
              ))}

              {searchVisible && searchQuery.trim() && filteredMenuItems.length === 0 ? (
                <Text style={styles.emptySearchText}>No matching settings found</Text>
              ) : null}
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

      <Modal
        transparent
        animationType="fade"
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!isLoggingOut) {
              setIsLogoutModalVisible(false);
            }
          }}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalCancelButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsLogoutModalVisible(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalConfirmButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalConfirmText}>
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  searchWrap: {
    marginBottom: 16,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
  emptySearchState: {
    paddingVertical: 18,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 6,
  },
  emptySearchText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.32)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    minWidth: 96,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#F3F4F6",
  },
  modalConfirmButton: {
    backgroundColor: "#ECAA00",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});
