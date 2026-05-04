import React, { useMemo, useState } from "react";
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
import { updateListing } from "../api/listings";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { normalizePickedImage } from "../utils/localImagePersistence";
import { getUploadedListingImageUri } from "../utils/listingImages";

type Props = NativeStackScreenProps<RootStackParamList, "EditListing">;

const MAX_WIDTH = 428;

export default function EditListingScreen({ route, navigation }: Props) {
  const { listing } = route.params;
  const insets = useSafeAreaInsets();
  const [listingState, setListingState] = useState(listing);

  const [imageUri, setImageUri] = useState<string | null>(
    getUploadedListingImageUri(listing),
  );
  const [title, setTitle] = useState(listing.title ?? "");
  const [description, setDescription] = useState(listing.description ?? "");
  const [perks, setPerks] = useState((listing.perks ?? []).join(", "));
  const [incentives, setIncentives] = useState(
    (listing.incentives ?? []).join(", "),
  );
  const [address, setAddress] = useState(listing.address ?? "");
  const [campusLot, setCampusLot] = useState(listing.structure_name ?? "");
  const [access, setAccess] = useState(listing.sub_heading?.[0] ?? "");
  const [pricePerDay, setPricePerDay] = useState(
    listing.price_per_hour ? String(listing.price_per_hour) : "",
  );
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const isCurrentlyActive = listingState.is_active ?? true;
  const isDraft = listingState.is_draft ?? false;

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [campusLotError, setCampusLotError] = useState("");
  const [accessError, setAccessError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [imageError, setImageError] = useState("");

  const canSubmit = useMemo(
    () =>
      !!imageUri &&
      !!title.trim() &&
      !!description.trim() &&
      !!address.trim() &&
      !!campusLot.trim() &&
      !!access.trim() &&
      !!pricePerDay.trim() &&
      !isSubmitting,
    [imageUri, title, description, address, campusLot, access, pricePerDay, isSubmitting],
  );

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
    if (!pricePerDay.trim()) nextPriceError = "Price is required.";
    else if (Number.isNaN(numericPrice) || numericPrice <= 0)
      nextPriceError = "Enter a valid price.";
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
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: Platform.OS === "web" ? 0.35 : 0.7,
      base64: Platform.OS === "web",
    });
    if (!result.canceled) {
      setImageUri(normalizePickedImage(result.assets[0]));
      setImageError("");
    }
  };

  const handleTakePhoto = async () => {
    setShowPickerModal(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: Platform.OS === "web" ? 0.35 : 0.7,
      base64: Platform.OS === "web",
    });
    if (!result.canceled) {
      setImageUri(normalizePickedImage(result.assets[0]));
      setImageError("");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const perksArray = perks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const incentivesArray = incentives
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedListing = await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        structure_name: campusLot.trim() || undefined,
        parking_type: listing.parking_type || "Structure",
        price_per_hour: Number(pricePerDay),
        perks: perksArray,
        incentives: incentivesArray,
        images: imageUri ? [imageUri] : listing.images,
        available_from: listing.available_from || new Date().toISOString(),
        available_until:
          listing.available_until ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sub_heading: access.trim() ? [access.trim()] : [],
        original_price: Number(pricePerDay),
        is_guest_favorite: listing.is_guest_favorite ?? false,
        is_popular: listing.is_popular ?? false,
        rating: listing.rating ?? 0,
        review_count: listing.review_count ?? 0,
        // Publishing a draft makes it active and removes it from the draft bucket.
        ...(isDraft ? { is_draft: false, is_active: true } : {}),
      });

      setListingState(updatedListing);
      navigation.navigate("Profile", {
        refreshKey: updatedListing.updated_at ?? `${Date.now()}`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update listing";
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
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

            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={20} color="#193A6A" />
            </Pressable>

            <Text style={styles.title}>Edit Listing</Text>

            <Pressable
              onPress={() => setShowPickerModal(true)}
              style={({ pressed }) => [
                styles.imageUploadCard,
                pressed && styles.pressed,
                imageError ? styles.inputErrorBorder : null,
              ]}
            >
              <Text style={styles.imageUploadLabel}>Listing image</Text>
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
                onChangeText={(t) => {
                  setTitle(t);
                  if (titleError) setTitleError(t.trim() ? "" : "Title is required.");
                }}
                style={[styles.input, titleError ? styles.inputErrorBorder : null]}
              />
              {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description*</Text>
              <TextInput
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (descriptionError)
                    setDescriptionError(t.trim() ? "" : "Description is required.");
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
                onChangeText={(t) => {
                  setAddress(t);
                  if (addressError) setAddressError(t.trim() ? "" : "Address is required.");
                }}
                style={[styles.input, addressError ? styles.inputErrorBorder : null]}
              />
              {addressError ? (
                <Text style={styles.errorText}>{addressError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Campus Lot / Location</Text>
              <TextInput
                value={campusLot}
                onChangeText={(t) => {
                  setCampusLot(t);
                  if (campusLotError) {
                    setCampusLotError(t.trim() ? "" : "Campus lot is required.");
                  }
                }}
                style={[styles.input, campusLotError ? styles.inputErrorBorder : null]}
              />
              {campusLotError ? <Text style={styles.errorText}>{campusLotError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Access / Entry Details</Text>
              <TextInput
                value={access}
                onChangeText={(t) => {
                  setAccess(t);
                  if (accessError) {
                    setAccessError(t.trim() ? "" : "Access details are required.");
                  }
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
                placeholder="Comma separated"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Incentives (optional)</Text>
              <TextInput
                value={incentives}
                onChangeText={setIncentives}
                style={styles.input}
                placeholder="Comma separated"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price per hour*</Text>
              <TextInput
                value={pricePerDay}
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9.]/g, "");
                  setPricePerDay(cleaned);
                  if (priceError) setPriceError(cleaned ? "" : "Price is required.");
                }}
                style={[styles.input, priceError ? styles.inputErrorBorder : null]}
                keyboardType="decimal-pad"
              />
              {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.postButton,
                !canSubmit && styles.postButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.postButtonText}>
                {isSubmitting ? (isDraft ? "Publishing..." : "Saving...") : (isDraft ? "Publish Listing" : "Save changes")}
              </Text>
            </Pressable>

            {!isDraft ? (
              <Pressable
                onPress={async () => {
                  const nextActive = !isCurrentlyActive;
                  setIsTogglingActive(true);
                  try {
                    const updatedListing = await updateListing(listing.id, {
                      is_active: nextActive,
                    });
                    setListingState(updatedListing);
                    navigation.navigate("Profile", {
                      refreshKey: updatedListing.updated_at ?? `${Date.now()}`,
                    });
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Failed to update listing";
                    setTimeout(() => Alert.alert("Error", msg), 300);
                  } finally {
                    setIsTogglingActive(false);
                  }
                }}
                disabled={isTogglingActive || isSubmitting}
                style={({ pressed }) => [
                  styles.toggleActiveButton,
                  isCurrentlyActive ? styles.deactivateButton : styles.activateButton,
                  (isTogglingActive || isSubmitting) && styles.postButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.toggleActiveButtonText}>
                  {isTogglingActive
                    ? "Updating..."
                    : isCurrentlyActive
                    ? "Deactivate Listing"
                    : "Activate Listing"}
                </Text>
              </Pressable>
            ) : null}

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

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
          <View style={styles.modalCard}>
            <Pressable
              onPress={handleTakePhoto}
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalOptionText}>Take photo</Text>
            </Pressable>
            <Pressable
              onPress={handlePickFromLibrary}
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalOptionText}>Choose from library</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPickerModal(false)}
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },
  scrollContainer: { flex: 1 },
  pageMax: { width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" },
  topArea: { backgroundColor: "#F6F6F6", paddingHorizontal: 26 },
  goldBar: {
    height: 48,
    backgroundColor: "#ECAA00",
    marginHorizontal: -26,
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  },
  imageUploadLabel: {
    position: "absolute",
    top: 28,
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  uploadPreview: { width: "100%", height: 150, borderRadius: 8 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 15, color: "#8A8A8A", marginBottom: 6 },
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
  postButtonDisabled: { opacity: 0.55 },
  postButtonText: { fontSize: 18, fontWeight: "700", color: "#111111" },
  inputErrorBorder: { borderColor: "#D93025" },
  errorText: { marginTop: 6, fontSize: 12, color: "#D93025" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
    padding: 16,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalOptionText: { fontSize: 16, color: "#111111", textAlign: "center" },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D93025",
    textAlign: "center",
  },
  pressed: { opacity: 0.75 },
  toggleActiveButton: {
    height: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginHorizontal: 60,
  },
  deactivateButton: {
    borderWidth: 1.5,
    borderColor: "#D93025",
  },
  activateButton: {
    borderWidth: 1.5,
    borderColor: "#22C55E",
  },
  toggleActiveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
});;
