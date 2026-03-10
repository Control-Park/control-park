import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

interface CustomButtonProps {
  title: string;
  color?: string;
  className?: string;
  onPress?: () => void;
  localImg?: any;
  disabled?: any;
}

export default function CustomButton({
  title = "",
  color = "",
  className = "",
  onPress = () => {},
  localImg,
  disabled,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      className={`p-4 rounded-xl ${className}`}
      style={{ backgroundColor: color }}
      onPress={onPress}
      disabled={disabled}
    >
      {localImg && (
        <Image
          source={localImg}
          className="!w-[24px] !h-[24px] mr-2"
          resizeMode="contain"
        ></Image>
      )}
      <Text className="text-black text-md font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
