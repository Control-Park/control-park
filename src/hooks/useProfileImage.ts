import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { getProfileImageOverrides } from "../utils/localImagePersistence";

export function useProfileImage(userId?: null | string) {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      if (!userId) {
        setProfileImageUri(null);
        return undefined;
      }

      void getProfileImageOverrides().then((overrides) => {
        if (!cancelled) {
          setProfileImageUri(overrides[userId] ?? null);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [userId]),
  );

  return { profileImageUri, setProfileImageUri };
}
