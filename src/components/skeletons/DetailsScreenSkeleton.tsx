import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SkeletonText from "../skeletons/SkeletonText";

const MAX_WIDTH = 480;

export default function DetailsScreenSkeleton() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View style={styles.imageSkeleton} />

        <View className="mt-4">
          <SkeletonText width={200} height={38} />
          <View style={styles.headerGap} />
          <SkeletonText width={340} height={18} />
          <View style={styles.subheaderGap} />
          <SkeletonText width={400} height={18} />
        </View>

        <View className="my-3" />
        <View className="h-[2px] w-[100%] bg-gray-300" />

        <View style={styles.section}>
          <SkeletonText width="50%" height={24} />
          <View style={styles.itemGap} />
          <SkeletonText width="40%" height={18} />
        </View>

        <View className="h-[2px] w-[100%] bg-gray-300" />

        <View style={styles.section}>
          <SkeletonText width="40%" height={20} />
          <View style={styles.itemGap} />
          <SkeletonText width="60%" height={20} />
        </View>

        <View className="h-[2px] w-[100%] bg-gray-300" />

        <View style={styles.section}>
          <SkeletonText width="50%" height={20} />
          <View style={styles.itemGap} />
          <SkeletonText width="40%" height={20} />
          <View style={styles.itemGap} />
          <SkeletonText width="20%" height={20} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageSkeleton: {
    backgroundColor: "#b1b1b1",
    width: "100%",
    height: 280,
  },
  headerSection: {
    marginTop: 16,
  },
  headerGap: {
    height: 16,
  },
  subheaderGap: {
    height: 12,
  },
  divider: {
    marginTop: 16,
    height: 1,
    width: "100%",
    backgroundColor: "#c5c5c5",
  },
  section: {
    paddingVertical: 16,
  },
  itemGap: {
    height: 12,
  },
  bannerTop: {
    height: 2,
    width: "100%",
    backgroundColor: "#ECAA00",
  },
  bannerSkeleton: {
    height: 52,
    width: "100%",
    backgroundColor: "#cacaca",
  },
  bannerBottom: {
    height: 2,
    width: "100%",
    backgroundColor: "#ECAA00",
    marginBottom: 8,
  },
  bookingSection: {
    paddingBottom: 24,
  },
});
