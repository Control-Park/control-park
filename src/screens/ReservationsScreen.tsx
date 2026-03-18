import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ReservationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reservations Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
});