import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
  Message,
} from "../api/messages";
import { supabase } from "../utils/supabase";

const MAX_WIDTH = 428;

type Props = NativeStackScreenProps<RootStackParamList, "Conversation">;

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "host";
  timestamp: string;
};

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

function toChat(msg: Message, currentUserId: string): ChatMessage {
  return {
    id: msg.id,
    sender: msg.sender_id === currentUserId ? "user" : "host",
    text: msg.body,
    timestamp: formatTimestamp(msg.created_at),
  };
}

export default function ConversationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { listingId, hostId, conversationId: paramConversationId, hostName, listingTitle, listingImage } = route.params;
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(paramConversationId ?? null);
  const [initError, setInitError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Get current user id; create conversation only if not already provided
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      setCurrentUserId(data.session.user.id);
      if (paramConversationId) return; // already have it
      try {
        const conv = await getOrCreateConversation(hostId, listingId);
        setConversationId(conv.id);
      } catch {
        setInitError("Failed to load conversation");
      }
    })();
  }, [hostId, listingId, paramConversationId]);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    enabled: !!conversationId,
    queryFn: () => fetchMessages(conversationId!),
    queryKey: ["messages", conversationId],
    refetchInterval: false,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(conversationId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !conversationId) return;
    setMessageText("");
    sendMutation.mutate(trimmed);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const chatMessages: ChatMessage[] = currentUserId
    ? messages.map((m) => toChat(m, currentUserId))
    : [];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={20} color="#111111" />
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.hostAvatarFallback}>
                <Ionicons name="person" size={16} color="#666666" />
              </View>

              <Text style={styles.headerTitle}>{hostName || "Host"}</Text>

              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {listingTitle || `Listing ${listingId}`}
              </Text>
            </View>

            <View style={styles.iconButtonPlaceholder} />
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.pageMax}>
            <View style={styles.listingCard}>
              <View style={styles.listingCardText}>
                <Text style={styles.listingLabel}>Messaging about</Text>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {listingTitle || "This listing"}
                </Text>
                <Text style={styles.listingMeta} numberOfLines={1}>
                  Host: {hostName || "Host"}
                </Text>
              </View>

              {listingImage ? (
                <Image source={listingImage} style={styles.listingImage} />
              ) : (
                <View style={styles.listingImageFallback}>
                  <Ionicons name="image-outline" size={22} color="#888888" />
                </View>
              )}
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {(isLoading || !conversationId) && !initError && (
                <View style={styles.emptyChat}>
                  <ActivityIndicator color="#ECAA00" />
                </View>
              )}

              {initError && (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatText}>{initError}</Text>
                </View>
              )}

              {!isLoading && !initError && chatMessages.length === 0 && (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatText}>
                    Start a conversation with {hostName || "the host"}
                  </Text>
                </View>
              )}

              {chatMessages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.userRow : styles.hostRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.hostBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.userMessageText : styles.hostMessageText,
                        ]}
                      >
                        {message.text}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.messageTimestamp,
                        isUser ? styles.userTimestamp : styles.hostTimestamp,
                      ]}
                    >
                      {message.timestamp}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View
          style={[
            styles.inputBarWrapper,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.pageMax}>
            <View style={styles.inputRow}>
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Write a message..."
                placeholderTextColor="#888888"
                style={styles.input}
                multiline
              />

              <Pressable
                onPress={handleSend}
                disabled={!messageText.trim() || sendMutation.isPending}
                style={({ pressed }) => [
                  styles.sendButton,
                  (pressed || sendMutation.isPending) && styles.pressed,
                ]}
              >
                {sendMutation.isPending ? (
                  <ActivityIndicator size="small" color="#111111" />
                ) : (
                  <Ionicons name="send" size={18} color="#111111" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  hostAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
    maxWidth: 220,
  },
  contentWrapper: {
    flex: 1,
  },
  pageMax: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  listingCard: {
    marginTop: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listingCardText: {
    flex: 1,
    paddingRight: 12,
  },
  listingImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  listingImageFallback: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  listingLabel: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  listingMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#555555",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyChat: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyChatText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },
  messageRow: {
    marginBottom: 14,
    maxWidth: "84%",
  },
  userRow: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  hostRow: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#ECAA00",
    borderBottomRightRadius: 6,
  },
  hostBubble: {
    backgroundColor: "#F3F3F3",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userMessageText: {
    color: "#111111",
  },
  hostMessageText: {
    color: "#111111",
  },
  messageTimestamp: {
    fontSize: 11,
    color: "#888888",
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: "right",
  },
  hostTimestamp: {
    textAlign: "left",
  },
  inputBarWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 15,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECAA00",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
