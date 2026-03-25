import React from "react";
import { DimensionValue, StyleSheet, View } from "react-native";

type Props = {
  width: DimensionValue;
  height: DimensionValue;
};

export default function SkeletonText({ width, height }: Props) {
  return <View style={[styles.skeleton, { width, height }]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#b1b1b1",
    alignSelf: "center",
  },
});
