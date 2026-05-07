import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import { apiBaseUrl } from "../api/client";
import { fetchConversations, type ConversationSummary } from "../api/messages";
import {
  fetchNotifications,
  registerPushToken,
  type Notification as InAppNotification,
} from "../api/notifications";
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
const NOTIFICATION_POLL_MS = 5000;
const RECENT_SOCKET_EVENT_MS = 10000;

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
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const recentSocketEventsRef = useRef<Map<string, number>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    registerToken();

    const rememberSocketEvent = (payload: NotificationPayload) => {
      recentSocketEventsRef.current.set(getNotificationSignature(payload), Date.now());
    };

    const stopNotificationPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const pollNotifications = async (showNewToasts: boolean) => {
      try {
        const notifications = await fetchNotifications();
        queryClient.setQueryData(["notifications"], notifications);

        const unseen = notifications
          .filter((notification) => !seenNotificationIdsRef.current.has(notification.id))
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );

        notifications.forEach((notification) => {
          seenNotificationIdsRef.current.add(notification.id);
        });

        if (!showNewToasts) {
          return;
        }

        for (const notification of unseen) {
          if (notification.is_read) {
            continue;
          }

          const payload = toPayload(notification);
          const signature = getNotificationSignature(payload);
          const socketEventAt = recentSocketEventsRef.current.get(signature);

          if (socketEventAt && Date.now() - socketEventAt < RECENT_SOCKET_EVENT_MS) {
            continue;
          }

          const formatted = formatNotificationContent(payload);
          showNotification(formatted.title, formatted.body, {
            ctaLabel: payload.type === "new_message" ? "Open chat" : "Open",
            onPress: () => {
              void handleNotificationPress(queryClient, payload);
            },
          });

          if (payload.type === "new_message") {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === "messages",
            });
          }

          if (isReservationNotification(payload) || isBookingRequestNotification(payload)) {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["hosting-reservations"] });
            queryClient.invalidateQueries({ queryKey: ["my-reservations-view-profile"] });
          }
        }
      } catch {
        stopNotificationPolling();
      }
    };

    const startNotificationPolling = (accessToken?: string | null) => {
      stopNotificationPolling();
      seenNotificationIdsRef.current = new Set();

      if (!accessToken) {
        return;
      }

      void pollNotifications(false);
      pollIntervalRef.current = setInterval(() => {
        void pollNotifications(true);
      }, NOTIFICATION_POLL_MS);
    };

    const connectWebSocket = (accessToken?: string | null) => {
      wsRef.current?.close();
      wsRef.current = null;

      if (!accessToken) {
        return;
      }

      const ws = new WebSocket(`${WS_URL}?token=${accessToken}`);

      ws.onopen = () => {
        stopNotificationPolling();
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as NotificationPayload;

          if (payload.title && payload.body) {
            rememberSocketEvent(payload);
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
            } else {
              queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === "messages",
              });
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

      ws.onclose = () => {
        if (wsRef.current === ws) {
          startNotificationPolling(accessToken);
        }
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
      stopNotificationPolling();
      wsRef.current?.close();
    };
  }, [queryClient]);
}

function getNotificationSignature(payload: NotificationPayload) {
  return [payload.type ?? "", payload.title ?? "", payload.body ?? ""].join("|");
}

function toPayload(notification: InAppNotification): NotificationPayload {
  return {
    body: notification.body,
    title: notification.title,
    type: notification.type,
  };
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
    let conversations: ConversationSummary[] | undefined;

    if (payload.conversationId) {
      conversations = queryClient.getQueryData<ConversationSummary[]>(["conversations"]);
    }

    if (!conversations || !payload.conversationId) {
      try {
        conversations = await queryClient.fetchQuery({
          queryKey: ["conversations"],
          queryFn: fetchConversations,
          staleTime: 0,
        });
      } catch {
        conversations = undefined;
      }
    }

    const conversation = payload.conversationId
      ? conversations?.find(
        (item) => item.id === payload.conversationId,
      )
      : await findConversationFromNotification(conversations, payload);

    if (conversation) {
      await openConversation(conversation);
      return;
    }

    navigate("Message");
    return;
  }

  navigate("Notification");
}

async function findConversationFromNotification(
  conversations: ConversationSummary[] | undefined,
  payload: NotificationPayload,
) {
  if (!conversations?.length) {
    return undefined;
  }

  const senderName = payload.title?.replace(/^New message from\s+/i, "").trim().toLowerCase();
  const body = payload.body?.trim();

  return conversations.find((conversation) => {
    if (body && conversation.last_message?.body !== body) {
      return false;
    }

    if (!senderName) {
      return true;
    }

    const participantNames = [conversation.guest, conversation.host]
      .filter(Boolean)
      .map((user) => `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim().toLowerCase());

    return participantNames.includes(senderName);
  });
}

async function openConversation(conversation: ConversationSummary) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUserId = session?.user.id;
  const isHost = currentUserId === conversation.host_id;
  const otherPerson = isHost ? conversation.guest : conversation.host;
  const otherName = otherPerson
    ? `${otherPerson.first_name} ${otherPerson.last_name}`.trim()
    : isHost ? "Guest" : "Host";

  push("Conversation", {
    conversationId: conversation.id,
    hostId: conversation.host_id,
    hostName: otherName,
    listingId: conversation.listing_id,
    listingTitle: conversation.listing?.title,
  });
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
