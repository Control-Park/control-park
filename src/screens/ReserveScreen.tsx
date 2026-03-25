import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/AppNavigator";
import { allListings } from "../data/mockListings";
import ListingImage from "../components/listing/ListingImage";
import { useWindowDimensions } from "react-native";
import ReportButton from "../components/ReportButton";
import SaveButton from "../components/SaveButton";
import { useFavoritesStore } from "../context/favoritesStore";
import CustomButton from "../components/CustomButton";
import { useVehicleStore } from "../context/vehicleStore";
import { useReservationStore } from "../context/reservationStore";

import { fetchListingById } from "../api/listings";
import { Listing } from "../types/listing";
import { useQuery } from "@tanstack/react-query";
import { getListingImage } from "../utils/listingImages";
import { reserveCancel, reserveSuccess } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "Reserve">;

const MAX_WIDTH = 480;
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const TIME_MINUTES = ["00", "15", "30", "45"];
const TIME_PERIODS = ["AM", "PM"] as const;
const WHEEL_ITEM_HEIGHT = 40;

const createInitialStart = () => {
  const start = new Date();
  start.setHours(20, 0, 0, 0);
  return start;
};

const ensureEndAfterStart = (start: Date, end: Date) => {
  if (end.getTime() > start.getTime()) {
    return end;
  }

  return new Date(start.getTime() + 60 * 60 * 1000);
};

const createInitialEnd = (start: Date) =>
  ensureEndAfterStart(start, new Date(start.getTime() + 60 * 60 * 1000));

