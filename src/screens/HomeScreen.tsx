import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import SectionHeader from "../components/SectionHeader";
import ParkingCard, { ParkingCardData } from "../components/ParkingCard";
import CustomButton from "../components/CustomButton";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar, { TabKey } from "../components/Navbar";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

import { parkingLots, lotsNearYou } from "../data/mockListings";
import { useFavoritesStore } from "../context/favoritesStore";
import { showSavedRemove, showSavedSuccess } from "../utils/validation";

const MAX_WIDTH = 428;

// useEffect(() => {
//   fetchListings()
//     .then(data => setListings(data))
//     .catch(err => console.log(err))
// }, [])

export default function HomeScreen({ navigation }: Props) {
  const [listings, setListings] = useState<ParkingCardData[]>([]);
  
  // placeholder: move function to another screen once implemented
  const insets = useSafeAreaInsets();
  const baseUrl = "http://localhost:9001/auth/user";
  const queryParams = {
    email: "tple06203@gmail.com",
  };
  const url = new URL(baseUrl);

  url.search = new URLSearchParams(queryParams).toString();
  console.log(url.href);

  async function getUserTest() {
    try {
      const response = await fetch(url.href);

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  }
  getUserTest();

  const { favorites, toggleFavorite } = useFavoritesStore();

  const renderCard = ({ item }: { item: ParkingCardData }) => (
    <View style={{ marginRight: 12 }}>
      <ParkingCard
        data={{ ...item, isFavorited: !!favorites[item.id] }}
        onToggleFavorite={() => {
        const isCurrentlyFavorited = !!favorites[item.id];
        toggleFavorite(item.id);
        if (!isCurrentlyFavorited) {
          showSavedSuccess("Added to your saved listings");
        } else {
          showSavedRemove("Removed from saved listings");
        }
      }}
        onPress={() => navigation.navigate("Details", { id: item.id })}
      />
    </View>
  );

  
  return (
    <View style={styles.safe}>
      {/* Scrollable content */}
      <ScrollView style={styles.scrollContainer} className="overflow-scroll">
        {/* top area (centered on large screens) */}
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top + 0 }]}>
            <View style={styles.topRow}>
              <NotificationsButton
                onPress={() => console.log("Notifications")}
              />
            </View>

            {/* Spacing + make search bar shorter (centered) */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchInner}>
                <SearchBar />
              </View>
            </View>

            <View style={styles.topSpacer} />
          </View>
        </View>

        {/* Background section */}
        <View style={styles.sectionsBackground}>
          <View style={styles.sectionsInner}>
            {/* Parking Lots section */}
            <SectionHeader title="Parking Lots" />
            <FlatList
              data={parkingLots}
              renderItem={renderCard}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
            />

            <View style={styles.sectionGap} />

            {/* Lots Near You section */}
            <SectionHeader title="Lots Near You" />
            <FlatList
              data={lotsNearYou}
              renderItem={renderCard}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
            />

            {/* placeholder for testing signup and login buttons */}
            <CustomButton
              title="signup (placeholder to test)"
              color="#ECAA00"
              className="flex items-center justify-center mt-6"
              onPress={() => navigation.navigate("Login")}
            />

            {/* Extra bottom padding to ensure content doesn't hide behind navbar */}
            <View style={{ height: 80 }} />
          </View>
        </View>
      </ScrollView>

      {/* Navbar - fixed at bottom */}
      <View style={[styles.navbarWrapper]}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Home" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
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
    backgroundColor: "#F6F6F6",
  },

  topRow: {
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  topSpacer: {
    height: 35,
  },

  searchWrapper: {
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },

  searchInner: {
    width: "96%",
    maxWidth: 400,
  },

  sectionsBackground: {
    backgroundColor: "#EAEAEA",
    width: "100%",
  },

  sectionsInner: {
    paddingHorizontal: 16,
    paddingTop: 6,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },

  rowContent: {
    paddingTop: 4,
    paddingBottom: 6,
    paddingRight: 8,
  },

  sectionGap: {
    height: 6,
  },

  // Navbar styles
  navbarWrapper: {
    backgroundColor: "#F6F6F6",
  },

  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});
