import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_WIDTH = 428;

export default function GuestProfileScreen() {
  const navigation = useNavigation<NavProp>();

  const reviews = [
    {
      title: "Lot G7",
      text: "Adam was communicative and friendly",
      rating: "5/5",
    },
    {
      title: "Lot G9",
      text: "Great guest",
      rating: "5/5",
    },
    {
      title: "Listing Name",
      text: "Very respectful",
      rating: "5/5",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageMax}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.avatar} />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Adam L.</Text>
            <Text style={styles.role}>Guest</Text>

            <Text style={styles.bio}>
              Hi, my name is Adam and I like to travel. I am currently traveling
              across America, so I will be using this app frequently!
            </Text>

            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => 
                navigation.navigate("Conversation", {
                    listingId: "test-id",
                    hostName: "Adam L.",
                    listingTitle: "Lot G7",
                    listingImage: null,
                })
            }
            
            >
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ratings */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Total Ratings</Text>
          <Text style={styles.ratingValue}>2</Text>

          <Text style={styles.ratingLabel}>Average Ratings</Text>
          <Text style={styles.ratingValue}>5 / 5</Text>
        </View>

        {/* Reviews */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Previous Reviews</Text>
          <Text style={styles.allText}>All</Text>
        </View>

        {reviews.map((r, index) => (
          <View key={index} style={styles.reviewRow}>
            <View style={styles.reviewAvatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>{r.title}</Text>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>

            <Text style={styles.reviewRating}>{r.rating}</Text>
          </View>
        ))}

        {/* Booking Request */}
        <Text style={styles.sectionTitle}>Booking Request</Text>

        <View style={styles.bookingRow}>
          <View style={styles.yellowCard}>
            <Text style={styles.cardLabel}>Date</Text>
            <Text style={styles.cardMain}>April 15, 2026</Text>

            <Text style={styles.cardLabel}>Time Range</Text>
            <Text style={styles.cardMain}>9:30 AM - 5:00 PM</Text>
          </View>

          <View style={styles.whiteCard}>
            <Text style={styles.cardLabel}>Estimated Earnings</Text>
            <Text style={styles.cardMain}>$20</Text>

            <Text style={styles.cardLabel}>Current Ratings</Text>
            <Text style={styles.cardMain}>4.8 / 5</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptText}>Accept Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },

  header: {
    marginTop: 10,
    marginBottom: 16,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2ECC71",
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
  },

  role: {
    color: "#ECAA00",
    marginBottom: 6,
  },

  bio: {
    color: "#555",
    marginBottom: 10,
  },

  messageBtn: {
    backgroundColor: "#ECAA00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  messageText: {
    fontWeight: "600",
    color: "#111",
  },

  ratingCard: {
    backgroundColor: "#F3F3F3",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  ratingLabel: {
    fontSize: 14,
    color: "#555",
  },

  ratingValue: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  allText: {
    color: "#ECAA00",
  },

  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 10,
  },

  reviewTitle: {
    fontWeight: "600",
  },

  reviewText: {
    color: "#555",
  },

  reviewRating: {
    color: "#ECAA00",
    fontWeight: "600",
  },

  bookingRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 20,
  },

  yellowCard: {
    flex: 1,
    backgroundColor: "#ECAA00",
    padding: 14,
    borderRadius: 16,
  },

  whiteCard: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    padding: 14,
    borderRadius: 16,
  },

  cardLabel: {
    fontSize: 12,
    color: "#333",
  },

  cardMain: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111",
  },

  acceptBtn: {
    backgroundColor: "#ECAA00",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  acceptText: {
    fontWeight: "600",
    color: "#111",
  },

  cancelBtn: {
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
});