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
import { useFavoritesStore } from "../context/favoritesStore";
import { allListings } from "../data/mockListings";

type Props = NativeStackScreenProps<RootStackParamList, "Reservations">;

const MAX_WIDTH = 428;

const reservationCards = [
  {
    id: "res-1",
    listingId: "1",
    title: "Walter Pyramid",
    date: "Nov 12",
    time: "9:30 AM",
    duration: "2 hrs",
    status: "Active",
    image: require("../../assets/parking4.png"),
  },
  {
    id: "res-2",
    listingId: "2",
    title: "Lot G9",
    date: "Nov 12",
    time: "3:25 PM",
    duration: "1.5 hrs",
    status: "Upcoming",
    image: require("../../assets/parking5.png"),
  },
  {
    id: "res-3",
    listingId: "1",
    title: "Lot E1",
    date: "Nov 10",
    time: "11:00 AM",
    duration: "1 hr",
    status: "Expired",
    image: require("../../assets/parking4.png"),
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
    case "Expired":
      return "#EF4444";
    default:
      return "#111111";
  }
};

export default function ReservationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavoritesStore();
  const savedListings = allListings.filter((listing) => favorites[listing.id]);

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
                <Pressable
                  key={card.id}
                  style={({ pressed }) => [
                    styles.card,
                    card.status === "Expired" && styles.expiredCard,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() =>
                    navigation.navigate("Details", { id: card.listingId })
                  }
                >
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

                  {card.status === "Expired" && (
                    <Text style={styles.expiredText}>
                      This reservation has expired.
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.section}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Saved Listings</Text>

              {savedListings.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.listItem,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() =>
                    navigation.navigate("Details", { id: item.id })
                  }
                >
                  <Image source={item.images[0]} style={styles.avatarImage} />

                  <View style={styles.listTextBlock}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>{item.rating}</Text>
                      <Ionicons
                        name="star"
                        size={14}
                        color="#F59E0B"
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                    <Text style={styles.savedAddress}>{item.address}</Text>
                  </View>
                </Pressable>
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
  expiredCard: {
    opacity: 0.8,
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
  expiredText: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 14,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#111111",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 18,
  },
});