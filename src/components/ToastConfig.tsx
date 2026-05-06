import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

type NotificationToastProps = {
  props?: {
    ctaLabel?: string;
    onPress?: () => void;
  };
  text1?: string;
  text2?: string;
};

function NotificationToast({
  props,
  text1,
  text2,
}: NotificationToastProps) {
  const closeToast = () => {
    Toast.hide();
  };

  const handlePress = () => {
    closeToast();
    props?.onPress?.();
  };

  return (
    <Pressable
      onLongPress={closeToast}
      onPress={handlePress}
      onPressOut={closeToast}
      disabled={!props?.onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        pressed && props?.onPress ? styles.notificationPressed : null,
      ]}
    >
      <View style={styles.notificationIconWrap}>
        <Ionicons name="chatbubble-ellipses" size={18} color="#111111" />
      </View>

      <View style={styles.notificationContent}>
        <Text selectable={false} style={styles.notificationTitle} numberOfLines={1}>
          {text1}
        </Text>

        {text2 ? (
          <Text selectable={false} style={styles.notificationBody} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}

        {props?.onPress ? (
          <Text selectable={false} style={styles.notificationCta}>
            {props.ctaLabel ?? "Tap to open"}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const toastConfig: ToastConfig = {
  success: (toastProps) => (
    <BaseToast
      {...toastProps}
      style={styles.successToast}
      contentContainerStyle={styles.baseContent}
      text1Style={styles.successTitle}
      text2Style={styles.successBody}
    />
  ),
  error: (toastProps) => (
    <ErrorToast
      {...toastProps}
      style={styles.errorToast}
      contentContainerStyle={styles.baseContent}
      text1Style={styles.errorTitle}
      text2Style={styles.errorBody}
    />
  ),
  notification: (toastProps) => <NotificationToast {...toastProps} />,
};

const styles = StyleSheet.create({
  baseContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  successToast: {
    minHeight: 74,
    width: "92%",
    maxWidth: 460,
    borderLeftWidth: 5,
    borderLeftColor: "#22C55E",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  successTitle: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },
  successBody: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
  },
  errorToast: {
    minHeight: 74,
    width: "92%",
    maxWidth: 460,
    borderLeftWidth: 5,
    borderLeftColor: "#EF4444",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },
  errorBody: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 18,
  },
  notificationCard: {
    width: "92%",
    maxWidth: 460,
    minHeight: 86,
    borderRadius: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  notificationPressed: {
    opacity: 0.9,
  },
  notificationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  notificationBody: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
  },
  notificationCta: {
    color: "#FDE68A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});
