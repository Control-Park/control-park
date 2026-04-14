import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";

type PersonalInfoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PersonalInfo"
>;

const MAX_WIDTH = 428;

type InfoRowProps = {
  label: string;
  value: string;
  actionText?: string;
  onPress?: () => void;
};

type ModalType =
  | null
  | "legalName"
  | "preferredName"
  | "displayName"
  | "phone"
  | "email"
  | "address"
  | "password";

type DisplayNameOption =
  | "Show my first name only"
  | "Show my last name only"
  | "Show legal name";

type AddressForm = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

function InfoRow({ label, value, actionText = "Edit", onPress }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.rowAction}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation<PersonalInfoScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [legalName, setLegalName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [displayNameOption, setDisplayNameOption] = useState<DisplayNameOption>(
    "Show my first name only"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("example@email.com");

  const [address, setAddress] = useState<AddressForm>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [tempText, setTempText] = useState("");
  const [tempDisplayNameOption, setTempDisplayNameOption] =
    useState<DisplayNameOption>("Show my first name only");
  const [displayDropdownOpen, setDisplayDropdownOpen] = useState(false);

  const [tempAddress, setTempAddress] = useState<AddressForm>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [addressError, setAddressError] = useState("");
  const [genericError, setGenericError] = useState("");

  const addressDisplay = useMemo(() => {
    if (
      !address.line1 &&
      !address.city &&
      !address.state &&
      !address.postalCode &&
      !address.country
    ) {
      return "Not provided";
    }

    const lineTwo = [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(", ");

    return [address.line1, lineTwo, address.country].filter(Boolean).join("\n");
  }, [address]);

  const openTextModal = (type: Exclude<ModalType, null | "displayName" | "address">) => {
    setGenericError("");

    if (type === "legalName") {
      setTempText(legalName);
    } else if (type === "preferredName") {
      setTempText(preferredName);
    } else if (type === "phone") {
      setTempText(phoneNumber);
    } else if (type === "email") {
      setTempText(email);
    } else {
      setTempText("");
    }

    setActiveModal(type);
  };

  const openDisplayNameModal = () => {
    setTempDisplayNameOption(displayNameOption);
    setDisplayDropdownOpen(false);
    setActiveModal("displayName");
  };

  const openAddressModal = () => {
    setTempAddress(address);
    setAddressError("");
    setActiveModal("address");
  };

  const closeModal = () => {
    setActiveModal(null);
    setGenericError("");
    setAddressError("");
    setDisplayDropdownOpen(false);
  };

  const handleConfirmTextModal = () => {
    const trimmed = tempText.trim();

    if (activeModal === "legalName") {
      if (!trimmed) {
        setGenericError("Legal name is required.");
        return;
      }
      setLegalName(trimmed);
    }

    if (activeModal === "preferredName") {
      setPreferredName(trimmed);
    }

    if (activeModal === "phone") {
      setPhoneNumber(trimmed);
    }

    if (activeModal === "email") {
      if (!trimmed) {
        setGenericError("Email is required.");
        return;
      }
      setEmail(trimmed);
    }

    closeModal();
  };

  const handleConfirmDisplayName = () => {
    setDisplayNameOption(tempDisplayNameOption);
    closeModal();
  };

  const handleConfirmAddress = () => {
    const missingFields: string[] = [];

    if (!tempAddress.line1.trim()) missingFields.push("Address Line 1");
    if (!tempAddress.city.trim()) missingFields.push("City / District");
    if (!tempAddress.state.trim()) missingFields.push("State / Province");
    if (!tempAddress.postalCode.trim()) missingFields.push("Postal Code");
    if (!tempAddress.country.trim()) missingFields.push("Country");

    if (missingFields.length > 0) {
      setAddressError(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setAddress({
      line1: tempAddress.line1.trim(),
      line2: tempAddress.line2.trim(),
      city: tempAddress.city.trim(),
      state: tempAddress.state.trim(),
      postalCode: tempAddress.postalCode.trim(),
      country: tempAddress.country.trim(),
    });

    closeModal();
  };

  const renderTextModalTitle = () => {
    switch (activeModal) {
      case "legalName":
        return "Add legal name";
      case "preferredName":
        return "Add preferred name";
      case "phone":
        return "Add phone number";
      case "email":
        return "Add email";
      case "password":
        return "Change password";
      default:
        return "";
    }
  };

  const renderTextModalPlaceholder = () => {
    switch (activeModal) {
      case "legalName":
        return "Enter your name here";
      case "preferredName":
        return "Enter your preferred name here";
      case "phone":
        return "Enter phone number";
      case "email":
        return "Enter email address";
      case "password":
        return "Enter new password";
      default:
        return "";
    }
  };

  const renderActionText = (value: string) => (value ? "Edit" : "Add");

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top + 6 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#111111" />
            </Pressable>

            <Text style={styles.title}>Personal info</Text>

            <View style={styles.list}>
              <InfoRow
                label="Legal name"
                value={legalName || "Not provided"}
                actionText={legalName ? "Edit" : "Add"}
                onPress={() => openTextModal("legalName")}
              />

              <InfoRow
                label="Preferred first name"
                value={preferredName || "Not provided"}
                actionText={renderActionText(preferredName)}
                onPress={() => openTextModal("preferredName")}
              />

              <InfoRow
                label="Host display name for experiences and services"
                value={displayNameOption}
                actionText="Edit"
                onPress={openDisplayNameModal}
              />

              <InfoRow
                label="Phone number"
                value={phoneNumber || "Not provided"}
                actionText={renderActionText(phoneNumber)}
                onPress={() => openTextModal("phone")}
              />

              <InfoRow
                label="Email"
                value={email || "example@email.com"}
                actionText="Edit"
                onPress={() => openTextModal("email")}
              />

              <InfoRow
                label="Address"
                value={addressDisplay}
                actionText={
                  addressDisplay === "Not provided" ? "Add" : "Edit"
                }
                onPress={openAddressModal}
              />

              <InfoRow
                label="Change Password"
                value=""
                actionText="Edit"
                onPress={() => openTextModal("password")}
              />
            </View>

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
        visible={
          activeModal === "legalName" ||
          activeModal === "preferredName" ||
          activeModal === "phone" ||
          activeModal === "email" ||
          activeModal === "password"
        }
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.smallModal}>
            <Text style={styles.smallModalTitle}>{renderTextModalTitle()}</Text>

            <View style={styles.inputWrap}>
              <TextInput
                value={tempText}
                onChangeText={(text) => {
                  setTempText(text);
                  if (genericError) setGenericError("");
                }}
                placeholder={renderTextModalPlaceholder()}
                placeholderTextColor="#9A9A9A"
                style={styles.singleInput}
                secureTextEntry={activeModal === "password"}
              />

              {tempText.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setTempText("")}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={16} color="#8B8B8B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {genericError ? (
              <Text style={styles.errorText}>{genericError}</Text>
            ) : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerDivider]}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleConfirmTextModal}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeModal === "displayName"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.mediumModal}>
            <Text style={styles.displayModalTitle}>
              Host display name for experiences and services
            </Text>

            <TouchableOpacity
              style={styles.dropdownTrigger}
              activeOpacity={0.8}
              onPress={() => setDisplayDropdownOpen((prev) => !prev)}
            >
              <Text style={styles.dropdownTriggerText}>
                {displayDropdownOpen
                  ? "Display name preference"
                  : tempDisplayNameOption}
              </Text>
              <Ionicons
                name={displayDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#7A7A7A"
              />
            </TouchableOpacity>

            {displayDropdownOpen ? (
              <View style={styles.dropdownList}>
                {[
                  "Show my first name only",
                  "Show my last name only",
                  "Show legal name",
                ].map((option, index, arr) => {
                  const isSelected = tempDisplayNameOption === option;
                  const isLast = index === arr.length - 1;
                
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.dropdownItem, isLast && styles.dropdownItemLast]}
                      activeOpacity={0.8}
                      onPress={() => setTempDisplayNameOption(option as DisplayNameOption)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerDivider]}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleConfirmDisplayName}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeModal === "address"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.addressModal}>
            <TouchableOpacity
              style={styles.addressCloseButton}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#555555" />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.addressScrollContent}
            >
              <Text style={styles.addressLabel}>Address Line 1</Text>
              <TextInput
                value={tempAddress.line1}
                onChangeText={(text) => {
                  setTempAddress((prev) => ({ ...prev, line1: text }));
                  if (addressError) setAddressError("");
                }}
                style={styles.addressInput}
                placeholder=""
              />

              <Text style={styles.addressLabel}>Address Line 2</Text>
              <TextInput
                value={tempAddress.line2}
                onChangeText={(text) =>
                  setTempAddress((prev) => ({ ...prev, line2: text }))
                }
                style={styles.addressInput}
                placeholder=""
              />

              <View style={styles.addressGridRow}>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>City / District</Text>
                  <TextInput
                    value={tempAddress.city}
                    onChangeText={(text) => {
                      setTempAddress((prev) => ({ ...prev, city: text }));
                      if (addressError) setAddressError("");
                    }}
                    style={styles.addressInput}
                    placeholder=""
                  />
                </View>

                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>State / Province</Text>
                  <TextInput
                    value={tempAddress.state}
                    onChangeText={(text) => {
                      setTempAddress((prev) => ({ ...prev, state: text }));
                      if (addressError) setAddressError("");
                    }}
                    style={styles.addressInput}
                    placeholder=""
                  />
                </View>
              </View>

              <View style={styles.addressGridRow}>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>Postal Code</Text>
                  <TextInput
                    value={tempAddress.postalCode}
                    onChangeText={(text) => {
                      setTempAddress((prev) => ({
                        ...prev,
                        postalCode: text,
                      }));
                      if (addressError) setAddressError("");
                    }}
                    style={styles.addressInput}
                    placeholder=""
                  />
                </View>

                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>Country</Text>
                  <TextInput
                    value={tempAddress.country}
                    onChangeText={(text) => {
                      setTempAddress((prev) => ({ ...prev, country: text }));
                      if (addressError) setAddressError("");
                    }}
                    style={styles.addressInput}
                    placeholder=""
                  />
                </View>
              </View>

              {addressError ? (
                <Text style={styles.errorText}>{addressError}</Text>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerDivider]}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleConfirmAddress}
                activeOpacity={0.8}
              >
                <Text style={styles.footerButtonText}>Confirm</Text>
              </TouchableOpacity>
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
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 28,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111111",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 26,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: "#E7E7E7",
  },
  row: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 24,
    marginBottom: 6,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6F6F6F",
    lineHeight: 20,
  },
  rowAction: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  smallModal: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  smallModalTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  inputWrap: {
    marginHorizontal: 12,
    marginBottom: 8,
    position: "relative",
  },
  singleInput: {
    height: 32,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 34,
    fontSize: 12,
    color: "#111111",
    backgroundColor: "#FAFAFA",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 8,
  },

  mediumModal: {
    width: "100%",
    maxWidth: 292,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  displayModalTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 14,
  },
  dropdownTrigger: {
    height: 42,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginBottom: 2,
  },
  dropdownTriggerText: {
    fontSize: 13,
    color: "#8A8A8A",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#222222",
  },
  dropdownItemTextSelected: {
    color: "#D59A00",
  },

  addressModal: {
    width: "100%",
    maxWidth: 324,
    maxHeight: "72%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  addressCloseButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
  },
  addressScrollContent: {
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  addressLabel: {
    fontSize: 11,
    color: "#6F6F6F",
    marginBottom: 6,
    marginTop: 10,
  },
  addressInput: {
    height: 38,
    backgroundColor: "#F7F7F7",
    borderRadius: 2,
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  addressGridRow: {
    flexDirection: "row",
    gap: 12,
  },
  addressHalf: {
    flex: 1,
  },

  modalFooter: {
    flexDirection: "row",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
  },
  
  footerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
  },
  
  footerDivider: {
    borderRightWidth: 1,
    borderRightColor: "#ECECEC",
  },
  
  footerButtonText: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#C62828",
    marginHorizontal: 12,
    marginBottom: 4,
    marginTop: 4,
  },
});