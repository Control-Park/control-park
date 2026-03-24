import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";

type Props = NativeStackScreenProps<RootStackParamList, "VehicleManagement">;

export default function VehicleManagementScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-4 pt-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#ECECEC]"
          >
            <Ionicons name="arrow-back" size={20} color="#111111" />
          </Pressable>

          <NotificationsButton />
        </View>

        <View className="px-4 pt-6">
          <Text className="text-[36px] font-abeezee text-[#111111]">
            Vehicle Management
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-[18px] font-abeezee text-[#111111]">
            Vehicle Management
          </Text>
        </View>

        <Navbar activeTab="Profile" />
      </View>
    </SafeAreaView>
  );
}