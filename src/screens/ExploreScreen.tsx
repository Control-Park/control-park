import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Navbar from "../components/Navbar";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Explore Screen</Text>
      </View>

      <Navbar activeTab="Explore" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
});