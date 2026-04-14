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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type PersonalInfoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalInfo"
>;

const MAX_WIDTH = 428;

type InfoRowProps = {
  label: string;
  value: string;
  actionText?: string;
  onPress?: () => void;
};

function InfoRow({ label, value, actionText = "Edit", onPress }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.rowAction}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation<PersonalInfoScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top + 6 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#111111" />
            </Pressable>

            <Text style={styles.title}>Personal info</Text>

            <View style={styles.list}>
              <InfoRow
                label="Legal name"
                value="John Doe"
                onPress={() => console.log("Edit legal name")}
              />

              <InfoRow
                label="Preferred first name"
                value="Not provided"
                actionText="Add"
                onPress={() => console.log("Add preferred first name")}
              />

              <InfoRow
                label="Host display name for experiences and services"
                value="Show my first name only"
                onPress={() => console.log("Edit host display name")}
              />

              <InfoRow
                label="Phone number"
                value="Not provided"
                actionText="Add"
                onPress={() => console.log("Add phone number")}
              />

              <InfoRow
                label="Email"
                value="thci@csulb.edu"
                onPress={() => console.log("Edit email")}
              />

              <InfoRow
                label="Address"
                value="Not provided"
                actionText="Add"
                onPress={() => console.log("Add address")}
              />

              <InfoRow
                label="Change Password"
                value=""
                onPress={() => console.log("Change password")}
              />
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
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 28,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111111",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 26,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: "#E7E7E7",
  },
  row: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 24,
    marginBottom: 6,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F6F6F",
    lineHeight: 20,
  },
  rowAction: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    textDecorationLine: "underline",
    marginTop: 4,
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