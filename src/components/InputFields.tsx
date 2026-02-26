import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import showIcon from "../../assets/show.png";
import hideIcon from "../../assets/hide.png";

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
  className = "",
}: InputFieldsProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View className={`w-full mb-4 ${className}`}>
      <Text className="text-black mb-1 font-semibold tracking-tight">
        {label}
      </Text>
      <TextInput
        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-[#ECAA00]"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
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
