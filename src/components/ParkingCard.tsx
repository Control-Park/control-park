import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ParkingCardData = {
  id: string;
  title: string;
  subtitle?: string; // e.g. "$10 for a day, 3.9 miles away"
  images: any[];
  isGuestFavorite?: boolean;
  isFavorited?: boolean;
};

type Props = {
  data: ParkingCardData;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function ParkingCard({ data, onToggleFavorite, onPress, style }: Props) {
  return (
    <Pressable style={[styles.card, style]} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={data.images[0]} style={styles.image} />

        {data.isGuestFavorite && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Guest favorite</Text>
          </View>
        )}

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          hitSlop={10}
          style={styles.heart}
        >
          <Ionicons
            name={data.isFavorited ? "heart" : "heart-outline"}
            size={22}
            color={data.isFavorited ? "#EF4444" : "#FFFFFF"}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {data.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {data.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 175,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  heart: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  body: {
    marginTop: 10,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});