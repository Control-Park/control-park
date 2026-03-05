import React, { useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import SectionHeader from "../components/SectionHeader";
import ParkingCard, { ParkingCardData } from "../components/ParkingCard";
import CustomButton from "../components/CustomButton";
import Navbar, { TabKey } from "../components/Navbar";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const MAX_WIDTH = 420;

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("Home");

  // Favorite toggle state: id -> t/f
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

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
        isGuestFavorite: true,
        isFavorited: false,
      },
    ],
    []
  );

  const lotsNearYou = useMemo<ParkingCardData[]>(
    () => [
      {
        id: "n1",
        title: "Pyramid Parking Structure",
        subtitle: "$3 per hours, 2.9 miles away",
        image: require("../../assets/parking4.png"),
        isGuestFavorite: true,
        isFavorited: false,
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
        isGuestFavorite: true,
        isFavorited: false,
      },
    ],
    []
  );

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCard = ({ item }: { item: ParkingCardData }) => (
    <View style={{ marginRight: 12 }}>
      <ParkingCard
        data={{ ...item, isFavorited: !!favorites[item.id] }}
        onToggleFavorite={() => toggleFavorite(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* top area */}
      <View style={[styles.pageMax, { paddingTop: 5 }]}>
        <View style={styles.topArea}>
          <View style={styles.topRow}>
            <NotificationsButton onPress={() => console.log("Notifications")} />
          </View>

          <SearchBar />
          <View style={styles.topSpacer} />
        </View>
      </View>

      {/* content area (fills remaining space above navbar) */}
      <View style={styles.sectionsBackground}>
        <View style={styles.sectionsInner}>
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

          <SectionHeader title="Lots Near You" />
          <FlatList
            data={lotsNearYou}
            renderItem={renderCard}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
          />

          <CustomButton
            title="signup (placeholder to test)"
            color="#ECAA00"
            className="flex items-center justify-center"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </View>

      {/* navbar occupies bottom space (NOT floating) */}
      <Navbar
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);

          if (tab === "Home") navigation.navigate("Home");
          if (tab === "Explore") console.log("Explore");
          if (tab === "Listings") console.log("Listings");
          if (tab === "Messages") console.log("Messages");
          if (tab === "Profile") console.log("Profile");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
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
    marginBottom: 10,
  },

  topSpacer: {
    height: 45,
  },

  sectionsBackground: {
    backgroundColor: "#EAEAEA",
    width: "100%",
    flex: 1,
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
});