import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import { supabase } from "../utils/supabase";
import {
  getMyProfile,
  updateMyProfile,
  requestEmailChange,
  verifyCurrentEmail,
  verifyNewEmail,
  requestPasswordChange,
  changePassword,
  UserProfile,
} from "../api/user";

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
  | "emailCurrentOtp"
  | "emailNewOtp"
  | "address"
  | "password"
  | "passwordOtp";

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

function profileToDisplayName(profile: UserProfile): DisplayNameOption {
  const dn = profile.host_display_name ?? "";
  if (dn === "last") return "Show my last name only";
  if (dn === "legal") return "Show legal name";
  return "Show my first name only";
}

function displayNameToKey(opt: DisplayNameOption): string {
  if (opt === "Show my last name only") return "last";
  if (opt === "Show legal name") return "legal";
  return "first";
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation<PersonalInfoScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);

  // temp state for modals
  const [tempText, setTempText] = useState("");
  const [tempDisplayNameOption, setTempDisplayNameOption] = useState<DisplayNameOption>("Show my first name only");
  const [displayDropdownOpen, setDisplayDropdownOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState<AddressForm>({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "" });

  // email change flow
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  // password change flow
  const [pendingNewPassword, setPendingNewPassword] = useState("");

  const [addressError, setAddressError] = useState("");
  const [genericError, setGenericError] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setLoadingProfile(false); return; }
      void getMyProfile().then((p) => {
        setProfile(p);
        setLoadingProfile(false);
      }).catch(() => setLoadingProfile(false));
    });
  }, []);

  const legalName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "";
  const preferredName = profile?.preferred_name ?? "";
  const phoneNumber = profile?.phone ?? "";
  const email = profile?.email ?? "";
  const displayNameOption: DisplayNameOption = profile ? profileToDisplayName(profile) : "Show my first name only";

  const address: AddressForm = {
    city: profile?.address_city ?? "",
    country: profile?.address_country ?? "",
    line1: profile?.address_line1 ?? "",
    line2: profile?.address_line2 ?? "",
    postalCode: profile?.address_postal_code ?? "",
    state: profile?.address_state ?? "",
  };

  const addressDisplay = useMemo(() => {
    if (!address.line1 && !address.city && !address.state && !address.postalCode && !address.country) {
      return "Not provided";
    }
    const lineTwo = [address.city, address.state, address.postalCode].filter(Boolean).join(", ");
    return [address.line1, lineTwo, address.country].filter(Boolean).join("\n");
  }, [address]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setGenericError("");
    setAddressError("");
    setDisplayDropdownOpen(false);
    setOtpValue("");
  }, []);

  const openTextModal = (type: Exclude<ModalType, null | "displayName" | "address" | "emailCurrentOtp" | "emailNewOtp" | "passwordOtp">) => {
    setGenericError("");
    if (type === "legalName") setTempText(legalName);
    else if (type === "preferredName") setTempText(preferredName);
    else if (type === "phone") setTempText(phoneNumber);
    else if (type === "email") setTempText(email);
    else setTempText("");
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

  const handleConfirmLegalName = async () => {
    const trimmed = tempText.trim();
    if (!trimmed) { setGenericError("Legal name is required."); return; }
    const parts = trimmed.split(" ");
    const first_name = parts[0];
    const last_name = parts.slice(1).join(" ") || parts[0];
    setSaving(true);
    try {
      const updated = await updateMyProfile({ first_name, last_name });
      setProfile(updated);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPreferredName = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({ preferred_name: tempText.trim() || null });
      setProfile(updated);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPhone = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({ phone: tempText.trim() || null });
      setProfile(updated);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestEmailChange = async () => {
    const trimmed = tempText.trim();
    if (!trimmed) { setGenericError("Email is required."); return; }
    setSaving(true);
    try {
      await requestEmailChange(trimmed);
      setPendingEmail(trimmed);
      setOtpValue("");
      setGenericError("");
      setActiveModal("emailCurrentOtp");
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyCurrentEmailOtp = async () => {
    if (otpValue.length !== 6) { setGenericError("Enter the 6-digit code."); return; }
    setSaving(true);
    try {
      await verifyCurrentEmail(otpValue);
      setOtpValue("");
      setGenericError("");
      setActiveModal("emailNewOtp");
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyNewEmailOtp = async () => {
    if (otpValue.length !== 6) { setGenericError("Enter the 6-digit code."); return; }
    setSaving(true);
    try {
      await verifyNewEmail(otpValue);
      setProfile((prev) => prev ? { ...prev, email: pendingEmail } : prev);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPassword = async () => {
    if (!tempText.trim()) { setGenericError("Password is required."); return; }
    if (!profile?.email) { setGenericError("No email on account."); return; }
    setSaving(true);
    try {
      await requestPasswordChange(profile.email);
      setPendingNewPassword(tempText.trim());
      setOtpValue("");
      setGenericError("");
      setActiveModal("passwordOtp");
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPasswordOtp = async () => {
    if (otpValue.length !== 6) { setGenericError("Enter the 6-digit code."); return; }
    if (!profile?.email) return;
    setSaving(true);
    try {
      await changePassword(profile.email, otpValue, pendingNewPassword);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDisplayName = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({ host_display_name: displayNameToKey(tempDisplayNameOption) });
      setProfile(updated);
      closeModal();
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAddress = async () => {
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

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        address_city: tempAddress.city.trim(),
        address_country: tempAddress.country.trim(),
        address_line1: tempAddress.line1.trim(),
        address_line2: tempAddress.line2.trim() || null,
        address_postal_code: tempAddress.postalCode.trim(),
        address_state: tempAddress.state.trim(),
      });
      setProfile(updated);
      closeModal();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmTextModal = () => {
    if (activeModal === "legalName") void handleConfirmLegalName();
    else if (activeModal === "preferredName") void handleConfirmPreferredName();
    else if (activeModal === "phone") void handleConfirmPhone();
    else if (activeModal === "email") void handleRequestEmailChange();
    else if (activeModal === "password") void handleConfirmPassword();
  };

  const renderTextModalTitle = () => {
    switch (activeModal) {
      case "legalName": return "Edit legal name";
      case "preferredName": return "Edit preferred name";
      case "phone": return "Edit phone number";
      case "email": return "Edit email";
      case "password": return "Change password";
      default: return "";
    }
  };

  const renderTextModalPlaceholder = () => {
    switch (activeModal) {
      case "legalName": return "Enter your full name";
      case "preferredName": return "Enter your preferred name";
      case "phone": return "Enter phone number";
      case "email": return "Enter new email address";
      case "password": return "Enter new password";
      default: return "";
    }
  };

  const renderActionText = (value: string) => (value ? "Edit" : "Add");

  if (loadingProfile) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top + 6 }]}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
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
                value={email}
                actionText="Edit"
                onPress={() => openTextModal("email")}
              />
              <InfoRow
                label="Address"
                value={addressDisplay}
                actionText={addressDisplay === "Not provided" ? "Add" : "Edit"}
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

      {/* Text / password / email modals */}
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
                onChangeText={(text) => { setTempText(text); if (genericError) setGenericError(""); }}
                placeholder={renderTextModalPlaceholder()}
                placeholderTextColor="#9A9A9A"
                style={styles.singleInput}
                secureTextEntry={activeModal === "password"}
                autoCapitalize={activeModal === "email" || activeModal === "password" ? "none" : "words"}
                keyboardType={activeModal === "email" ? "email-address" : activeModal === "phone" ? "phone-pad" : "default"}
              />
              {tempText.length > 0 ? (
                <TouchableOpacity onPress={() => setTempText("")} style={styles.clearButton} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={16} color="#8B8B8B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {genericError ? <Text style={styles.errorText}>{genericError}</Text> : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={handleConfirmTextModal} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Step 2: verify current email OTP */}
      <Modal visible={activeModal === "emailCurrentOtp"} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.smallModal}>
            <Text style={styles.smallModalTitle}>Confirm your identity</Text>
            <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to your current email{"\n"}{profile?.email}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={otpValue}
                onChangeText={(text) => { setOtpValue(text.replace(/\D/g, "").slice(0, 6)); if (genericError) setGenericError(""); }}
                placeholder="000000"
                placeholderTextColor="#9A9A9A"
                style={[styles.singleInput, { letterSpacing: 4, textAlign: "center" }]}
                keyboardType="number-pad"
              />
            </View>
            {genericError ? <Text style={styles.errorText}>{genericError}</Text> : null}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => void handleVerifyCurrentEmailOtp()} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Step 3: verify new email OTP */}
      <Modal visible={activeModal === "emailNewOtp"} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.smallModal}>
            <Text style={styles.smallModalTitle}>Verify new email</Text>
            <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to{"\n"}{pendingEmail}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={otpValue}
                onChangeText={(text) => { setOtpValue(text.replace(/\D/g, "").slice(0, 6)); if (genericError) setGenericError(""); }}
                placeholder="000000"
                placeholderTextColor="#9A9A9A"
                style={[styles.singleInput, { letterSpacing: 4, textAlign: "center" }]}
                keyboardType="number-pad"
              />
            </View>
            {genericError ? <Text style={styles.errorText}>{genericError}</Text> : null}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => void handleVerifyNewEmailOtp()} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password OTP verification modal */}
      <Modal
        visible={activeModal === "passwordOtp"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.smallModal}>
            <Text style={styles.smallModalTitle}>Verify password change</Text>
            <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to{"\n"}{profile?.email}</Text>

            <View style={styles.inputWrap}>
              <TextInput
                value={otpValue}
                onChangeText={(text) => { setOtpValue(text.replace(/\D/g, "").slice(0, 6)); if (genericError) setGenericError(""); }}
                placeholder="000000"
                placeholderTextColor="#9A9A9A"
                style={[styles.singleInput, { letterSpacing: 4, textAlign: "center" }]}
                keyboardType="number-pad"
              />
            </View>

            {genericError ? <Text style={styles.errorText}>{genericError}</Text> : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => void handleConfirmPasswordOtp()} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Display name modal */}
      <Modal visible={activeModal === "displayName"} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.mediumModal}>
            <Text style={styles.displayModalTitle}>Host display name for experiences and services</Text>

            <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.8} onPress={() => setDisplayDropdownOpen((prev) => !prev)}>
              <Text style={styles.dropdownTriggerText}>{displayDropdownOpen ? "Display name preference" : tempDisplayNameOption}</Text>
              <Ionicons name={displayDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#7A7A7A" />
            </TouchableOpacity>

            {displayDropdownOpen ? (
              <View style={styles.dropdownList}>
                {(["Show my first name only", "Show my last name only", "Show legal name"] as DisplayNameOption[]).map((option, index, arr) => {
                  const isSelected = tempDisplayNameOption === option;
                  const isLast = index === arr.length - 1;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.dropdownItem, isLast && styles.dropdownItemLast]}
                      activeOpacity={0.8}
                      onPress={() => setTempDisplayNameOption(option)}
                    >
                      <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => void handleConfirmDisplayName()} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Address modal */}
      <Modal visible={activeModal === "address"} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.addressModal}>
            <TouchableOpacity style={styles.addressCloseButton} onPress={closeModal} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#555555" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.addressScrollContent}>
              <Text style={styles.addressLabel}>Address Line 1</Text>
              <TextInput value={tempAddress.line1} onChangeText={(text) => { setTempAddress((prev) => ({ ...prev, line1: text })); if (addressError) setAddressError(""); }} style={styles.addressInput} />

              <Text style={styles.addressLabel}>Address Line 2</Text>
              <TextInput value={tempAddress.line2} onChangeText={(text) => setTempAddress((prev) => ({ ...prev, line2: text }))} style={styles.addressInput} />

              <View style={styles.addressGridRow}>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>City / District</Text>
                  <TextInput value={tempAddress.city} onChangeText={(text) => { setTempAddress((prev) => ({ ...prev, city: text })); if (addressError) setAddressError(""); }} style={styles.addressInput} />
                </View>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>State / Province</Text>
                  <TextInput value={tempAddress.state} onChangeText={(text) => { setTempAddress((prev) => ({ ...prev, state: text })); if (addressError) setAddressError(""); }} style={styles.addressInput} />
                </View>
              </View>

              <View style={styles.addressGridRow}>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>Postal Code</Text>
                  <TextInput value={tempAddress.postalCode} onChangeText={(text) => { setTempAddress((prev) => ({ ...prev, postalCode: text })); if (addressError) setAddressError(""); }} style={styles.addressInput} keyboardType="number-pad" />
                </View>
                <View style={styles.addressHalf}>
                  <Text style={styles.addressLabel}>Country</Text>
                  <TextInput value={tempAddress.country} onChangeText={(text) => { setTempAddress((prev) => ({ ...prev, country: text })); if (addressError) setAddressError(""); }} style={styles.addressInput} />
                </View>
              </View>

              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.footerButton, styles.footerDivider]} onPress={closeModal} activeOpacity={0.8} disabled={saving}>
                <Text style={styles.footerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => void handleConfirmAddress()} activeOpacity={0.8} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#111" /> : <Text style={styles.footerButtonText}>Confirm</Text>}
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
  otpSubtitle: {
    fontSize: 11,
    color: "#6F6F6F",
    textAlign: "center",
    marginBottom: 12,
    marginHorizontal: 12,
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
