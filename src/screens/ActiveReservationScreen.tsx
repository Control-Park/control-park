import React from "react";
import { View, Text, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type Props = NativeStackScreenProps<RootStackParamList, "ActiveReservation">;

export default function ActiveReservationScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-12">
        <Pressable onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-2xl">←</Text>
        </Pressable>

        <Text className="text-3xl font-semibold text-black mb-8">
          Active Reservation
        </Text>

        <View className="items-center mb-6">
          <View className="h-[140px] w-[140px] rounded-full border-[10px] border-[#ECAA00] items-center justify-center">
            <Text className="text-[#8a8a8a] text-base mb-1">Remaining Time</Text>
            <Text className="text-3xl font-semibold text-black">35 : 22 s</Text>
          </View>
        </View>

        <View className="items-center mb-10">
          <Text className="text-[#8a8a8a] text-base">Feb 32nd, 2026</Text>
          <Text className="text-[#8a8a8a] text-base mt-2">12:00 PM - 5:00 PM</Text>
        </View>

        <Pressable className="bg-[#ECAA00] rounded-md py-4 items-center mb-4">
          <Text className="text-black text-lg font-semibold">Finish</Text>
        </Pressable>

        <Pressable className="items-center">
          <Text className="text-[#8a8a8a] text-lg">Renew</Text>
        </Pressable>
      </View>

      <View className="mt-auto">
        <Navbar activeTab="Home" />
      </View>
    </View>
  );
}