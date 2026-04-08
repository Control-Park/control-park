import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import ToggleSwitch from "../components/ToggleSwitch";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "NotificationSettings"
>;

const MAX_WIDTH = 428;
const DEFAULT_SETTINGS = {
  newListing: false,
  reservationReminders: false,
  parkingAlerts: false,
  newMessage: false,
};

export default function NotificationSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const allNotificationsEnabled = useMemo(
    () => Object.values(settings).every(Boolean),
    [settings],
  );

  const settingRows = [
    {
      key: "newListing" as const,
      title: "New Listing",
      description:
        "Get notified when new parking spaces are available in your area",
    },
    {
      key: "reservationReminders" as const,
      title: "Reservation Reminders",
      description:
        "Reminders before your parking reservation starts and ends",
    },
    {
      key: "parkingAlerts" as const,
      title: "Parking Alerts",
      description: "Important updates about your parking location or access",
    },
    {
      key: "newMessage" as const,
      title: "New Message",
      description: "Notifications when you receive a new message",
    },
  ];

  const handleToggleAll = (nextValue: boolean) => {
    setSettings({
      newListing: nextValue,
      reservationReminders: nextValue,
      parkingAlerts: nextValue,
      newMessage: nextValue,
    });
  };

  const handleToggleSetting = (
    key: keyof typeof DEFAULT_SETTINGS,
    nextValue: boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={10}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
              </Pressable>

              <NotificationsButton onPress={() => navigation.navigate("Notification")} />
            </View>

            <Text style={styles.title}>Notification Settings</Text>

            <View style={styles.masterRow}>
              <Text style={styles.masterLabel}>Toggle all notifications</Text>
              <ToggleSwitch
                value={allNotificationsEnabled}
                onValueChange={handleToggleAll}
                accessibilityLabel="Toggle all notifications"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingsList}>
              {settingRows.map((setting) => (
                <View key={setting.key} style={styles.settingRow}>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingLabel}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>

                  <ToggleSwitch
                    value={settings[setting.key]}
                    onValueChange={(nextValue) =>
                      handleToggleSetting(setting.key, nextValue)
                    }
                    accessibilityLabel={setting.title}
                  />
                </View>
              ))}
            </View>

            <View style={{ height: 110 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Home" />
        </View>
      </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  pageMax: {
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    flex: 1,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  topRow: {
    height: 44,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "400",
    color: "#111111",
    marginTop: 20,
    marginBottom: 18,
  },
  masterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  masterLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111111",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 10,
  },
  settingsList: {
    paddingTop: 6,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 28,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: "400",
    color: "#111111",
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
});
