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
    date: "Nov 12",
    time: "9:30 AM",
    duration: "2 hrs",
    status: "Active",
    image: require("../../assets/parking4.png"),
  },
  {
    id: "2",
    title: "Lot G9",
    date: "Nov 12",
    time: "3:25 PM",
    duration: "1.5 hrs",
    status: "Upcoming",
    image: require("../../assets/parking5.png"),
  },
];

const savedListings = [
  {
    id: "1",
    title: "Walter Pyramid",
    rating: "4.9 stars",
    address: "1250 N Bellflower Blvd, Long Beach, CA",
  },
  {
    id: "2",
    title: "Lot G9",
    rating: "4.8 stars",
    address: "E State University Dr, Long Beach, CA",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "#22C55E";
    case "Upcoming":
      return "#F59E0B";
    case "Completed":
      return "#9A9A9A";
    default:
      return "#111111";
  }
};

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
                  <View style={styles.cardImageWrapper}>
                    <Image source={card.image} style={styles.cardImage} />

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(card.status) },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>{card.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardMeta}>
                    {card.date} • {card.time}
                  </Text>
                  <Text style={styles.cardDuration}>{card.duration}</Text>
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
                    <Text style={styles.listSubtitle}>{item.rating}</Text>
                    <Text style={styles.savedAddress}>{item.address}</Text>
                  </View>
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
    width: 124,
    marginRight: 18,
    alignItems: "center",
  },

  cardImageWrapper: {
    position: "relative",
  },

  cardImage: {
    width: 118,
    height: 118,
    borderRadius: 18,
    marginBottom: 6,
  },

  statusBadge: {
    position: "absolute",
    bottom: 12,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },

  cardMeta: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    marginTop: 2,
  },

  cardDuration: {
    fontSize: 13,
    color: "#111111",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
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

  savedAddress: {
    fontSize: 14,
    color: "#111111",
    marginTop: 2,
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