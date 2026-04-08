import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function SearchBar({
  placeholder = "Start your search",
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
}: Props) {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<TextInput>(null);
  const textValue = value ?? internalValue;

  const handleChange = (text: string) => {
    onChangeText?.(text);
    if (value === undefined) {
      setInternalValue(text);
    }
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <Pressable style={styles.wrapper} onPress={() => inputRef.current?.focus()}>
      <View style={styles.inner}>
        <Ionicons name="search" size={18} color="#111827" style={styles.icon} />
        <TextInput
        ref={inputRef}
        value={textValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#111827"
        style={styles.text}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
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
    textAlign: "center",
    paddingLeft: ICON_PAD,
    paddingRight: ICON_PAD,
  },
});
