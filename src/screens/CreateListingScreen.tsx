import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
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

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type Props = NativeStackScreenProps<RootStackParamList, "CreateListing">;

export type ListingStatus = "active" | "inactive" | "draft";

export type HostListing = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  perks?: string;
  incentives?: string;
  address: string;
  campusLot: string;
  access: string;
  pricePerDay: number;
  reviewsCount: number;
  favoritesCount: number;
  status: ListingStatus;
};

const MAX_WIDTH = 428;

export default function CreateListingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const existingListings = route.params?.existingListings ?? [];

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState("");
  const [incentives, setIncentives] = useState("");
  const [address, setAddress] = useState("");
  const [campusLot, setCampusLot] = useState("");
  const [access, setAccess] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [showPickerModal, setShowPickerModal] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [campusLotError, setCampusLotError] = useState("");
  const [accessError, setAccessError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [imageError, setImageError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !!imageUri &&
      !!title.trim() &&
      !!description.trim() &&
      !!address.trim() &&
      !!campusLot.trim() &&
      !!access.trim() &&
      !!pricePerDay.trim()
    );
  }, [imageUri, title, description, address, campusLot, access, pricePerDay]);

  const validateForm = () => {
    const nextTitleError = title.trim() ? "" : "Title is required.";
    const nextDescriptionError = description.trim()
      ? ""
      : "Description is required.";
    const nextAddressError = address.trim() ? "" : "Address is required.";
    const nextCampusLotError = campusLot.trim()
      ? ""
      : "Campus lot is required.";
    const nextAccessError = access.trim() ? "" : "Access details are required.";

    const numericPrice = Number(pricePerDay);
    let nextPriceError = "";
    if (!pricePerDay.trim()) {
      nextPriceError = "Price is required.";
    } else if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      nextPriceError = "Enter a valid price.";
    }

    const nextImageError = imageUri ? "" : "At least one image is required.";

    setTitleError(nextTitleError);
    setDescriptionError(nextDescriptionError);
    setAddressError(nextAddressError);
    setCampusLotError(nextCampusLotError);
    setAccessError(nextAccessError);
    setPriceError(nextPriceError);
    setImageError(nextImageError);

    return !(
      nextTitleError ||
      nextDescriptionError ||
      nextAddressError ||
      nextCampusLotError ||
      nextAccessError ||
      nextPriceError ||
      nextImageError
    );
  };

  const handlePickFromLibrary = async () => {
    setShowPickerModal(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload an image.",
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
      setImageUri(result.assets[0].uri);
      setImageError("");
    }
  };

  const handleTakePhoto = async () => {
    setShowPickerModal(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a photo.",
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
      setImageUri(result.assets[0].uri);
      setImageError("");
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newListing: HostListing = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      image: imageUri,
      perks: perks.trim(),
      incentives: incentives.trim(),
      address: address.trim(),
      campusLot: campusLot.trim(),
      access: access.trim(),
      pricePerDay: Number(pricePerDay),
      reviewsCount: 0,
      favoritesCount: 0,
      status: "active",
    };

    navigation.replace("Profile", {
      createdListing: newListing,
      existingListings,
    });
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.goldBar} />

            <Text style={styles.title}>Create Listing</Text>

            <Pressable
              onPress={() => setShowPickerModal(true)}
              style={({ pressed }) => [
                styles.imageUploadCard,
                pressed && styles.pressed,
                imageError ? styles.inputErrorBorder : null,
              ]}
            >
              <Text style={styles.imageUploadLabel}>Upload your images*</Text>

              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.uploadPreview}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="add-circle-outline" size={46} color="#2F2A2C" />
              )}
            </Pressable>
            {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title*</Text>
              <TextInput
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (titleError) setTitleError(text.trim() ? "" : titleError);
                }}
                style={[styles.input, titleError ? styles.inputErrorBorder : null]}
              />
              {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description*</Text>
              <TextInput
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (descriptionError) {
                    setDescriptionError(text.trim() ? "" : descriptionError);
                  }
                }}
                style={[
                  styles.textArea,
                  descriptionError ? styles.inputErrorBorder : null,
                ]}
                multiline
                textAlignVertical="top"
              />
              {descriptionError ? (
                <Text style={styles.errorText}>{descriptionError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address*</Text>
              <TextInput
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  if (addressError) setAddressError(text.trim() ? "" : addressError);
                }}
                style={[styles.input, addressError ? styles.inputErrorBorder : null]}
              />
              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Campus Lot / Location*</Text>
              <TextInput
                value={campusLot}
                onChangeText={(text) => {
                  setCampusLot(text);
                  if (campusLotError) {
                    setCampusLotError(text.trim() ? "" : campusLotError);
                  }
                }}
                style={[
                  styles.input,
                  campusLotError ? styles.inputErrorBorder : null,
                ]}
              />
              {campusLotError ? (
                <Text style={styles.errorText}>{campusLotError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Access / Entry Details*</Text>
              <TextInput
                value={access}
                onChangeText={(text) => {
                  setAccess(text);
                  if (accessError) setAccessError(text.trim() ? "" : accessError);
                }}
                style={[styles.input, accessError ? styles.inputErrorBorder : null]}
              />
              {accessError ? <Text style={styles.errorText}>{accessError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Perks (optional)</Text>
              <TextInput
                value={perks}
                onChangeText={setPerks}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Incentives (optional)</Text>
              <TextInput
                value={incentives}
                onChangeText={setIncentives}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price per day*</Text>
              <TextInput
                value={pricePerDay}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, "");
                  setPricePerDay(cleaned);
                  if (priceError) setPriceError(cleaned ? "" : priceError);
                }}
                style={[styles.input, priceError ? styles.inputErrorBorder : null]}
                keyboardType="decimal-pad"
              />
              {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.postButton,
                !canSubmit && styles.postButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </Pressable>

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
        visible={showPickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPickerModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Pressable
              onPress={handleTakePhoto}
              style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
            >
              <Text style={styles.modalOptionText}>Take photo</Text>
            </Pressable>

            <Pressable
              onPress={handlePickFromLibrary}
              style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
            >
              <Text style={styles.modalOptionText}>Choose from library</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPickerModal(false)}
              style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContainer: {
    flex: 1,
  },
  pageMax: {
    width: "100%",
    maxWidth: 428,
    alignSelf: "center",
  },
  topArea: {
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 26,
  },
  goldBar: {
    height: 48,
    backgroundColor: "#ECAA00",
    marginHorizontal: -26,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#193A6A",
    textAlign: "center",
    marginBottom: 20,
  },
  imageUploadCard: {
    minHeight: 150,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADADA",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  imageUploadLabel: {
    position: "absolute",
    top: 28,
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  uploadPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 15,
    color: "#8A8A8A",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111111",
  },
  textArea: {
    minHeight: 102,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
  },
  postButton: {
    height: 44,
    borderRadius: 6,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 60,
  },
  postButtonDisabled: {
    opacity: 0.55,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  inputErrorBorder: {
    borderColor: "#D93025",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#D93025",
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: 428,
    alignSelf: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#111111",
    textAlign: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D93025",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});