const buildCalendarDays = (month: Date) => {
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstVisibleDate = new Date(firstDayOfMonth);
  firstVisibleDate.setDate(
    firstVisibleDate.getDate() - firstDayOfMonth.getDay(),
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDate);
    date.setDate(firstVisibleDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const isDateInRangeExclusive = (date: Date, start: Date, end: Date) => {
  const current = getStartOfDay(date);
  const startTime = getStartOfDay(start);
  const endTime = getStartOfDay(end);

  return current > startTime && current < endTime;
};

const isPastDate = (date: Date) =>
  getStartOfDay(date) < getStartOfDay(new Date());

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long" });

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateRangeLabel = (start: Date, end: Date) => {
  if (isSameDay(start, end)) {
    return formatDateLabel(start);
  }

  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} - ${endLabel}`;
};

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDurationLabel = (start: Date, end: Date) => {
  const totalMinutes = Math.max(
    15,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${minutes} min`;
};

const formatPriceLabel = (price: number) =>
  Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;

const getTimeParts = (date: Date) => {
  const hours = date.getHours();

  return {
    hour: String(hours % 12 || 12),
    minute: String(date.getMinutes()).padStart(2, "0"),
    period: (hours >= 12 ? "PM" : "AM") as (typeof TIME_PERIODS)[number],
  };
};

export default function ReserveScreen({ route, navigation }: Props) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const addReservation = useReservationStore((state) => state.addReservation);
  const { id } = route.params;
  const isFavorited = favorites[id];

  const { width } = useWindowDimensions();
  const { selectedVehicle } = useVehicleStore();
  const initialStart = createInitialStart();
  const initialEnd = createInitialEnd(initialStart);

  const [reservationStart, setReservationStart] = useState(initialStart);
  const [reservationEnd, setReservationEnd] = useState(initialEnd);
  const [draftStart, setDraftStart] = useState(initialStart);
  const [draftEnd, setDraftEnd] = useState(initialEnd);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(initialStart.getFullYear(), initialStart.getMonth(), 1),
  );
  const [activeEditor, setActiveEditor] = useState<"start" | "end">("start");
  const [isDateTimeModalVisible, setIsDateTimeModalVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isReserveConfirmVisible, setIsReserveConfirmVisible] = useState(false);
  const [isReserveSuccessVisible, setIsReserveSuccessVisible] = useState(false);
  const [hasSelectedEndDate, setHasSelectedEndDate] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const hourListRef = useRef<FlatList<string>>(null);
  const minuteListRef = useRef<FlatList<string>>(null);
  const periodListRef = useRef<FlatList<string>>(null);

  const {
    data: listing,
    isLoading,
    isError,
    error,
  } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id),
  });

  const fallbackListing = allListings.find((item) => item.id === id);
  const listingData = listing ?? fallbackListing;
  const hourlyRate = listingData?.price_per_hour ?? 0;
  const durationMinutes = Math.max(
    15,
    Math.round(
      (reservationEnd.getTime() - reservationStart.getTime()) / (1000 * 60),
    ),
  );
  const subtotal = Number(((durationMinutes / 60) * hourlyRate).toFixed(2));
  const reservationDuration = formatDurationLabel(
    reservationStart,
    reservationEnd,
  );
  const reservationDate = formatDateRangeLabel(
    reservationStart,
    reservationEnd,
  );
  const tripTime = `${formatTimeLabel(reservationStart)} - ${formatTimeLabel(
    reservationEnd,
  )}`;
  const calendarDays = buildCalendarDays(calendarMonth);
  const activeDate = activeEditor === "start" ? draftStart : draftEnd;
  const activeTime = getTimeParts(activeDate);

  useEffect(() => {
    if (!isTimePickerVisible) {
      return;
    }

    const hourIndex = TIME_HOURS.indexOf(activeTime.hour);
    const minuteIndex = TIME_MINUTES.indexOf(activeTime.minute);
    const periodIndex = TIME_PERIODS.indexOf(activeTime.period);

    const syncScroll = () => {
      if (hourIndex >= 0) {
        hourListRef.current?.scrollToOffset({
          offset: hourIndex * WHEEL_ITEM_HEIGHT,
          animated: false,
        });
      }

      if (minuteIndex >= 0) {
        minuteListRef.current?.scrollToOffset({
          offset: minuteIndex * WHEEL_ITEM_HEIGHT,
          animated: false,
        });
      }

      if (periodIndex >= 0) {
        periodListRef.current?.scrollToOffset({
          offset: periodIndex * WHEEL_ITEM_HEIGHT,
          animated: false,
        });
      }
    };

    const timeout = setTimeout(syncScroll, 0);
    return () => clearTimeout(timeout);
  }, [
    activeEditor,
    activeTime.hour,
    activeTime.minute,
    activeTime.period,
    isTimePickerVisible,
  ]);

  useEffect(() => {
    if (selectedVehicle) {
      setVehicleError("");
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (!isReserveSuccessVisible) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsReserveSuccessVisible(false);
      navigation.navigate("Reservations");
    }, 1800);

    return () => clearTimeout(timeout);
  }, [isReserveSuccessVisible, navigation]);

  if (isLoading && !fallbackListing) {
    return <Text>Listing not added to API yet...</Text>;
  }

  if (isError && !fallbackListing) {
    return <Text>Error: {(error as Error)?.message}</Text>;
  }

  if (!listingData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-black">Listing not found.</Text>
      </View>
    );
  }

  const openDateTimeModal = () => {
    setDraftStart(reservationStart);
    setDraftEnd(reservationEnd);
    setCalendarMonth(
      new Date(reservationStart.getFullYear(), reservationStart.getMonth(), 1),
    );
    setActiveEditor("start");
    setHasSelectedEndDate(false);
    setIsTimePickerVisible(false);
    setIsDateTimeModalVisible(true);
  };

  const closeDateTimeModal = () => {
    setIsTimePickerVisible(false);
    setIsDateTimeModalVisible(false);
  };

  const updateDraftDate = (selectedDate: Date) => {
    if (isPastDate(selectedDate)) {
      return;
    }

    if (activeEditor === "start") {
      const nextStart = new Date(draftStart);
      nextStart.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );

      const nextEnd = ensureEndAfterStart(nextStart, draftEnd);
      setDraftStart(nextStart);
      setDraftEnd(nextEnd);
      setHasSelectedEndDate(false);
      setActiveEditor("end");
      setIsTimePickerVisible(false);
      return;
    }

    const nextEnd = new Date(draftEnd);
    nextEnd.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    setDraftEnd(ensureEndAfterStart(draftStart, nextEnd));
    setHasSelectedEndDate(true);
  };

  const updateDraftTime = (
    part: "hour" | "minute" | "period",
    value: string,
  ) => {
    const baseDate =
      activeEditor === "start" ? new Date(draftStart) : new Date(draftEnd);
    const nextParts = { ...getTimeParts(baseDate), [part]: value };
    let hourValue = Number(nextParts.hour) % 12;

    if (nextParts.period === "PM") {
      hourValue += 12;
    }

    if (nextParts.period === "AM" && nextParts.hour === "12") {
      hourValue = 0;
    }

    if (nextParts.period === "PM" && nextParts.hour === "12") {
      hourValue = 12;
    }

    baseDate.setHours(hourValue, Number(nextParts.minute), 0, 0);

    if (activeEditor === "start") {
      setDraftStart(baseDate);
      setDraftEnd(ensureEndAfterStart(baseDate, draftEnd));
      return;
    }

    setDraftEnd(ensureEndAfterStart(draftStart, baseDate));
  };

  const handleWheelScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    values: readonly string[],
    part: "hour" | "minute" | "period",
  ) => {
    const rawIndex = Math.round(
      event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT,
    );
    const boundedIndex = Math.max(0, Math.min(values.length - 1, rawIndex));
    updateDraftTime(part, values[boundedIndex]);
  };

  const applyDraftReservation = () => {
    const nextEnd = ensureEndAfterStart(draftStart, draftEnd);
    setReservationStart(draftStart);
    setReservationEnd(nextEnd);
    setDraftEnd(nextEnd);
    setIsTimePickerVisible(false);
    setIsDateTimeModalVisible(false);
  };

  const handleReservePress = () => {
    if (!selectedVehicle) {
      setVehicleError("Please select a vehicle before reserving.");
      return;
    }

    setVehicleError("");
    setIsReserveConfirmVisible(true);
  };

  const handleReserveConfirm = () => {
    addReservation({
      listingId: id,
      reservedFrom: reservationStart.toISOString(),
      reservedUntil: reservationEnd.toISOString(),
    });
    setIsReserveConfirmVisible(false);
    setIsReserveSuccessVisible(true);
    reserveSuccess("Reservation has been made");
  };

  const closeReserveSuccess = () => {
    setIsReserveSuccessVisible(false);
    navigation.navigate("Reservations");
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center" }}>
        <View className="relative">
          <ListingImage
            source={getListingImage(listingData)}
            imageWidth={width}
          />
          <ReportButton listingId={listingData.id} />
          <SaveButton
            onPress={() => toggleFavorite(id)}
            isFavorited={isFavorited}
          />
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            {listingData.title}
          </Text>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            Address details
          </Text>
          <Text className="mt-2 text-[14px] text-[#555555]">
            {listingData.address}
          </Text>
          <Text className="mt-1 text-[13px] text-[#777777]">
            Campus Parking Lot • Multiple Levels • Easy Access
          </Text>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#111111]">
              Reservation details
            </Text>
            <Pressable onPress={openDateTimeModal} hitSlop={10}>
              <Ionicons name="create-outline" size={18} color="#111111" />
            </Pressable>
          </View>

          <View className="mt-3">
            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Duration</Text>
              <Text className="text-[14px] text-[#555555]">
                {reservationDuration}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Date</Text>
              <Text className="text-[14px] text-[#555555]">
                {reservationDate}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-[14px] text-[#555555]">Trip Time</Text>
              <Text className="text-[14px] text-[#555555]">{tripTime}</Text>
            </View>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-[18px] font-bold text-[#111111]">
            Price summary
          </Text>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-[14px] text-[#555555]">Subtotal</Text>
            <Text className="text-[14px] text-[#111111]">
              {formatPriceLabel(subtotal)}
            </Text>
          </View>

          <View className="mt-2 flex-row justify-between">
            <Text className="text-[14px] text-[#555555]">
              {formatPriceLabel(hourlyRate)} x{" "}
              {formatDurationLabel(reservationStart, reservationEnd)}
            </Text>
            <Text className="text-[14px] text-[#555555]">{tripTime}</Text>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row justify-between">
            <Text className="text-[18px] font-bold text-[#111111]">
              Active Vehicle
            </Text>

            <Pressable
              onPress={() => navigation.navigate("VehicleManagement")}
              hitSlop={10}
            >
              <Ionicons name="create-outline" size={18} color="#111111" />
            </Pressable>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              {selectedVehicle ? (
                <>
                  <Text className="text-[14px] text-[#555555]">
                    {selectedVehicle.name}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#8a8a8a]">
                    {selectedVehicle.plate}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-[14px] text-[#555555]">
                    No vehicle selected
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#8a8a8a]">
                    Add or choose a vehicle to continue
                  </Text>
                </>
              )}
            </View>
            
            <View className="h-[72px] w-[110px] items-center justify-center overflow-hidden rounded-md bg-[#F3F4F6]">
              {selectedVehicle ? (
                <Image
                  source={selectedVehicle.image}
                  style={{ width: 120, height: 90 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="car-outline" size={28} color="#9CA3AF" />
              )}
            </View>
          </View>

          <View className="mt-5 items-center justify-center">
            <View className="h-[1px] w-full bg-[#c5c5c5]" />
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] text-[#555555]">Default</Text>

            <View className="flex-row items-center gap-5">
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={16} color="#111111" />
                <Text className="ml-1 text-[12px] text-[#111111]">
                  Add payment
                </Text>
              </View>
              <Ionicons name="add" size={18} color="#111111" />
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="rounded-sm bg-[#1A1F71] px-2 py-1">
                <Text className="text-[10px] font-bold text-white">VISA</Text>
              </View>
              <Text className="ml-3 text-[13px] text-[#555555]">
                Visa...1234
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 pb-6 pt-6">
          {vehicleError ? (
            <Text className="mb-3 text-[13px] text-red-500 text-center">
              {vehicleError}
            </Text>
          ) : null}

          <CustomButton
            title="Reserve"
            color="#ECAA00"
            className="flex items-center justify-center rounded-full font-abeezee"
            onPress={handleReservePress}
          />
        </View>
      </View>

      <Modal
        transparent
        visible={isDateTimeModalVisible}
        animationType="fade"
        onRequestClose={closeDateTimeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/30 px-4">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              if (isTimePickerVisible) {
                setIsTimePickerVisible(false);
                return;
              }

              closeDateTimeModal();
            }}
            accessibilityLabel="Close date and time editor"
          />

          <View className="w-full max-w-[360px] rounded-[24px] bg-white px-4 py-4">
            <View className="flex-row items-center justify-between pb-3">
              <Pressable
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]"
              >
                <Ionicons name="chevron-back" size={16} color="#111111" />
              </Pressable>

              <Text className="font-abeezee text-[22px] text-[#111111]">
                {formatMonthLabel(calendarMonth)}
              </Text>

              <Pressable
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]"
              >
                <Ionicons name="chevron-forward" size={16} color="#111111" />
              </Pressable>
            </View>

            <View className="flex-row gap-3 pb-4">
              <Pressable
                onPress={() => {
                  setActiveEditor("start");
                  setIsTimePickerVisible(false);
                }}
                className="flex-1 rounded-xl border px-3 py-2"
                style={{
                  borderColor: "#ECAA00",
                  backgroundColor: "#FFF8E1",
                }}
              >
                <Text className="font-abeezee text-[11px] text-[#6B7280]">
                  Start
                </Text>
                <Text className="mt-1 font-abeezee text-[13px] text-[#111111]">
                  {formatDateLabel(draftStart)}
                </Text>
                <Pressable
                  onPress={() => {
                    setActiveEditor("start");
                    setIsTimePickerVisible(true);
                  }}
                  className="mt-2 self-start rounded-full bg-[#F3F4F6] px-3 py-1"
                >
                  <Text className="font-abeezee text-[13px] text-[#111111]">
                    {formatTimeLabel(draftStart)}
                  </Text>
                </Pressable>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveEditor("end");
                  setIsTimePickerVisible(false);
                }}
                className="flex-1 rounded-xl border px-3 py-2"
                style={{
                  borderColor:
                    activeEditor === "end" && hasSelectedEndDate
                      ? "#111111"
                      : "#E5E7EB",
                  backgroundColor:
                    activeEditor === "end" && hasSelectedEndDate
                      ? "#111111"
                      : "#FFFFFF",
                }}
              >
                <Text
                  className="font-abeezee text-[11px]"
                  style={{
                    color:
                      activeEditor === "end" && hasSelectedEndDate
                        ? "#D1D5DB"
                        : "#6B7280",
                  }}
                >
                  End
                </Text>
                <Text
                  className="mt-1 font-abeezee text-[13px]"
                  style={{
                    color:
                      activeEditor === "end" && hasSelectedEndDate
                        ? "#FFFFFF"
                        : "#111111",
                  }}
                >
                  {formatDateLabel(draftEnd)}
                </Text>
                <Pressable
                  onPress={() => {
                    setActiveEditor("end");
                    setIsTimePickerVisible(true);
                  }}
                  className="mt-2 self-start rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      activeEditor === "end" && hasSelectedEndDate
                        ? "#2C2C2E"
                        : "#F3F4F6",
                  }}
                >
                  <Text
                    className="font-abeezee text-[13px]"
                    style={{
                      color:
                        activeEditor === "end" && hasSelectedEndDate
                          ? "#FFFFFF"
                          : "#111111",
                    }}
                  >
                    {formatTimeLabel(draftEnd)}
                  </Text>
                </Pressable>
              </Pressable>
            </View>

            <View
              className="flex-row self-center pb-1"
              style={{ width: 7 * 36 }}
            >
              {WEEKDAY_LABELS.map((label) => (
                <Text
                  key={label}
                  className="text-center font-abeezee text-[12px] text-[#9CA3AF]"
                  style={{ width: 36 }}
                >
                  {label}
                </Text>
              ))}
            </View>

            <View
              className="flex-row flex-wrap self-center"
              style={{ width: 7 * 36 }}
            >
              {calendarDays.map(({ date, isCurrentMonth }) => {
                const isPast = isPastDate(date);
                const isStartDate = isSameDay(date, draftStart);
                const isEndDate =
                  hasSelectedEndDate && isSameDay(date, draftEnd);
                const isInRange =
                  hasSelectedEndDate &&
                  isDateInRangeExclusive(date, draftStart, draftEnd);

                let backgroundColor = "transparent";
                let textColor = isCurrentMonth ? "#111111" : "#111111";
                let borderRadius = 999;

                if (isPast) {
                  textColor = "#D1D5DB";
                }

                if (!isPast && isInRange) {
                  backgroundColor = "#E5E7EB";
                  textColor = "#111111";
                  borderRadius = 10;
                }

                if (!isPast && isStartDate) {
                  backgroundColor = "#ECAA00";
                  textColor = "#111111";
                  borderRadius = 999;
                }

                if (!isPast && isEndDate) {
                  backgroundColor = "#111111";
                  textColor = "#FFFFFF";
                  borderRadius = 999;
                }

                return (
                  <Pressable
                    key={date.toISOString()}
                    onPress={() => {
                      if (!isPast) {
                        updateDraftDate(date);
                      }
                    }}
                    disabled={isPast}
                    className="mb-1 items-center justify-center"
                    style={{
                      width: 36,
                      opacity: isPast ? 0.45 : 1,
                    }}
                  >
                    <View
                      className="h-8 w-8 items-center justify-center"
                      style={{
                        backgroundColor,
                        borderRadius,
                      }}
                    >
                      <Text
                        className="font-abeezee text-[12px]"
                        style={{ color: textColor }}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row justify-between pt-4">
              <Pressable
                onPress={closeDateTimeModal}
                className="rounded-full px-4 py-2"
              >
                <Text className="font-abeezee text-[13px] text-[#111111]">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={applyDraftReservation}
                className="rounded-full bg-[#ECAA00] px-5 py-2"
              >
                <Text className="font-abeezee text-[13px] text-[#111111]">
                  Apply
                </Text>
              </Pressable>
            </View>

            {isTimePickerVisible && (
              <View className="absolute inset-0 items-center justify-center bg-black/35">
                <Pressable
                  className="absolute inset-0"
                  onPress={() => setIsTimePickerVisible(false)}
                  accessibilityLabel="Close time picker"
                />
                <View className="w-[300px] rounded-[28px] bg-[#2C2C2E] px-4 py-4">
                  <View className="flex-row items-center justify-between border-b border-[#3A3A3C] pb-3">
                    <Text className="font-abeezee text-[20px] text-white">
                      Time
                    </Text>
                    <Pressable
                      onPress={() => setIsTimePickerVisible(false)}
                      className="rounded-full bg-[#3A3A3C] px-4 py-2"
                    >
                      <Text className="font-abeezee text-[18px] text-[#0A84FF]">
                        {formatTimeLabel(activeDate)}
                      </Text>
                    </Pressable>
                  </View>

                  <View className="mt-4 items-center overflow-hidden rounded-[24px] bg-[#1C1C1E]">
                    {Platform.OS === "web" ? (
                      <View className="w-[260px] px-4 py-4">
                        <View className="flex-row justify-center gap-3">
                          {[
                            {
                              key: "hour",
                              values: TIME_HOURS,
                              selected: activeTime.hour,
                            },
                            {
                              key: "minute",
                              values: TIME_MINUTES,
                              selected: activeTime.minute,
                            },
                            {
                              key: "period",
                              values: [...TIME_PERIODS],
                              selected: activeTime.period,
                            },
                          ].map((column) => (
                            <View key={column.key} className="items-center">
                              <View className="gap-2">
                                {column.values.map((item) => {
                                  const isSelected = item === column.selected;

                                  return (
                                    <Pressable
                                      key={`${column.key}-${item}`}
                                      onPress={() =>
                                        updateDraftTime(
                                          column.key as
                                            | "hour"
                                            | "minute"
                                            | "period",
                                          item,
                                        )
                                      }
                                      className="min-w-[64px] rounded-xl px-4 py-2"
                                      style={{
                                        backgroundColor: isSelected
                                          ? "#3A3A3C"
                                          : "transparent",
                                      }}
                                    >
                                      <Text
                                        className="text-center font-abeezee text-[18px]"
                                        style={{
                                          color: isSelected
                                            ? "#FFFFFF"
                                            : "#7C7C80",
                                        }}
                                      >
                                        {item}
                                      </Text>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View className="h-[190px] w-[260px] flex-row items-center justify-center">
                        <View className="absolute left-4 right-4 top-[75px] h-[40px] rounded-2xl bg-[#3A3A3C]" />

                        {[
                          {
                            key: "hour",
                            values: TIME_HOURS,
                            selected: activeTime.hour,
                            listRef: hourListRef,
                          },
                          {
                            key: "minute",
                            values: TIME_MINUTES,
                            selected: activeTime.minute,
                            listRef: minuteListRef,
                          },
                          {
                            key: "period",
                            values: [...TIME_PERIODS],
                            selected: activeTime.period,
                            listRef: periodListRef,
                          },
                        ].map((column) => (
                          <FlatList
                            key={column.key}
                            ref={column.listRef}
                            data={column.values}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            snapToInterval={WHEEL_ITEM_HEIGHT}
                            decelerationRate="fast"
                            getItemLayout={(_, index) => ({
                              length: WHEEL_ITEM_HEIGHT,
                              offset: WHEEL_ITEM_HEIGHT * index,
                              index,
                            })}
                            contentContainerStyle={{
                              paddingVertical: 75,
                              paddingHorizontal:
                                column.key === "period" ? 8 : 0,
                            }}
                            style={{ width: column.key === "period" ? 72 : 60 }}
                            keyExtractor={(item) => `${column.key}-${item}`}
                            renderItem={({ item }) => {
                              const isSelected = item === column.selected;

                              return (
                                <View
                                  style={{ height: WHEEL_ITEM_HEIGHT }}
                                  className="items-center justify-center"
                                >
                                  <Text
                                    className="font-abeezee text-[18px]"
                                    style={{
                                      color: isSelected ? "#FFFFFF" : "#7C7C80",
                                    }}
                                  >
                                    {item}
                                  </Text>
                                </View>
                              );
                            }}
                            onMomentumScrollEnd={(event) =>
                              handleWheelScrollEnd(
                                event,
                                column.values,
                                column.key as "hour" | "minute" | "period",
                              )
                            }
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isReserveConfirmVisible}
        animationType="fade"
        onRequestClose={() => setIsReserveConfirmVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/30 px-6">
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsReserveConfirmVisible(false)}
            accessibilityLabel="Close reserve confirmation"
          />
          <View className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-white">
            <View className="border-b border-[#E5E7EB] px-5 py-4">
              <Text className="text-center font-abeezee text-[14px] text-[#111111]">
                Confirm Reservation
              </Text>
            </View>

            <View className="px-5 py-4">
              <Text className="text-center font-abeezee text-[13px] text-[#555555]">
                Do you want to confirm this spot?
              </Text>
            </View>

            <View className="flex-row border-t border-[#E5E7EB]">
              <Pressable
                onPress={() => {
                  setIsReserveConfirmVisible(false);
                  reserveCancel("Reservation has been canceled.");
                }}
                className="flex-1 items-center justify-center py-3"
              >
                <Text className="font-abeezee text-[13px] text-[#111111]">
                  No
                </Text>
              </Pressable>

              <Pressable
                onPress={handleReserveConfirm}
                className="flex-1 items-center justify-center border-l border-[#E5E7EB] py-3"
              >
                <Text className="font-abeezee text-[13px] text-[#111111]">
                  Yes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isReserveSuccessVisible}
        animationType="fade"
        onRequestClose={closeReserveSuccess}
      >
        <View className="flex-1 items-center justify-center bg-black/20 px-8">
          <Pressable
            className="absolute inset-0"
            onPress={closeReserveSuccess}
            accessibilityLabel="Close reservation success message"
          />
          <View className="w-full max-w-[220px] rounded-2xl bg-white px-5 py-4">
            <Text className="text-center font-abeezee text-[14px] text-[#111111]">
              Successful!
            </Text>
            <Text className="mt-2 text-center font-abeezee text-[13px] text-[#555555]">
              Thank you for reserving this listing
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
