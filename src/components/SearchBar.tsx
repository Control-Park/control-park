import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  placeholder?: string;
};

export default function SearchBar({ placeholder = "Start your search" }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => inputRef.current?.focus()}
    >
      <View style={styles.centerRow}>
        <Ionicons name="search" size={18} color="#111827" />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#111827"
          style={styles.text}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
    minWidth: 120,
  },
});