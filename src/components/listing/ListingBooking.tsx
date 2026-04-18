import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import CustomButton from "../CustomButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { supabase } from "../../utils/supabase";

type Props = {
  original_price?: number;
  price_per_hour?: number;
  price?: number;
  id?: string;
};

type ReserveNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListingBooking({ original_price, price, id, price_per_hour }: Props) {
  const navigation = useNavigation<ReserveNavigationProp>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View className="flex-row w-full items-center justify-between px-8 py-4">
      <View className="flex-col">
        <View className="flex-row items-center">
          <Text className="font-abeezee text-lg line-through text-[#6A6A6A]">
            $ {original_price}
          </Text>
          <Text className="font-abeezee text-lg"> ${price}</Text>
        </View>
        <Text className="font-abeezee text-md text-[#6A6A6A]">
          For 1 day{"  "}Aug 1
        </Text>
      </View>

      <CustomButton
        title="Reserve"
        color={isAuthenticated ? "#ECAA00" : "#D1D5DB"}
        className="items-center justify-center w-44 h-16 rounded-full font-abeezee"
        onPress={
          isAuthenticated
            ? () => navigation.navigate("Reserve", { id: id ?? "" })
            : undefined
        }
        disabled={!isAuthenticated}
      />
    </View>
  );
}
