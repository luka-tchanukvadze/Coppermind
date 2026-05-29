// listConversations, getConversation, sendMessage, unsendMessage
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

type ChatUser = {
  id: string;
  name: string;
  photo: string | null;
  lastSeenAt?: string | null;
};

export type Message = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  conversationId: string;
  user?: ChatUser; // populated on getConversation messages, not on send response
  // present on socket emits + send response. frontend uses it to swap the
  // optimistic message for the real one without showing a duplicate
  clientMessageId?: string | null;
};

type Participant = {
  id: string;
  userId: string;
  conversationId: string;
  user: ChatUser;
};

// list view: backend includes only the OTHER participant + the last message
export type ConversationPreview = {
  id: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[]; // length 0 or 1 (last message only)
};

// detail view: other participant + ALL messages (asc), each with .user
export type ConversationDetail = {
  id: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
};

type ConversationsResponse = { data: { conversation: ConversationPreview[] } };
type ConversationResponse = { data: { conversation: ConversationDetail } };
type SendMessageResponse = { data: { message: Message } };

type SendMessageInput = {
  friendId: string;
  text: string;
  // optimistic id - echoed back so we can swap optimistic for real
  clientMessageId: string;
};
type UnsendMessageInput = { conversationId: string; messageId: string };

async function fetchConversations(): Promise<ConversationPreview[]> {
  const res = await apiClient.get<ConversationsResponse>("/messages");
  return res.data.conversation;
}

async function fetchConversation(id: string): Promise<ConversationDetail> {
  const res = await apiClient.get<ConversationResponse>(`/messages/${id}`);
  return res.data.conversation;
}

async function sendMessageRequest(input: SendMessageInput): Promise<Message> {
  const res = await apiClient.post<SendMessageResponse>(
    `/messages/${input.friendId}`,
    { text: input.text, clientMessageId: input.clientMessageId },
  );
  return res.data.message;
}

async function unsendMessageRequest(input: UnsendMessageInput) {
  return apiClient.delete(
    `/messages/${input.conversationId}/${input.messageId}`,
  );
}

function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
}

function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  });
}

function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessageRequest,
    onSuccess: (message) => {
      // conversationId comes back on the message - works even for a brand-new convo
      queryClient.invalidateQueries({
        queryKey: ["conversation", message.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

function useUnsendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsendMessageRequest,
    onSuccess: (_data, input) => {
      // input still has conversationId - the deleted message changes both views
      queryClient.invalidateQueries({
        queryKey: ["conversation", input.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export { useConversations, useConversation, useSendMessage, useUnsendMessage };
