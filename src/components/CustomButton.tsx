import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface CustomButtonProps {
  title: string;
  color?: string;
  className?: string;
  onPress?: () => void;
}

export default function CustomButton({
  title = "",
  color = "",
  className = "",
  onPress = () => {},
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      className={`p-4 rounded-xl ${className}`}
      style={{ backgroundColor: color }}
      onPress={onPress}
    >
      <Text className="text-black text-md font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
