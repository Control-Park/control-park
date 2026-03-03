import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ParkingCard, { ParkingCardData } from "../components/ParkingCard";
import SectionHeader from "../components/SectionHeader";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const demoCard: ParkingCardData = {
    id: "g7",
    title: "Lot G7",
    subtitle: "$10 for a day, 3.9 miles away",
    image: require("../../assets/parking1.png"),
    isGuestFavorite: true,
    isFavorited: false,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <NotificationsButton onPress={() => console.log("Notifications")} />

      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <SearchBar />

        <SectionHeader title="Parking Lots" />

        <ParkingCard data={demoCard} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});