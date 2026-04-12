import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { useVehicleStore } from "../context/vehicleStore";

type Props = NativeStackScreenProps<RootStackParamList, "VehicleManagement">;

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  image: any;
};

const MAX_WIDTH = 428;

export default function VehicleManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { selectedVehicle, setSelectedVehicle } = useVehicleStore();
  const vehicles: Vehicle[] = [];

  const hasVehicles = vehicles.length > 0;

  const handleAddVehicle = () => {
    console.log("Add vehicle pressed");
    // navigation.navigate("AddVehicle");
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
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
                hitSlop={10}
              >
                <Ionicons name="arrow-back" size={20} color="#111111" />
              </Pressable>

              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            <Text style={styles.title}>My Vehicles</Text>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>My Cars</Text>

              {hasVehicles ? (
                <Pressable
                  onPress={handleAddVehicle}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.addNewText}>+ Add new car</Text>
                </Pressable>
              ) : null}
            </View>

            {hasVehicles ? (
              <View style={styles.cardsList}>
                {vehicles.map((vehicle: Vehicle) => {
                  const isSelected = selectedVehicle?.id === vehicle.id;
                
                  return (
                    <Pressable
                      key={vehicle.id}
                      onPress={() => {
                        setSelectedVehicle(vehicle);
                        navigation.goBack();
                      }}
                      style={({ pressed }) => [
                        styles.vehicleCard,
                        isSelected && styles.selectedCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleName}>{vehicle.name}</Text>
                        <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                      </View>
                    
                      <View style={styles.imageWrapper}>
                        <Image
                          source={vehicle.image}
                          style={styles.vehicleImage}
                          resizeMode="contain"
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyStateWrapper}>
                <Text style={styles.emptyTitle}>No Vehicles Added</Text>
                <Text style={styles.emptySubtitle}>
                  You can add and edit vehicle information below
                </Text>

                <Pressable
                  onPress={handleAddVehicle}
                  style={({ pressed }) => [
                    styles.addVehicleCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.plusCircle}>
                    <Ionicons name="add" size={28} color="#111111" />
                  </View>

                  <Text style={styles.addVehicleText}>Add Vehicle</Text>
                </Pressable>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Profile" />
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
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    height: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#465079",
  },
  addNewText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#ECAA00",
  },
  cardsList: {
    gap: 14,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#ECAA00",
  },
  vehicleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  vehiclePlate: {
    marginTop: 4,
    fontSize: 14,
    color: "#666666",
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vehicleImage: {
    width: 88,
    height: 58,
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
    marginTop: 18,
  },
  emptySubtitle: {
    marginTop: 10,
    fontSize: 13,
    color: "#444444",
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
  addVehicleCard: {
    marginTop: 34,
    width: "100%",
    maxWidth: 260,
    minHeight: 160,
    borderRadius: 8,
    backgroundColor: "#ECAA00",
    borderWidth: 1,
    borderColor: "#A06F00",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  addVehicleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  pressed: {
    opacity: 0.75,
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});