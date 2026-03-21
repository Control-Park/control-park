import React from "react";
import {
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";

const MAX_WIDTH = 428;

type Props = {
  source: ImageSourcePropType;
  imageWidth: number;
};

export default function ListingImage({ source }: Props) {
  const { width } = useWindowDimensions();
  const imageWidth = Math.min(width, MAX_WIDTH);

 
  return (
      <Image
        source={source}
        style={{ width: "100%", height: imageWidth * 0.75 }}
        resizeMode="cover"
        className="rounded-m w-full"
      />
  );
}
