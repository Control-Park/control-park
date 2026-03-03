import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import NotificationsButton from "../components/NotificationsButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <NotificationsButton onPress={() => console.log("Notifications")} />

      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <SearchBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});