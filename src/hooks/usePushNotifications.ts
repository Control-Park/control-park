import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import { registerPushToken } from "../api/notifications";
import { supabase } from "../utils/supabase";
import { showNotification } from "../utils/validation";

// Controls how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:9001";
// Convert http(s) to ws(s) for the WebSocket connection
const WS_URL = SERVER_URL.replace(/^http/, "ws");

export function usePushNotifications(queryClient: QueryClient) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    registerToken();

    const connectWebSocket = (accessToken?: string | null) => {
      wsRef.current?.close();
      wsRef.current = null;

      if (!accessToken) {
        return;
      }

      const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            body?: string;
            conversationId?: string;
            title?: string;
            type?: string;
          };

          if (payload.title && payload.body) {
            showNotification(payload.title, payload.body);
          }

          queryClient.invalidateQueries({ queryKey: ["notifications"] });

          if (payload.type === "new_message") {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            if (payload.conversationId) {
              queryClient.invalidateQueries({ queryKey: ["messages", payload.conversationId] });
            }
          }
        } catch {
          console.warn("Failed to parse WebSocket message:", event.data);
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

      wsRef.current = ws;
    };

    // Fires when a notification is received while the app is foregrounded (dev builds)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    // Fires when the user taps a notification (dev builds)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response.notification.request.content.data);
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      connectWebSocket(data.session?.access_token);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      connectWebSocket(session?.access_token);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      subscription.unsubscribe();
      wsRef.current?.close();
    };
  }, [queryClient]);
}

async function registerToken() {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.MAX,
      name: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return;
  }

  let tokenData: Notifications.ExpoPushToken;
  try {
    tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
  } catch (err) {
    // Expo Go SDK 53+ does not support remote push notifications — requires a development build
    console.warn("Push token registration skipped (not supported in this environment):", err);
    return;
  }

  await registerPushToken(tokenData.data);
}
