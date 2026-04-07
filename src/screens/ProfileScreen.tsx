import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => console.log("Search pressed")}
            >
              <Feather name="search" size={24} color="#111111" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notification")}
            >
              <Ionicons name="settings-outline" size={24} color="#111111" />
            </TouchableOpacity>
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
        >
          <Text style={styles.reservationsText}>Reservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hostCard}
          onPress={() => console.log("Become a host pressed")}
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
          >
            <MaterialCommunityIcons
              name="account-cog-outline"
              size={28}
              color="#111111"
            />
            <Text style={styles.menuText}>Account settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("VehicleManagement")}
          >
            <MaterialCommunityIcons
              name="car-outline"
              size={28}
              color="#111111"
            />
            <Text style={styles.menuText}>Vehicles</Text>
            <Ionicons name="chevron-forward" size={24} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => console.log("View profile pressed")}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={28}
              color="#111111"
            />
            <Text style={styles.menuText}>View profile</Text>
            <Ionicons name="chevron-forward" size={24} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => console.log("Payment methods pressed")}
          >
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={28}
              color="#111111"
            />
            <Text style={styles.menuText}>Payment methods</Text>
            <Ionicons name="chevron-forward" size={24} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("Login")}
          >
            <MaterialCommunityIcons
              name="logout"
              size={28}
              color="#111111"
            />
            <Text style={styles.menuText}>Log out</Text>
            <Ionicons name="chevron-forward" size={24} color="#111111" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar activeTab="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContent: {
    paddingTop: 72,
    paddingHorizontal: 28,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 34,
  },
  headerTitle: {
    fontSize: 44,
    fontWeight: "400",
    color: "#000000",
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#F3F3F3",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 34,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  avatar: {
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: "#232326",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 74,
    fontWeight: "300",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 50,
    fontWeight: "400",
    color: "#000000",
    lineHeight: 56,
  },
  role: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
    marginTop: 6,
  },
  reservationsCard: {
    backgroundColor: "#F3F3F3",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  reservationsText: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000000",
  },
  hostCard: {
    backgroundColor: "#F3F3F3",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  hostTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 6,
  },
  hostSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000000",
    lineHeight: 20,
  },
  menuList: {
    marginTop: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 21,
    fontWeight: "400",
    color: "#1F1F1F",
    marginLeft: 18,
  },
});