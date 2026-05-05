import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import { apiBaseUrl } from "../api/client";
import { fetchConversations, type ConversationSummary } from "../api/messages";
import { registerPushToken } from "../api/notifications";
import {
  navigate,
  navigationRef,
  push,
  refreshRoute,
} from "../navigation/navigationRef";
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

const SERVER_URL = apiBaseUrl;
// Convert http(s) to ws(s) for the WebSocket connection
const WS_URL = SERVER_URL.replace(/^http/, "ws");

type NotificationPayload = {
  body?: string;
  conversationId?: string;
  kind?: string;
  listingId?: string;
  reservationId?: string;
  senderId?: string;
  title?: string;
  type?: string;
};

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
          const payload = JSON.parse(event.data as string) as NotificationPayload;

          if (payload.title && payload.body) {
            const formatted = formatNotificationContent(payload);
            showNotification(formatted.title, formatted.body, {
              ctaLabel: payload.type === "new_message" ? "Open chat" : "Open",
              onPress: () => {
                void handleNotificationPress(queryClient, payload);
              },
            });
          }

          queryClient.invalidateQueries({ queryKey: ["notifications"] });

          if (payload.type === "new_message") {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            if (payload.conversationId) {
              queryClient.invalidateQueries({ queryKey: ["messages", payload.conversationId] });
            }
          }

          if (isReservationNotification(payload)) {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["hosting-reservations"] });
            queryClient.invalidateQueries({ queryKey: ["my-reservations-view-profile"] });
            if (payload.reservationId) {
              queryClient.invalidateQueries({
                queryKey: ["reservation-for-host", payload.reservationId],
              });
            }

            if (navigationRef.getCurrentRoute()?.name === "Reservations") {
              refreshRoute("Reservations", { refreshKey: new Date().toISOString() });
            }
          }

          if (isBookingRequestNotification(payload)) {
            if (navigationRef.getCurrentRoute()?.name === "Profile") {
              refreshRoute("Profile", { refreshKey: new Date().toISOString() });
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
        const data = response.notification.request.content.data as NotificationPayload;
        void handleNotificationPress(queryClient, data);
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

function formatNotificationContent(payload: NotificationPayload) {
  if (isReservationNotification(payload)) {
    return {
      body: payload.body ?? "",
      title: payload.title ?? "Reservation update",
    };
  }

  if (isBookingRequestNotification(payload)) {
    return {
      body: payload.body ?? "",
      title: "New booking request",
    };
  }

  if (payload.type !== "new_message") {
    return {
      body: payload.body ?? "",
      title: payload.title ?? "Notification",
    };
  }

  const senderName = payload.title?.replace(/^New message from\s+/i, "").trim();
  return {
    title: "New message",
    body: senderName ? `${senderName}: ${payload.body ?? ""}` : payload.body ?? "",
  };
}

async function handleNotificationPress(
  queryClient: QueryClient,
  payload: NotificationPayload,
) {
  if (isReservationNotification(payload)) {
    refreshRoute("Reservations", { refreshKey: new Date().toISOString() });
    return;
  }

  if (isBookingRequestNotification(payload)) {
    refreshRoute("Profile", { refreshKey: new Date().toISOString() });
    return;
  }

  if (payload.type === "new_message") {
    if (payload.conversationId) {
      let conversations =
        queryClient.getQueryData<ConversationSummary[]>(["conversations"]);

      if (!conversations) {
        try {
          conversations = await queryClient.fetchQuery({
            queryKey: ["conversations"],
            queryFn: fetchConversations,
          });
        } catch {
          conversations = undefined;
        }
      }

      const conversation = conversations?.find(
        (item) => item.id === payload.conversationId,
      );

      if (conversation) {
        const hostName = conversation.host
          ? `${conversation.host.first_name} ${conversation.host.last_name}`.trim()
          : undefined;

        push("Conversation", {
          conversationId: conversation.id,
          hostId: conversation.host_id,
          hostName,
          listingId: conversation.listing_id,
          listingTitle: conversation.listing?.title,
        });
        return;
      }
    }

    navigate("Message");
    return;
  }

  navigate("Notification");
}

function isBookingRequestNotification(payload: NotificationPayload) {
  return (
    payload.kind === "booking_request" ||
    (payload.type === "parking_alert" &&
      payload.title?.trim().toLowerCase() === "new booking request")
  );
}

function isReservationNotification(payload: NotificationPayload) {
  return (
    payload.kind === "reservation_approved" ||
    payload.kind === "reservation_rejected" ||
    (payload.type === "parking_alert" &&
      (payload.title?.trim().toLowerCase() === "booking approved" ||
        payload.title?.trim().toLowerCase() === "booking rejected"))
  );
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
