import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import showIcon from "../../assets/show.png";
import hideIcon from "../../assets/hide.png";
import { formatDate, formatPhoneNumber } from "../utils/validation";

interface InputFieldsProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  className?: string;
  hasError?: boolean;
}

export default function InputFields({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  className = "",
  hasError = false,
}: InputFieldsProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleTextChange = (text: string) => {
    // Format date if this is a birth date field
    if (label.includes("Birth date")) {
      const formatted = formatDate(text);
      onChangeText?.(formatted);
    } else if (label.includes("Phone Number")) {
      const formatted = formatPhoneNumber(text);
      onChangeText?.(formatted);
    } else {
      onChangeText?.(text);
    }
  };

  const borderColor = hasError ? "border-red-500" : "border-gray-300";

  return (
    <View className={`w-full mb-4 ${className}`}>
      <Text className="text-black mb-1 font-semibold tracking-tight">
        {label}
      </Text>
      <TextInput
        className={`w-full p-4 border-2 ${borderColor} rounded-xl focus:border-[#ECAA00]`}
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChange}
        secureTextEntry={secureTextEntry ? !passwordVisible : false}
      ></TextInput>

      {/* load icon only if true */}
      {secureTextEntry && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            // source={localImg}
            source={passwordVisible ? showIcon : hideIcon}
            className="!w-[24px] !h-[24px] mr-2 absolute right-2 bottom-3.5 "
            resizeMode="contain"
          ></Image>
        </TouchableOpacity>
      )}
    </View>
  );
}
