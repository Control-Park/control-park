import React, { useMemo, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { usePaymentMethods } from "../context/paymentMethodsContext";
import { createStripePaymentMethod, savePaymentMethod } from "../api/payments";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationsButton from "../components/NotificationsButton";
import {
  formatCardNumber,
  formatExpiry,
  isValidExpiryDate,
  sanitizeCardNumber,
  sanitizeCvv,
  sanitizeExpiry,
  sanitizePostal,
  showFieldError,
} from "../utils/validation";

const MAX_WIDTH = 428;
type PaymentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Payment"
>;
const CARD_BRANDS = [
    { name: "Visa", regex: /^4/, logo: require("../../assets/visa-logo.png") },
    {
      name: "MasterCard",
      regex: /^5[1-5]/,
      logo: require("../../assets/mastercard-logo.png"),
    },
    {
      name: "Discover",
      regex: /^(6011|65|64[4-9])/,
      logo: require("../../assets/discover-logo.jpg"),
    },
    {
      name: "American Express",
      regex: /^3[47]/,
      logo: require("../../assets/amex-logo.svg"),
    },
  ];

export default function PaymentScreen() {
  const navigation = useNavigation<PaymentNavigationProp>();
  const insets = useSafeAreaInsets();
  const {
    defaultPaymentMethodId,
    methods,
    removeMethod,
    refreshMethods,
    setDefaultPaymentMethod,
  } = usePaymentMethods();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [postal, setPostal] = useState("");

  const sanitizedCard = useMemo(() => sanitizeCardNumber(cardNumber), [cardNumber]);
  const getBrand = (digits: string) => {
    if (!digits) return "Card";
    const found = CARD_BRANDS.find(({ regex }) => regex.test(digits));
    return found ? found.name : "Card";
  };
  const detectedBrand = useMemo(() => getBrand(sanitizedCard), [sanitizedCard]);
  const getLogoForBrand = (brandName: string) =>
    CARD_BRANDS.find(({ name }) => name === brandName)?.logo;
  const pendingRemovalMethod = methods.find(method => method.id === pendingRemovalId) ?? null;

  const handleAdd = async () => {
    const digits = sanitizeCardNumber(cardNumber);
    if (!name.trim()) {
      showFieldError("name", "Please enter the cardholder's name.");
      return;
    }
    if (digits.length !== 16) {
      showFieldError("card number", "Card number must be 16 digits long.");
      return;
    }
    const formattedExpiry = formatExpiry(expiry);
    if (!isValidExpiryDate(formattedExpiry)) {
      showFieldError("expiry date", "Enter a valid MM/YY.");
      return;
    }
    const cvvDigits = sanitizeCvv(cvv);
    if (![3, 4].includes(cvvDigits.length)) {
      showFieldError("security code", "CVV must be 3 or 4 digits.");
      return;
    }

    const [expMonth, expYear] = formattedExpiry.split("/");

    setSubmitting(true);
    try {
      const paymentMethodId = await createStripePaymentMethod({
        cvc: cvvDigits,
        exp_month: expMonth,
        exp_year: expYear,
        holder_name: name.trim(),
        number: digits,
      });

      await savePaymentMethod({
        holder_name: name.trim(),
        payment_method_id: paymentMethodId,
      });

      await refreshMethods();

      setShowForm(false);
      setName("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setPostal("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add card";
      showFieldError("card", message);
    } finally {
      setSubmitting(false);
    }
  };

  const openRemoveModal = (methodId: string) => {
    setPendingRemovalId(methodId);
  };

  const closeRemoveModal = () => {
    setPendingRemovalId(null);
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemovalMethod) {
      return;
    }

    await removeMethod(pendingRemovalMethod.id);
    closeRemoveModal();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateWrapper}>
      <Text style={styles.emptyTitle}>No Payment Found</Text>
      <Text style={styles.emptySubtitle} className="mb-10">You can add and edit payments during checkout</Text>
      <Pressable style={styles.addVehicleCard} onPress={() => setShowForm(true)}>
        <View style={styles.plusCircle}>
          <Ionicons name="add" size={28} color="#111" />
        </View>
        <Text style={styles.addVehicleText}>Add Payment Method</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}> 
      <View style={styles.pageMax}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.title}>Payment Methods</Text>
          <NotificationsButton
            onPress={() => navigation.navigate("Notification")}
          />
        </View>

        {!showForm && methods.length === 0 && renderEmptyState()}

        {!showForm && methods.length > 0 && (
          <View style={styles.listSection}>
            {methods.map(method => (
              <View
                key={method.id}
                style={[
                  styles.methodRow,
                  method.id === defaultPaymentMethodId && styles.defaultMethodRow,
                ]}
              >
                <Pressable
                  style={styles.rowContent}
                  onPress={() => {
                    void setDefaultPaymentMethod(method.id);
                  }}
                >
                  <View style={styles.rowLogo}>
                    <Image
                      source={getLogoForBrand(method.brand) ?? CARD_BRANDS[0].logo}
                      style={styles.rowLogoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={styles.methodBrand}>{method.brand}</Text>
                    <Text style={styles.methodNumber}>**** {method.last4}</Text>
                    {method.id === defaultPaymentMethodId ? (
                      <Text style={styles.defaultMethodText}>Default payment method</Text>
                    ) : null}
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => openRemoveModal(method.id)}
                  hitSlop={10}
                >
                  <Ionicons name="chevron-forward" size={20} color="#111" />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addRow} onPress={() => setShowForm(true)}>
              <Text style={styles.addRowText}>Add Payment Method</Text>
            </Pressable>
          </View>
        )}

        {showForm && (
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.sectionLabel}>Accepted</Text>
            <View style={styles.cardLogos}>
              {CARD_BRANDS.map((brand, index) => (
                <View
                  key={index}
                  style={[
                    styles.logoWrapper,
                    detectedBrand === brand.name && styles.activeLogo,
                  ]}
                >
                  <Image source={brand.logo} style={styles.logoImage} resizeMode="contain" />
                </View>
              ))}
            </View>

            <Pressable style={styles.scanButton}>
              <View style={styles.scanIconWrapper}>
                <Ionicons name="scan" size={22} color="#D4A017" />
                <View style={styles.scanLine} />
              </View>
              <Text style={styles.scanText}>Scan Card</Text>
            </Pressable>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name On Card</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="NAME"
                placeholderTextColor="#D4A017"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                value={formatCardNumber(cardNumber)}
                onChangeText={value => setCardNumber(sanitizeCardNumber(value))}
                style={styles.input}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                keyboardType="number-pad"
                placeholderTextColor="#D4A017"
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.formGroupHalf, styles.rowSpacing]}>
                <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    value={formatExpiry(expiry)}
                    onChangeText={value => setExpiry(sanitizeExpiry(value))}
                    style={styles.input}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    placeholderTextColor="#D4A017"
                  />
              </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Security Code</Text>
              <TextInput
                value={cvv}
                onChangeText={value => setCvv(sanitizeCvv(value))}
                style={styles.input}
                placeholder="CVV"
                keyboardType="number-pad"
                placeholderTextColor="#D4A017"
              />
            </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>ZIP / Postal Code</Text>
              <TextInput
                value={postal}
                onChangeText={value => setPostal(sanitizePostal(value))}
                style={styles.input}
                placeholder="XXXXX"
                keyboardType="number-pad"
                placeholderTextColor="#D4A017"
              />
            </View>

            <Pressable style={styles.addButton} onPress={() => { void handleAdd(); }} disabled={submitting}>
              <Text style={styles.addButtonText}>{submitting ? "Adding..." : "Add"}</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      <View style={styles.navbarWrapper}>
        <View style={styles.pageMax}>
          <Navbar activeTab="Home" />
        </View>
      </View>

      <Modal
        visible={pendingRemovalMethod !== null}
        transparent
        animationType="fade"
        onRequestClose={closeRemoveModal}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Remove Payment Method?</Text>
            <Text style={styles.confirmMessage}>
              {pendingRemovalMethod
                ? `${pendingRemovalMethod.brand} ending in **** ${pendingRemovalMethod.last4} will be removed from your account.`
                : ""}
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={closeRemoveModal}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonBorder,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void handleConfirmRemove();
                }}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4A017",
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 200,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  addVehicleCard: {
    width: "100%",
    maxWidth: 260,
    minHeight: 160,
    borderRadius: 8,
    backgroundColor: "#F4B400",
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
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  addVehicleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  listSection: {
    marginTop: 24,
    gap: 8,
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
  },
  defaultMethodRow: {
    borderColor: "#ECAA00",
    borderWidth: 1.5,
    backgroundColor: "#FFF8E1",
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: "600",
  },
  methodNumber: {
    fontSize: 14,
    color: "#D4A017",
  },
  defaultMethodText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  rowLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 22,
    backgroundColor: "#fff",
  },
  rowLogoImage: {
    width: 36,
    height: 24,
  },
  addRow: {
    marginTop: 24,
    alignItems: "flex-start",
  },
  addRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D4A017",
  },
  formContainer: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  cardLogos: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  logoWrapper: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 6,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  activeLogo: {
    borderColor: "#ECAA00",
    shadowColor: "#ECAA00",
    shadowOpacity: 0.45,
  },
  logoImage: {
    width: 80,
    height: 40,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  scanIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -1 }],
    width: 16,
    height: 2,
    backgroundColor: "#D4A017",
  },
  scanText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E0C053",
  },
  formGroup: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowSpacing: {
    marginRight: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#111",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1.75,
    borderColor: "#222",
    borderRadius: 0,
    height: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: "#FAFAFA",
    fontWeight: "500",
  },
  addButton: {
    marginTop: 8,
    backgroundColor: "#F4B400",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  confirmTitle: {
    paddingTop: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },
  confirmMessage: {
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 24,
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    textAlign: "center",
  },
  confirmActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonBorder: {
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#D4A017",
  },
  removeText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#D97706",
  },
  pressed: {
    opacity: 0.75,
  },
});
