import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  showSavedSuccess,
  showSavedRemove,
  showSignInRequired,
} from "../utils/validation";
import { saveListing, unsaveListing } from "../api/listings";
import { supabase } from "../utils/supabase";

type Props = {
  listingId: string;
  isFavorited?: boolean;
  onToggleState?: (nextIsFavorited: boolean) => void;
};

export default function SaveButton({
  listingId,
  isFavorited,
  onToggleState,
}: Props) {
  const queryClient = useQueryClient();

  const handlePress = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      showSignInRequired();
      return;
    }

    const nextIsFavorited = !isFavorited;
    onToggleState?.(nextIsFavorited);

    try {
      if (isFavorited) {
        await unsaveListing(listingId);
        showSavedRemove("Removed from saved listings");
      } else {
        await saveListing(listingId);
        showSavedSuccess("Added to your saved listings");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
        queryClient.invalidateQueries({ queryKey: ["listing", listingId] }),
      ]);
    } catch (err) {
      onToggleState?.(!!isFavorited);
      console.error("Failed to update saved listing:", err);
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      style={styles.button}
      accessibilityLabel="Save"
      className="absolute top-8 right-6"
    >
      <Ionicons
        name={isFavorited ? "heart" : "heart-outline"}
        size={20}
        color={isFavorited ? "#EF4444" : "#111827"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
