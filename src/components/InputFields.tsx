import React from "react";
import { View, Text, TextInput } from "react-native";

interface InputFieldsProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  className?: string;
}

export default function InputFields({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  className = ""
}: InputFieldsProps) {
  return (
    <View className={`w-full mb-4 ${className}`}>
      <Text className="text-black mb-1 font-semibold tracking-tight">
        {label}
      </Text>
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}
