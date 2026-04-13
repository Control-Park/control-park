import React from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { useNavigation } from "@react-navigation/native";
import { usePaymentMethods } from "../context/paymentMethodsContext";

const MAX_WIDTH = 428;

export default function AddPaymentScreen() {
  const navigation = useNavigation();
  const { addMethod } = usePaymentMethods();

  const handleAdd = () => {
    addMethod({
      brand: "Visa",
      last4: "4242",
      holder: "Minh L.",
      typeLabel: "Card",
    });
    navigation.goBack();
  };


  // TODO: 
  // add camera scanning feature to IOS to display card

  // 

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollOuter}>
        <View style={styles.pageMax}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </Pressable>
            <Text style={styles.headerTitle}>Add Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.sectionLabel}>Accepted</Text>
          <View style={styles.cardLogos}> 
            {[
              require("../../assets/visa-logo.png"),
              require("../../assets/mastercard-logo.png"),
              require("../../assets/discover-logo.jpg"),
              require("../../assets/amex-logo.svg"),
            ].map((src, index) => (
              <View key={index} style={styles.logoWrapper}>
                <Image source={src} style={styles.logoImage} resizeMode="contain" />
              </View>
            ))}
          </View>

          <Pressable style={styles.scanButton}>
            <View style={styles.scanIconWrapper}>
              <Ionicons
                name="scan"
                size={22}
                color="#D4A017"
                style={styles.scanIcon}
              />
              <View style={styles.scanLine} />
            </View>
            <Text style={styles.scanText}>Scan Card</Text>
          </Pressable>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name On Card</Text>
            <TextInput
              style={styles.input}
              placeholder="NAME"
              placeholderTextColor="#D4A017"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX XXXX"
              keyboardType="number-pad"
              placeholderTextColor="#D4A017"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.formGroupHalf, styles.rowSpacing]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#D4A017"
              />
            </View>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Security Code</Text>
              <TextInput
                style={styles.input}
                placeholder="CVV"
                placeholderTextColor="#D4A017"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ZIP / Postal Code</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXXX"
              placeholderTextColor="#D4A017"
            />
          </View>

          <Pressable style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      <Navbar activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollOuter: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    paddingBottom: 10,
  },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D4A017",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111111",
  },
  cardLogos: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  logoImage: {
    width: 80,
    height: 40,
  },
  logoWrapper: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 6,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1.25,
    // borderColor: "#E0C053",
    paddingVertical: 12,
    borderRadius: 10,
    // paddingHorizontal: 16,
    // marginBottom: 4,
  },
  scanText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E0C053",
  },
  scanIconWrapper: {
    // width: 32,
    height: 32,
    // borderWidth: 1,
    borderColor: "#E0C053",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scanIcon: {
    marginBottom: 2,
  },
  scanLine: {
    position: "absolute",
    bottom: 14,
    width: 13,
    height: 2,
    backgroundColor: "#E0C053",
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
    color: "#111111",
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
  bottomSpacer: {
    height: 100,
  },
});
