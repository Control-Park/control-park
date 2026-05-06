import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchUserById } from "../api/user";
import { useProfileImage } from "../hooks/useProfileImage";
import { getProfileDisplayName } from "../utils/profile";

type Props = {
  imageUri?: null | string;
  name?: null | string;
  size?: number;
  userId?: null | string;
};

function getInitial(name?: null | string) {
  return (name?.trim()[0] ?? "?").toUpperCase();
}

export default function UserAvatar({
  imageUri,
  name,
  size = 36,
  userId,
}: Props) {
  const { profileImageUri: localProfileImageUri } = useProfileImage(userId);
  const { data: profile } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !imageUri && !!userId,
  });
  const resolvedImageUri =
    imageUri || profile?.profile_image || localProfileImageUri;
  const displayName = name || (profile ? getProfileDisplayName(profile) : null);
  const borderRadius = size / 2;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius }]}>
      {resolvedImageUri ? (
        <Image
          source={{ uri: resolvedImageUri }}
          style={{ width: size, height: size, borderRadius }}
        />
      ) : (
        <Text
          style={[
            styles.initial,
            { fontSize: Math.max(13, Math.round(size * 0.4)) },
          ]}
        >
          {getInitial(displayName)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    fontWeight: "700",
    color: "#111111",
  },
});
