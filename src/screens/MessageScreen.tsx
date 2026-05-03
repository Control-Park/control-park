import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import NotificationsButton from "../components/NotificationsButton";
import { fetchConversations, ConversationSummary } from "../api/messages";
import { supabase } from "../utils/supabase";

const MAX_WIDTH = 428;

type Props = NativeStackScreenProps<RootStackParamList, "Message">;

function toImageSource(image: unknown) {
  return typeof image === "string" ? { uri: image } : image;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return date.toLocaleDateString();
}

export default function MessageScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const listingId = route.params?.listingId;
  const hostName = route.params?.hostName;
  const listingImage = route.params?.listingImage;
  const listingTitle = route.params?.listingTitle;
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery<ConversationSummary[]>({
    queryFn: fetchConversations,
    queryKey: ["conversations"],
  });
  const visibleConversations = conversations.filter((conv) => conv.last_message);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  // If navigated from Details with a listingId + hostName, redirect to Conversation
  // without creating a thread until the first message is sent.
  useEffect(() => {
    if (!listingId) return;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      // We need the host's user id — passed via route.params when available
      // If hostId is not in params we can't auto-create; fall through to the list
      const params = route.params as (typeof route.params) & { hostId?: string };
      if (!params?.hostId) return;

      navigation.replace("Conversation", {
        hostId: params.hostId,
        hostName,
        listingId,
        listingImage,
        listingTitle,
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderConversation = (conv: ConversationSummary) => {
    const isHost = currentUserId === conv.host_id;
    const otherPerson = isHost ? conv.guest : conv.host;
    const otherName = otherPerson
      ? `${otherPerson.first_name} ${otherPerson.last_name}`
      : isHost ? "Guest" : "Host";
    const listingTitle = conv.listing?.title ?? `Listing ${conv.listing_id.slice(0, 8)}`;
    const listingImage =
      Array.isArray(conv.listing?.images) && conv.listing.images.length > 0
        ? toImageSource(conv.listing.images[0])
        : undefined;
    const preview = conv.last_message?.body ?? "No messages yet";
    const timestamp = conv.last_message ? formatTimestamp(conv.last_message.created_at) : "";

    return (
      <Pressable
        key={conv.id}
        style={({ pressed }) => [styles.conversationRow, pressed && styles.pressed]}
        onPress={() =>
          navigation.navigate("Conversation", {
            conversationId: conv.id,
            hostId: conv.host_id,
            hostName: otherName,
            listingId: conv.listing_id,
            listingImage,
            listingTitle,
          })
        }
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color="#666666" />
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationTopRow}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {otherName}
            </Text>
            {timestamp ? (
              <Text style={styles.conversationTimestamp}>{timestamp}</Text>
            ) : null}
          </View>
          <Text style={styles.conversationListing} numberOfLines={1}>
            {listingTitle}
          </Text>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {preview}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageMax}>
          <View style={[styles.topArea, { paddingTop: insets.top }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={20} color="#111111" />
              </Pressable>

              <NotificationsButton
                onPress={() => navigation.navigate("Notification")}
              />
            </View>

            <Text style={styles.title}>Messages</Text>

            <View style={styles.divider} />

            {isLoading && (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color="#ECAA00" />
              </View>
            )}

            {!isLoading && visibleConversations.length === 0 && (
              <View style={styles.emptyStateWrapper}>
                <Text style={styles.emptyTitle}>No new messages</Text>
                <Text style={styles.emptySubtitle}>
                  Message a host to ask about availability
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("Home")}
                  style={({ pressed }) => [
                    styles.getStartedButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.getStartedButtonText}>Get started</Text>
                </Pressable>
              </View>
            )}

            {!isLoading && visibleConversations.length > 0 && (
              <View style={styles.conversationList}>
                {visibleConversations.map(renderConversation)}
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContent}>
          <Navbar activeTab="Messages" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  topArea: {
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    height: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
    marginTop: 20,
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  loadingWrapper: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 140,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111111",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    textAlign: "center",
    maxWidth: 300,
  },
  getStartedButton: {
    marginTop: 26,
    backgroundColor: "#ECAA00",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  conversationList: {
    marginTop: 8,
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    flex: 1,
  },
  conversationTimestamp: {
    fontSize: 12,
    color: "#AAAAAA",
    marginLeft: 8,
    flexShrink: 0,
  },
  conversationListing: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 2,
  },
  conversationPreview: {
    fontSize: 14,
    color: "#555555",
  },
  navbarWrapper: {
    backgroundColor: "#FFFFFF",
  },
  navbarContent: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
