import React, { useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import SectionHeader from "../components/SectionHeader";
import ParkingCard, { ParkingCardData } from "../components/ParkingCard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // Data for the top row (Parking Lots)
  const parkingLots = useMemo<ParkingCardData[]>(
    () => [
      {
        id: "p1",
        title: "Lot G7",
        subtitle: "$10 for a day, 3.9 miles away",
        image: require("../../assets/parking1.png"),
        isGuestFavorite: true,
        isFavorited: false,
      },
      {
        id: "p2",
        title: "Palo Verde Parking Structure",
        subtitle: "$3 per hour, 4.6 miles away",
        image: require("../../assets/parking2.png"),
        isGuestFavorite: true,
        isFavorited: false,
      },
      {
        id: "p3",
        title: "Lot G12",
        subtitle: "$3 per hour, 4.3 miles away",
        image: require("../../assets/parking3.png"),
        isGuestFavorite: false,
        isFavorited: false,
      },
    ],
    []
  );

  // Data for the second row (Lots Near You)
  const lotsNearYou = useMemo<ParkingCardData[]>(
    () => [
      {
        id: "n1",
        title: "Pyramid Parking Structure",
        subtitle: "$3 per hours, 2.9 miles away",
        image: require("../../assets/parking4.png"),
        isGuestFavorite: true,
        isFavorited: true,
      },
      {
        id: "n2",
        title: "Lot G9",
        subtitle: "$10 for a day, 2.8 miles away",
        image: require("../../assets/parking5.png"),
        isGuestFavorite: true,
        isFavorited: false,
      },
      {
        id: "n3",
        title: "Lot G12",
        subtitle: "$3 per hour, 4.3 miles away",
        image: require("../../assets/parking3.png"),
        isGuestFavorite: false,
        isFavorited: false,
      },
    ],
    []
  );

  const renderCard = ({ item }: { item: ParkingCardData }) => (
    <View style={{ marginRight: 12 }}>
      <ParkingCard data={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <NotificationsButton onPress={() => console.log("Notifications")} />

      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <SearchBar />

        {/* Parking Lots section */}
        <SectionHeader title="Parking Lots" />
        <FlatList
          data={parkingLots}
          renderItem={renderCard}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6, paddingRight: 16 }}
        />

        {/* Lots Near You section */}
        <SectionHeader title="Lots Near You" />
        <FlatList
          data={lotsNearYou}
          renderItem={renderCard}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6, paddingRight: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },
  container: { flex: 1, paddingHorizontal: 16 },
});