import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CustomButtonProps {
  title: string;
  color?: string;
  className?: string;
  onPress?: () => void;
  localImg?: any;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  color = "#ECAA00",
  className = "",
  onPress,
  localImg,
  disabled = false,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      className={`p-4 rounded-xl flex-row items-center justify-center ${className}`}
      style={{ backgroundColor: color }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {localImg && (
        <Image
          source={localImg}
          style={{ width: 20, height: 20, marginRight: 8 }}
          resizeMode="contain"
        />
      )}

      <Text className="text-black text-md font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
