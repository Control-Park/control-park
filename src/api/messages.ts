import client from "./client";

export interface ConversationSummary {
  id: string;
  guest_id: string;
  host_id: string;
  listing_id: string;
  created_at: string;
  guest?: { first_name: string; last_name: string; profile_image?: null | string };
  host?: { first_name: string; last_name: string; profile_image?: null | string };
  listing?: { images?: unknown[]; title: string };
  last_message?: { body: string; created_at: string };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const getOrCreateConversation = async (
  hostId: string,
  listingId: string,
  guestId?: string,
): Promise<ConversationSummary> => {
  const res = await client.post<ConversationSummary>("/conversations", {
    guest_id: guestId,
    host_id: hostId,
    listing_id: listingId,
  });
  return res.data;
};

export const fetchConversations = async (): Promise<ConversationSummary[]> => {
  const res = await client.get<{ conversations: ConversationSummary[] }>("/conversations");
  return res.data.conversations;
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await client.delete(`/conversations/${conversationId}`);
};

export const clearConversations = async (): Promise<void> => {
  await client.delete("/conversations");
};

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const res = await client.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`);
  return res.data.messages;
};

export const sendMessage = async (conversationId: string, body: string): Promise<Message> => {
  const res = await client.post<Message>(`/conversations/${conversationId}/messages`, { body });
  return res.data;
};
