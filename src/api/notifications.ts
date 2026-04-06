import client from "./client";

export interface Notification {
  body: string;
  created_at: string;
  id: string;
  is_read: boolean;
  title: string;
  type: "new_listing" | "new_message" | "parking_alert" | "reservation_reminder";
  user_id: string;
}

export interface NotificationSettings {
  all_notifications: boolean;
  created_at: string;
  id: string;
  new_listing: boolean;
  new_message: boolean;
  parking_alerts: boolean;
  reservation_reminders: boolean;
  updated_at: string;
  user_id: string;
}

export const registerPushToken = async (expoPushToken: string): Promise<void> => {
  await client.post("/auth/push-token", { expo_push_token: expoPushToken });
};

export const pushNotification = async (payload: {
  body: string;
  title: string;
  type: Notification["type"];
  user_id: string;
}): Promise<{ message: string } | Notification> => {
  const { data } = await client.post("/notifications", payload);
  return data;
};

export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await client.get("/notifications");
  return data.notifications;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await client.patch(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await client.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  await client.delete("/notifications");
};

export const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
  const { data } = await client.get("/notifications/settings");
  return data;
};

export const updateNotificationSettings = async (
  settings: Partial<Pick<NotificationSettings, "all_notifications" | "new_listing" | "new_message" | "parking_alerts" | "reservation_reminders">>
): Promise<NotificationSettings> => {
  const { data } = await client.patch("/notifications/settings", settings);
  return data;
};
