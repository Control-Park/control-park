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
    <Pressable style={styles.wrapper} onPress={() => inputRef.current?.focus()}>
      <View style={styles.inner}>
        {/* icon overlay */}
        <Ionicons name="search" size={18} color="#111827" style={styles.icon} />

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

const ICON_PAD = 44; // space reserved for the icon area

const styles = StyleSheet.create({
  wrapper: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  inner: {
    height: "100%",
    justifyContent: "center",
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: 18,
    zIndex: 1,
  },
  text: {
    height: "100%",
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",

    // THIS is what centers the words
    textAlign: "center",

    // Reserve equal-ish space so the centered text doesn't collide with icon
    paddingLeft: ICON_PAD,
    paddingRight: ICON_PAD,
  },
});