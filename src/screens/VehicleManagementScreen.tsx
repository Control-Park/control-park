import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "../navigation/AppNavigator";
import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import { useVehicleStore, type Vehicle } from "../context/vehicleStore";

type Props = NativeStackScreenProps<RootStackParamList, "VehicleManagement">;

const MAX_WIDTH = 428;

export default function VehicleManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    removeVehicle,
  } = useVehicleStore();

  const [isAddVehicleModalVisible, setIsAddVehicleModalVisible] =
    useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [isSelectPrimaryModalVisible, setIsSelectPrimaryModalVisible] =
    useState(false);
  const [pendingSelectedVehicle, setPendingSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleImageUri, setVehicleImageUri] = useState<string | null>(null);

  const [plateNumberError, setPlateNumberError] = useState("");
  const [vehicleMakeError, setVehicleMakeError] = useState("");
  const [vehicleModelError, setVehicleModelError] = useState("");
  const [vehicleYearError, setVehicleYearError] = useState("");
  const [vehicleColorError, setVehicleColorError] = useState("");

  const hasVehicles = vehicles.length > 0;
  const currentYear = new Date().getFullYear();
  const isEditing = editingVehicleId !== null;

  const validatePlateNumber = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Plate number is required.";
    }

    if (trimmed.length < 2) {
      return "Plate number is too short.";
    }

    return "";
  };

  const validateVehicleMake = (value: string) => {
    if (!value.trim()) {
      return "Vehicle make is required.";
    }

    return "";
  };

  const validateVehicleModel = (value: string) => {
    if (!value.trim()) {
      return "Vehicle model is required.";
    }

    return "";
  };

  const validateVehicleYear = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Vehicle year is required.";
    }

    if (!/^\d{4}$/.test(trimmed)) {
      return "Enter a valid 4-digit year.";
    }

    const numericYear = Number(trimmed);

    if (numericYear < 1900 || numericYear > currentYear + 1) {
      return `Year must be between 1900 and ${currentYear + 1}.`;
    }

    return "";
  };

  const validateVehicleColor = (value: string) => {
    if (!value.trim()) {
      return "Vehicle color is required.";
    }

    return "";
  };

  const validateForm = () => {
    const plateError = validatePlateNumber(plateNumber);
    const makeError = validateVehicleMake(vehicleMake);
    const modelError = validateVehicleModel(vehicleModel);
    const yearError = validateVehicleYear(vehicleYear);
    const colorError = validateVehicleColor(vehicleColor);

    setPlateNumberError(plateError);
    setVehicleMakeError(makeError);
    setVehicleModelError(modelError);
    setVehicleYearError(yearError);
    setVehicleColorError(colorError);

    return !plateError && !makeError && !modelError && !yearError && !colorError;
  };

  const resetForm = () => {
    setPlateNumber("");
    setVehicleMake("");
    setVehicleModel("");
    setVehicleYear("");
    setVehicleColor("");
    setVehicleImageUri(null);
    setPlateNumberError("");
    setVehicleMakeError("");
    setVehicleModelError("");
    setVehicleYearError("");
    setVehicleColorError("");
    setEditingVehicleId(null);
  };

  const openAddVehicleModal = () => {
    resetForm();
    setIsAddVehicleModalVisible(true);
  };

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setPlateNumber(vehicle.plate);
    setVehicleMake(vehicle.make);
    setVehicleModel(vehicle.model);
    setVehicleYear(vehicle.year);
    setVehicleColor(vehicle.color);
    setVehicleImageUri(vehicle.image ?? null);
    setPlateNumberError("");
    setVehicleMakeError("");
    setVehicleModelError("");
    setVehicleYearError("");
    setVehicleColorError("");
    setIsAddVehicleModalVisible(true);
  };

  const closeAddVehicleModal = () => {
    setIsAddVehicleModalVisible(false);
    resetForm();
  };

  const closePrimaryVehicleModal = () => {
    setIsSelectPrimaryModalVisible(false);
    setPendingSelectedVehicle(null);
  };

  const handleTakePicture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera permission needed",
        "Please allow camera access to take a vehicle photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setVehicleImageUri(result.assets[0].uri);
    }
  };

  const handleChooseFromExisting = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo library permission needed",
        "Please allow photo access to choose an existing vehicle image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setVehicleImageUri(result.assets[0].uri);
    }
  };

  const handleConfirmAddVehicle = () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const normalizedVehicle: Vehicle = {
      id: editingVehicleId ?? Date.now().toString(),
      name: `${vehicleYear.trim()} ${vehicleMake.trim()} ${vehicleModel.trim()}`,
      plate: plateNumber.trim().toUpperCase(),
      image: vehicleImageUri ?? undefined,
      make: vehicleMake.trim(),
      model: vehicleModel.trim(),
      year: vehicleYear.trim(),
      color: vehicleColor.trim(),
    };

    if (isEditing) {
      updateVehicle(normalizedVehicle);
      setSelectedVehicle(normalizedVehicle);
    } else {
      addVehicle(normalizedVehicle);
      setSelectedVehicle(normalizedVehicle);
    }

    closeAddVehicleModal();
  };

  const handleRemoveVehicle = () => {
    if (!editingVehicleId) {
      return;
    }

    const confirmRemoval = () => {
      removeVehicle(editingVehicleId);

      if (selectedVehicle?.id === editingVehicleId) {
        setSelectedVehicle(null);
      }

      closeAddVehicleModal();
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to remove this vehicle?",
      );

      if (confirmed) {
        confirmRemoval();
      }

      return;
    }

    Alert.alert(
      "Remove vehicle",
      "Are you sure you want to remove this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: confirmRemoval,
        },
      ],
    );
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
                  onPress={openAddVehicleModal}
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
                        if (selectedVehicle?.id !== vehicle.id) {
                          setPendingSelectedVehicle(vehicle);
                          setIsSelectPrimaryModalVisible(true);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.vehicleCard,
                        isSelected && styles.selectedCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.vehicleInfo}>
                        <View style={styles.vehicleTextBlock}>
                          <Text style={styles.vehicleName}>{vehicle.name}</Text>
                          <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                        </View>

                        <Pressable
                          onPress={() => openEditVehicleModal(vehicle)}
                          style={({ pressed }) => [
                            styles.cardEditButton,
                            pressed && styles.pressed,
                          ]}
                          hitSlop={8}
                        >
                          <Text style={styles.cardEditButtonText}>Edit</Text>
                        </Pressable>
                      </View>

                      <View style={styles.imageWrapper}>
                        {vehicle.image ? (
                          <Image
                            source={{ uri: vehicle.image }}
                            style={styles.vehicleImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons
                            name="car-outline"
                            size={28}
                            color="#666666"
                          />
                        )}
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
                  onPress={openAddVehicleModal}
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

      <Modal
        visible={isAddVehicleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAddVehicleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Pressable
              onPress={closeAddVehicleModal}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
              hitSlop={10}
            >
              <Ionicons name="close" size={18} color="#444444" />
            </Pressable>

            <View style={styles.formContent}>
              <Text style={styles.inputLabel}>Plate Number*</Text>
              <TextInput
                value={plateNumber}
                onChangeText={(text) => {
                  const normalized = text.toUpperCase();
                  setPlateNumber(normalized);
                  if (plateNumberError) {
                    setPlateNumberError(validatePlateNumber(normalized));
                  }
                }}
                style={[
                  styles.fullInput,
                  plateNumberError ? styles.inputErrorBorder : null,
                ]}
                placeholder=""
                placeholderTextColor="#999999"
                autoCapitalize="characters"
              />
              {plateNumberError ? (
                <Text style={styles.errorText}>{plateNumberError}</Text>
              ) : null}

              <View style={styles.rowInputs}>
                <View style={styles.halfInputWrapper}>
                  <Text style={styles.inputLabel}>Vehicle Make*</Text>
                  <TextInput
                    value={vehicleMake}
                    onChangeText={(text) => {
                      setVehicleMake(text);
                      if (vehicleMakeError) {
                        setVehicleMakeError(validateVehicleMake(text));
                      }
                    }}
                    style={[
                      styles.halfInput,
                      vehicleMakeError ? styles.inputErrorBorder : null,
                    ]}
                    placeholder=""
                    placeholderTextColor="#999999"
                  />
                  {vehicleMakeError ? (
                    <Text style={styles.errorText}>{vehicleMakeError}</Text>
                  ) : null}
                </View>

                <View style={styles.halfInputWrapper}>
                  <Text style={styles.inputLabel}>Vehicle Model*</Text>
                  <TextInput
                    value={vehicleModel}
                    onChangeText={(text) => {
                      setVehicleModel(text);
                      if (vehicleModelError) {
                        setVehicleModelError(validateVehicleModel(text));
                      }
                    }}
                    style={[
                      styles.halfInput,
                      vehicleModelError ? styles.inputErrorBorder : null,
                    ]}
                    placeholder=""
                    placeholderTextColor="#999999"
                  />
                  {vehicleModelError ? (
                    <Text style={styles.errorText}>{vehicleModelError}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInputWrapper}>
                  <Text style={styles.inputLabel}>Vehicle Year*</Text>
                  <TextInput
                    value={vehicleYear}
                    onChangeText={(text) => {
                      const numericOnly = text.replace(/[^0-9]/g, "");
                      setVehicleYear(numericOnly);
                      if (vehicleYearError) {
                        setVehicleYearError(validateVehicleYear(numericOnly));
                      }
                    }}
                    style={[
                      styles.halfInput,
                      vehicleYearError ? styles.inputErrorBorder : null,
                    ]}
                    placeholder=""
                    placeholderTextColor="#999999"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  {vehicleYearError ? (
                    <Text style={styles.errorText}>{vehicleYearError}</Text>
                  ) : null}
                </View>

                <View style={styles.halfInputWrapper}>
                  <Text style={styles.inputLabel}>Vehicle Color*</Text>
                  <TextInput
                    value={vehicleColor}
                    onChangeText={(text) => {
                      setVehicleColor(text);
                      if (vehicleColorError) {
                        setVehicleColorError(validateVehicleColor(text));
                      }
                    }}
                    style={[
                      styles.halfInput,
                      vehicleColorError ? styles.inputErrorBorder : null,
                    ]}
                    placeholder=""
                    placeholderTextColor="#999999"
                  />
                  {vehicleColorError ? (
                    <Text style={styles.errorText}>{vehicleColorError}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.photoActions}>
                <Pressable
                  onPress={handleTakePicture}
                  style={({ pressed }) => [
                    styles.photoActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="camera-outline" size={18} color="#111111" />
                  <Text style={styles.photoActionText}>Take picture</Text>
                </Pressable>

                <Pressable
                  onPress={handleChooseFromExisting}
                  style={({ pressed }) => [
                    styles.photoActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="images-outline" size={18} color="#111111" />
                  <Text style={styles.photoActionText}>
                    Choose from existing
                  </Text>
                </Pressable>

                {vehicleImageUri ? (
                  <View style={styles.previewWrapper}>
                    <Image
                      source={{ uri: vehicleImageUri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeAddVehicleModal}
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.footerButtonBorder,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmAddVehicle}
                style={({ pressed }) => [
                  styles.footerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerButtonText}>
                  {isEditing ? "Save" : "Confirm"}
                </Text>
              </Pressable>
            </View>

            {isEditing ? (
              <Pressable
                onPress={handleRemoveVehicle}
                style={({ pressed }) => [
                  styles.removeVehicleButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.removeVehicleText}>- Remove Vehicle</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSelectPrimaryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePrimaryVehicleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmTitle}>Set as primary vehicle?</Text>

            <Text style={styles.confirmSubtitle}>
              Do you want to set{" "}
              <Text style={styles.confirmVehicleName}>
                {pendingSelectedVehicle?.name}
              </Text>{" "}
              as your primary vehicle?
            </Text>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closePrimaryVehicleModal}
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.footerButtonBorder,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (pendingSelectedVehicle) {
                    setSelectedVehicle(pendingSelectedVehicle);
                  }
                  closePrimaryVehicleModal();
                }}
                style={({ pressed }) => [
                  styles.footerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    minHeight: 110,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#ECAA00",
  },
  vehicleInfo: {
    flex: 1,
    paddingRight: 12,
    minHeight: 72,
    justifyContent: "center",
    position: "relative",
    paddingBottom: 2,
  },
  vehicleTextBlock: {
    justifyContent: "center",
    paddingRight: 52,
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
  cardEditButton: {
    position: "absolute",
    right: 12,
    bottom: 0,
    paddingLeft: 8,
    paddingTop: 8,
  },
  cardEditButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    textDecorationLine: "underline",
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginTop: 18,
  },
  emptySubtitle: {
    marginTop: 10,
    fontSize: 13,
    color: "#666666",
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
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 392,
    backgroundColor: "#ECECEC",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  confirmModalCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confirmVehicleName: {
    fontWeight: "600",
    color: "#111111",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  formContent: {
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 6,
  },
  fullInput: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  halfInputWrapper: {
    flex: 1,
  },
  halfInput: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  photoActions: {
    marginTop: 6,
    gap: 12,
  },
  photoActionButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADADA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoActionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
  },
  previewWrapper: {
    marginTop: 6,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#D0D0D0",
  },
  footerButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonBorder: {
    borderRightWidth: 1,
    borderRightColor: "#D0D0D0",
  },
  footerButtonText: {
    fontSize: 14,
    color: "#111111",
    fontWeight: "500",
  },
  inputErrorBorder: {
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#DC2626",
  },
  removeVehicleButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  removeVehicleText: {
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.75,
  },
});