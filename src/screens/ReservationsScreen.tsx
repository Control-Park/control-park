import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useFavoritesStore } from "../context/favoritesStore";
import {
  ReservationRecord,
  ReservationStatus,
  useReservationStore,
} from "../context/reservationStore";

import { fetchListings } from "../api/listings";
import { Listing } from "../types/listing";
import { useQuery } from "@tanstack/react-query";
import { getListingImage } from "../utils/listingImages";

type Props = NativeStackScreenProps<RootStackParamList, "Reservations">;

// TODO: MAKE RESERVED SCREENS UNIQUE.

const MAX_WIDTH = 428;

const getReservationStatus = (
  reservation: Pick<ReservationRecord, "reservedFrom" | "reservedUntil">,
): ReservationStatus => {
  const now = Date.now();
  const start = new Date(reservation.reservedFrom).getTime();
  const end = new Date(reservation.reservedUntil).getTime();

  if (now < start) return "Upcoming";
  if (now > end) return "Expired";
  return "Active";
};

const formatReservationDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatReservationTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatReservationDuration = (start: Date, end: Date) => {
  const totalMinutes = Math.max(
    15,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) {
    return `${hours}.${Math.floor((minutes / 60) * 10)} hrs`;
  }

  if (hours) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${minutes} min`;
};

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "Active":
      return "#22C55E";
    case "Upcoming":
      return "#F59E0B";
    case "Expired":
      return "#EF4444";
    default:
      return "#111111";
  }
};

const resolveListingForReservation = (
  reservation: ReservationRecord,
  listings: Listing[],
) => listings.find((listing) => listing.id === reservation.listingId) ?? null;

export default function ReservationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { favorites } = useFavoritesStore();
  const reservations = useReservationStore((state) => state.reservations);

  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });

  if (isLoading) return <Text>Loading reservations...</Text>;
  if (isError) return <Text>Error: {(error as Error)?.message}</Text>;
  if (!listings) return null;

  const savedListings = listings.filter((listing) => favorites[listing.id]);

  const reservationCards = reservations
    .map((reservation) => {
      const listing = resolveListingForReservation(reservation, listings);

      if (!listing) {
        return null;
      }

      const start = new Date(reservation.reservedFrom);
      const end = new Date(reservation.reservedUntil);

      return {
        reservation,
        listing,
        title: listing.title || listing.structure_name,
        date: formatReservationDate(start),
        time: formatReservationTime(start),
        duration: formatReservationDuration(start, end),
        status: getReservationStatus(reservation),
      };
    })
    .filter((card): card is NonNullable<typeof card> => card !== null);

  const handleRenewReservation = (reservation: ReservationRecord) => {
    navigation.navigate("Reserve", { id: reservation.listingId });
  };

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
              {reservationCards.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No reservations yet</Text>
                  <Text style={styles.emptyText}>
                    Reserve a listing and it will show up here with its live
                    status.
                  </Text>
                </View>
              ) : (
                reservationCards.map((card) => (
                  <Pressable
                    key={card.reservation.id}
                    style={({ pressed }) => [
                      styles.card,
                      card.status === "Expired" && styles.expiredCard,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => {
                      if (card.status === "Expired") {
                        Alert.alert(
                          "Your reservation has ended",
                          "Would you like to renew this reservation?",
                          [
                            { text: "No", style: "cancel" },
                            {
                              text: "Renew",
                              onPress: () =>
                                handleRenewReservation(card.reservation),
                            },
                          ],
                        );
                        return;
                      }

                      navigation.navigate("ActiveReservation", {
                        reservationId: card.reservation.id,
                      });
                    }}
                  >
                    <View style={styles.cardImageWrapper}>
                      <Image
                        source={getListingImage(card.listing)}
                        style={styles.cardImage}
                      />

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
                      {card.date} | {card.time}
                    </Text>
                    <Text style={styles.cardDuration}>{card.duration}</Text>

                    {card.status === "Expired" && (
                      <>
                        <Text style={styles.expiredText}>
                          This reservation has expired.
                        </Text>

                        <Pressable
                          style={styles.renewButton}
                          onPress={() => handleRenewReservation(card.reservation)}
                        >
                          <Text style={styles.renewButtonText}>Renew</Text>
                        </Pressable>
                      </>
                    )}
                  </Pressable>
                ))
              )}
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
                  onPress={() => navigation.navigate("Details", { id: item.id })}
                >
                  <Image
                    source={getListingImage(item)}
                    style={styles.avatarImage}
                  />

                  <View style={styles.listTextBlock}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>{item.rating ?? "New"}</Text>
                      {item.rating ? (
                        <Ionicons
                          name="star"
                          size={14}
                          color="#F59E0B"
                          style={{ marginLeft: 4 }}
                        />
                      ) : null}
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
  emptyState: {
    width: 220,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#555555",
    lineHeight: 18,
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
  renewButton: {
    marginTop: 8,
    backgroundColor: "#ECAA00",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  renewButtonText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
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
