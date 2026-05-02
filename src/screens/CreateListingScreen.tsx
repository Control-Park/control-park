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
import { createNewListing, saveListingAsDraft } from "../api/listings";
import type { Listing } from "../types/listing";
import { supabase } from "../utils/supabase";
import { normalizePickedImage } from "../utils/localImagePersistence";

import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type Props = NativeStackScreenProps<RootStackParamList, "CreateListing">;

const MAX_WIDTH = 428;

export default function CreateListingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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
      !!pricePerDay.trim() &&
      !isSubmitting
    );
  }, [
    imageUri,
    title,
    description,
    address,
    campusLot,
    access,
    pricePerDay,
    isSubmitting,
  ]);

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
      quality: 0.7,
      base64: true,
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
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(normalizePickedImage(result.assets[0]));
      setImageError("");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      console.log("session user:", session?.user);
  
      if (!session?.user) {
        Alert.alert("Not signed in", "Please sign in and try again.");
        return;
      }
  
      const perksArray = perks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  
      const incentivesArray = incentives
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  
      const payload: Partial<Listing> = {
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        structure_name: campusLot.trim(),
  
        // Swagger strongly suggests this is a category, not free text
        parking_type: "Structure",
  
        // Keep using your entered price for now
        price_per_hour: Number(pricePerDay),
  
        amenities: [],
        perks: perksArray,
        incentives: incentivesArray,
  
        // Backend says images are stored as file path strings
        images: imageUri ? [imageUri] : [],
  
        available_from: new Date().toISOString(),
        available_until: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
  
        sub_heading: access.trim() ? [access.trim()] : [],
  
        // These may be optional, but sending safe defaults can help
        is_guest_favorite: false,
        is_popular: false,
        original_price: Number(pricePerDay),
        rating: 0,
        review_count: 0,
        is_active: true,
      };
  
      console.log("create listing payload:", payload);
  
      const created = await createNewListing(payload);
  
      console.log("created listing response:", created);
  
      navigation.replace("Details", { id: created.id });
    } catch (error: any) {
      console.error("Create listing failed:", error);
      console.error("Create listing failed response:", error?.response?.data);
  
      Alert.alert(
        "Failed to create listing",
        error?.response?.data?.message ||
          error?.message ||
          "Please check your input and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    let hasError = false;
    if (!title.trim()) {
      setTitleError("Title is required.");
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError("Description is required.");
      hasError = true;
    }
    if (hasError) return;
    setIsSavingDraft(true);
    try {
      const perksArray = perks.split(",").map((s) => s.trim()).filter(Boolean);
      const incentivesArray = incentives.split(",").map((s) => s.trim()).filter(Boolean);
      await saveListingAsDraft({
        title: title.trim(),
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        structure_name: campusLot.trim() || undefined,
        price_per_hour: pricePerDay ? Number(pricePerDay) : undefined,
        perks: perksArray,
        incentives: incentivesArray,
        images: imageUri ? [imageUri] : [],
        sub_heading: access.trim() ? [access.trim()] : [],
      });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      Alert.alert("Error", msg);
    } finally {
      setIsSavingDraft(false);
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
            <View style={styles.goldBar}>
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
            </View>

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
                  if (titleError) {
                    setTitleError(text.trim() ? "" : "Title is required.");
                  }
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
                    setDescriptionError(
                      text.trim() ? "" : "Description is required.",
                    );
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
                  if (addressError) {
                    setAddressError(text.trim() ? "" : "Address is required.");
                  }
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
                    setCampusLotError(text.trim() ? "" : "Campus lot is required.");
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
                  if (accessError) {
                    setAccessError(
                      text.trim() ? "" : "Access details are required.",
                    );
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
              <Text style={styles.inputLabel}>Price per day*</Text>
              <TextInput
                value={pricePerDay}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, "");
                  setPricePerDay(cleaned);
                  if (priceError) {
                    setPriceError(cleaned ? "" : "Price is required.");
                  }
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
                {isSubmitting ? "Posting..." : "Post"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              style={({ pressed }) => [
                styles.draftButton,
                (isSavingDraft || isSubmitting) && styles.postButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.draftButtonText}>
                {isSavingDraft ? "Saving..." : "Save as Draft"}
              </Text>
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
    maxWidth: MAX_WIDTH,
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
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
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
  draftButton: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginHorizontal: 60,
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555555",
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
