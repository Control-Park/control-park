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
  const displayPrice = price ?? price_per_hour ?? 0;
  const showOriginalPrice =
    typeof original_price === "number" &&
    original_price > 0 &&
    original_price !== displayPrice;

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
          {showOriginalPrice ? (
            <Text className="font-abeezee text-lg line-through text-[#6A6A6A]">
              ${original_price.toFixed(2)}
            </Text>
          ) : null}
          <Text className="font-abeezee text-lg">
            {showOriginalPrice ? " " : ""}${displayPrice.toFixed(2)}
          </Text>
        </View>
        <Text className="font-abeezee text-md text-[#6A6A6A]">
          per hour
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
