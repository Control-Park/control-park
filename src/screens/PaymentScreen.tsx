import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../components/Navbar";
import { useNavigation } from "@react-navigation/native";

export default function PaymentScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>

        <Text style={styles.title}>Payment Methods</Text>

        {/* Spacer to balance header */}
        <View style={{ width: 24 }} />
      </View>

      {/* Empty State */}
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No Payment Found</Text>
        <Text style={styles.subText}>
          You can add and edit payments during checkout
        </Text>

        <Pressable style={styles.addButton}>
          <Ionicons name="add" size={28} color="#111" />
          <Text style={styles.addText}>Add Payment Method</Text>
        </Pressable>
      </View>

      {/* Bottom Navbar */}
      <Navbar activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4A017", // gold tone from your Figma
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },

  subText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 40,
  },

  addButton: {
    width: "100%",
    backgroundColor: "#F4B400",
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});