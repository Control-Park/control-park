import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL;

const REPORT_REASONS = [
  ["inappropriate_content", "Inappropriate"],
  ["incorrect_information", "Inaccurate listing"],
  ["scam", "Scam listing (false advertisement)"],
  ["other", "Other"],
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

export default function ReportButton({ listingId }: { listingId: string }) {
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isReportSuccessVisible, setIsReportSuccessVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const openReportFlow = () => {
    setSelectedReportReason(null);
    setSubmitError(null);
    setIsReportSuccessVisible(false);
    setIsReportModalVisible(true);
  };

  const closeReportModal = () => {
    setIsReportModalVisible(false);
    setSelectedReportReason(null);
    setSubmitError(null);
  };

  const submitReport = async () => {
    if (!selectedReportReason) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${BASE_URL}/listings/${listingId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: selectedReportReason[0] }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data?.error ?? "Failed to submit report");
        return;
      }

      setIsReportModalVisible(false);
      setSelectedReportReason(null);
      setIsReportSuccessVisible(true);
      setTimeout(() => setIsReportSuccessVisible(false), 1800);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={openReportFlow}
        hitSlop={10}
        style={styles.button}
        accessibilityLabel="Report"
        className="absolute top-8 right-[72px]"
      >
        <Ionicons name="alert-circle-outline" size={20} color="#111827" />
      </Pressable>

      <Modal
        transparent
        visible={isReportModalVisible}
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <View className="flex-1 items-center justify-center bg-black/35 px-4">
          <Pressable
            className="absolute inset-0"
            onPress={closeReportModal}
            accessibilityLabel="Close report dialog"
          />
          <View className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white">
            <View className="border-b border-[#E5E7EB] px-4 py-3">
              <Text className="font-abeezee text-[13px] text-[#111827]">
                Report Listing
              </Text>
            </View>

            <View className="border-b border-[#E5E7EB] px-4 py-3">
              <Text className="font-abeezee text-[13px] text-[#6B7280]">
                Why are you reporting this listing?
              </Text>
            </View>

            <View>
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReportReason?.[0] === reason[0];

                return (
                  <Pressable
                    key={reason[0]}
                    onPress={() => setSelectedReportReason(reason)}
                    className="border-b border-[#E5E7EB] px-4 py-3"
                    style={{
                      backgroundColor: isSelected ? "#FFF6D8" : "#FFFFFF",
                    }}
                  >
                    <Text
                      className="font-abeezee text-[13px]"
                      style={{ color: isSelected ? "#ECAA00" : "#111827" }}
                    >
                      {reason[1]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {submitError && (
              <View className="border-b border-[#E5E7EB] px-4 py-2">
                <Text className="font-abeezee text-[12px] text-red-500">
                  {submitError}
                </Text>
              </View>
            )}

            <View className="flex-row">
              <Pressable
                onPress={closeReportModal}
                disabled={isSubmitting}
                className="flex-1 items-center justify-center px-4 py-3"
              >
                <Text className="font-abeezee text-[13px] text-[#111827]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={submitReport}
                disabled={!selectedReportReason || isSubmitting}
                className="flex-1 items-center justify-center px-4 py-3"
              >
                <Text
                  className="font-abeezee text-[13px]"
                  style={{
                    color: selectedReportReason && !isSubmitting ? "#111827" : "#9CA3AF",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Report"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isReportSuccessVisible}
        animationType="fade"
        onRequestClose={() => setIsReportSuccessVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/20 px-8">
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsReportSuccessVisible(false)}
            accessibilityLabel="Close report success dialog"
          />
          <View className="w-full max-w-[240px] rounded-2xl border border-[#ECAA00] bg-white px-5 py-4">
            <Text className="text-center font-abeezee text-[14px] text-[#111827]">
              Report Successful
            </Text>
            <Text className="mt-2 text-center font-abeezee text-[13px] text-[#374151]">
              We will review this listing.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
