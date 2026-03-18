import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Reservations">;

const MAX_WIDTH = 428;

const reservationCards = [
  {
    id: "1",
    title: "Walter Pyramid",
    time: "9:30 AM",
    image: require("../../assets/parking4.png"),
  },
  {
    id: "2",
    title: "Lot G9",
    time: "3:25 PM",
    image: require("../../assets/parking5.png"),
  },
];

const savedListings = [
  {
    id: "1",
    title: "Walter Pyramid",
    subtitle: "Reservation for Walter Pyramid",
    time: "9:30 AM",
  },
  {
    id: "2",
    title: "Lot G9",
    subtitle: "Reservation for Lot G9",
    time: "3:25 PM",
  },
];

export default function ReservationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={10}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
              </Pressable>

              <NotificationsButton
                onPress={() => console.log("Notifications")}
              />
            </View>

            <Text style={styles.title}>Reservations</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {reservationCards.map((card) => (
                <View key={card.id} style={styles.card}>
                  <Image source={card.image} style={styles.cardImage} />
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardTime}>@{card.time}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Listings</Text>

              {savedListings.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <View style={styles.avatarCircle} />

                  <View style={styles.listTextBlock}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Text style={styles.listTime}>{item.time}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Listings" />
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
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },

  topArea: {
    backgroundColor: "#FFFFFF",
  },

  topRow: {
    height: 44,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
    marginTop: 20,
    marginBottom: 18,
  },

  cardsRow: {
    paddingBottom: 26,
  },

  card: {
    width: 118,
    marginRight: 18,
    alignItems: "center",
  },

  cardImage: {
    width: 118,
    height: 118,
    borderRadius: 18,
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },

  cardTime: {
    fontSize: 14,
    color: "#111111",
    textAlign: "center",
    marginTop: 2,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 14,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5A900",
    marginRight: 14,
  },

  listTextBlock: {
    flex: 1,
  },

  listTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 2,
  },

  listSubtitle: {
    fontSize: 14,
    color: "#111111",
  },

  listTime: {
    fontSize: 16,
    color: "#111111",
    marginLeft: 10,
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