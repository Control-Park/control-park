import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>Hello World</Text>
      </View>
    </SafeAreaView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
});