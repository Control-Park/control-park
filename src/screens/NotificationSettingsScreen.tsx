import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import NotificationsButton from "../components/NotificationsButton";
import Navbar from "../components/Navbar";
import ToggleSwitch from "../components/ToggleSwitch";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  fetchNotificationSettings,
  NotificationSettings,
  updateNotificationSettings,
} from "../api/notifications";

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

type ScreenSettings = typeof DEFAULT_SETTINGS;

const mapApiSettingsToScreen = (
  settings: Pick<
    NotificationSettings,
    "new_listing" | "reservation_reminders" | "parking_alerts" | "new_message"
  >,
): ScreenSettings => ({
  newListing: settings.new_listing,
  reservationReminders: settings.reservation_reminders,
  parkingAlerts: settings.parking_alerts,
  newMessage: settings.new_message,
});

export default function NotificationSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: notificationSettings,
    isLoading,
    isError,
    error,
  } = useQuery<NotificationSettings>({
    queryKey: ["notification-settings"],
    queryFn: fetchNotificationSettings,
  });

  useEffect(() => {
    if (notificationSettings) {
      setSettings(mapApiSettingsToScreen(notificationSettings));
    }
  }, [notificationSettings]);

  const allNotificationsEnabled = useMemo(
    () => Object.values(settings).every(Boolean),
    [settings],
  );

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (nextSettings: NotificationSettings) => {
      setSaveError(null);
      setSettings(mapApiSettingsToScreen(nextSettings));
      queryClient.setQueryData(["notification-settings"], nextSettings);
    },
    onError: (mutationError: unknown) => {
      setSaveError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save notification settings.",
      );

      if (notificationSettings) {
        setSettings(mapApiSettingsToScreen(notificationSettings));
      }
    },
  });

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

  const persistSettings = (nextSettings: ScreenSettings) => {
    setSaveError(null);
    setSettings(nextSettings);

    saveSettings({
      all_notifications: Object.values(nextSettings).every(Boolean),
      new_listing: nextSettings.newListing,
      new_message: nextSettings.newMessage,
      parking_alerts: nextSettings.parkingAlerts,
      reservation_reminders: nextSettings.reservationReminders,
    });
  };

  const handleToggleAll = (nextValue: boolean) => {
    persistSettings({
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
    persistSettings({
      ...settings,
      [key]: nextValue,
    });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.feedbackWrap}>
          <ActivityIndicator size="small" color="#111111" />
          <Text style={styles.feedbackText}>
            Loading notification settings...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.feedbackWrap}>
          <Text style={styles.feedbackTitle}>
            Unable to load notification settings
          </Text>
          <Text style={styles.feedbackText}>
            {(error as Error)?.message || "Something went wrong."}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.masterRow}>
          <Text style={styles.masterLabel}>Toggle all notifications</Text>
          <ToggleSwitch
            value={allNotificationsEnabled}
            onValueChange={handleToggleAll}
            disabled={isSaving}
            accessibilityLabel="Toggle all notifications"
          />
        </View>

        <View style={styles.divider} />

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        {isSaving ? <Text style={styles.savingText}>Saving...</Text> : null}

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
                disabled={isSaving}
                accessibilityLabel={setting.title}
              />
            </View>
          ))}
        </View>
      </>
    );
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

              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            <Text style={styles.title}>Notification Settings</Text>

            {renderBody()}

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
  feedbackWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    paddingHorizontal: 28,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 10,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
    textAlign: "center",
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
  savingText: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#D14343",
    marginBottom: 10,
    lineHeight: 18,
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
