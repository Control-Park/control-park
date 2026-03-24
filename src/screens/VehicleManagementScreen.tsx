import React from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { mockVehicles } from "../data/mockVehicles";
import { useVehicleStore } from "../context/vehicleStore";

type Props = NativeStackScreenProps<RootStackParamList, "VehicleManagement">;

export default function VehicleManagementScreen({ navigation }: Props) {
  const { selectedVehicle, setSelectedVehicle } = useVehicleStore();

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#ECECEC]"
          >
            <Ionicons name="arrow-back" size={20} color="#111111" />
          </Pressable>

          <NotificationsButton />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[24px] font-abeezee text-[#111111]">
            My Vehicles
          </Text>

          <View className="mt-8 flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-[#465079]">My Cars</Text>
            <Pressable>
              <Text className="text-[16px] text-[#6C63FF]">+ Add new car</Text>
            </Pressable>
          </View>

          <View className="mt-5 gap-5">
            {mockVehicles.map((vehicle) => {
              const isSelected = selectedVehicle.id === vehicle.id;

              return (
                <Pressable
                  key={vehicle.id}
                  onPress={() => {
                    setSelectedVehicle(vehicle);
                    navigation.goBack();
                  }}
                  className="rounded-[18px] bg-white px-4 py-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 6,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? "#ECAA00" : "transparent",
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-[16px] font-bold text-[#666A7A]">
                        {vehicle.name}
                      </Text>
                      <Text className="mt-2 text-[14px] text-[#A0A5B5]">
                        {vehicle.plate}
                      </Text>
                    </View>
                    <View className="h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[10px] bg-[#D9D9D9]">
                      <Image
                        source={vehicle.image}
                        style={{ width: 90, height: 60 }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Navbar activeTab="Profile" />
      </View>
    </SafeAreaView>
  );
}