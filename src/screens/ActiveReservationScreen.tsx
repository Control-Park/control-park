import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import { useReservationStore } from "../context/reservationStore";
import { useQuery } from "@tanstack/react-query";
import { fetchListingById } from "../api/listings";

type Props = NativeStackScreenProps<RootStackParamList, "ActiveReservation">;

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatRemainingTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")} s`;
};

export default function ActiveReservationScreen({ route, navigation }: Props) {
  const { reservationId } = route.params;
  const reservation = useReservationStore((state) =>
    state.reservations.find((item) => item.id === reservationId),
  );
  const removeReservation = useReservationStore((state) => state.removeReservation);
  const [now, setNow] = useState(Date.now());

  const { data: listing } = useQuery({
    queryKey: ["listing", reservation?.listingId],
    queryFn: () => fetchListingById(reservation!.listingId),
    enabled: !!reservation?.listingId,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startDate = useMemo(
    () => (reservation ? new Date(reservation.reservedFrom) : null),
    [reservation],
  );
  const endDate = useMemo(
    () => (reservation ? new Date(reservation.reservedUntil) : null),
    [reservation],
  );

  if (!reservation || !startDate || !endDate) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base text-black">
          This reservation is no longer available.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Reservations")}
          className="mt-6 rounded-md bg-[#ECAA00] px-5 py-3"
        >
          <Text className="font-semibold text-black">Back to reservations</Text>
        </Pressable>
      </View>
    );
  }

  const remainingMs = endDate.getTime() - now;
  const isExpired = remainingMs <= 0;
  const title = listing?.title || listing?.structure_name || "Reservation";

  const finishReservation = () => {
    removeReservation(reservation.id);
    navigation.navigate("Reservations");
  };

  const renewReservation = () => {
    navigation.navigate("Reserve", { id: reservation.listingId });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-12">
        <Pressable onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-2xl">{"<"}</Text>
        </Pressable>

        <Text className="mb-2 text-3xl font-semibold text-black">
          {isExpired ? "Reservation Ended" : "Active Reservation"}
        </Text>
        <Text className="mb-8 text-base text-[#8a8a8a]">{title}</Text>

        <View className="mb-6 items-center">
          <View className="h-[140px] w-[140px] items-center justify-center rounded-full border-[10px] border-[#ECAA00]">
            <Text className="mb-1 text-base text-[#8a8a8a]">
              {isExpired ? "Ended" : "Remaining Time"}
            </Text>
            <Text className="text-center text-3xl font-semibold text-black">
              {isExpired ? "00 : 00 s" : formatRemainingTime(remainingMs)}
            </Text>
          </View>
        </View>

        <View className="mb-10 items-center">
          <Text className="text-base text-[#8a8a8a]">
            {formatDateLabel(startDate)}
          </Text>
          <Text className="mt-2 text-base text-[#8a8a8a]">
            {formatTimeLabel(startDate)} - {formatTimeLabel(endDate)}
          </Text>
        </View>

        <Pressable
          className="mb-4 items-center rounded-md bg-[#ECAA00] py-4"
          onPress={() => {
            Alert.alert(
              "Finish Reservation",
              "Do you want to end this reservation now?",
              [
                { text: "Keep", style: "cancel" },
                { text: "Finish", onPress: finishReservation },
              ],
            );
          }}
        >
          <Text className="text-lg font-semibold text-black">Finish</Text>
        </Pressable>

        <Pressable className="items-center" onPress={renewReservation}>
          <Text className="text-lg text-[#8a8a8a]">Renew</Text>
        </Pressable>
      </View>

      <View className="mt-auto">
        <Navbar activeTab="Home" />
      </View>
    </View>
  );
}
