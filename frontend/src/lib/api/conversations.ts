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
  // messages from the other person since my lastReadAt. 0 = caught up
  unreadCount: number;
};

// detail view: other participant + the most recent page of messages (asc),
// each with .user. older messages are paged in on scroll-up. hasMoreMessages
// is stored on the cached object so the chat knows when to stop loading
export type ConversationDetail = {
  id: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
  hasMoreMessages?: boolean;
};

type ConversationsResponse = { data: { conversation: ConversationPreview[] } };
type ConversationResponse = {
  data: { conversation: ConversationDetail; hasMoreMessages: boolean };
};
type OlderMessagesResponse = {
  data: { messages: Message[]; hasMoreMessages: boolean };
};
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
  // fold the sibling hasMoreMessages flag onto the cached object so the chat
  // can read it straight off the conversation
  return { ...res.data.conversation, hasMoreMessages: res.data.hasMoreMessages };
}

async function fetchOlderMessages(
  conversationId: string,
  before: string,
): Promise<{ messages: Message[]; hasMoreMessages: boolean }> {
  const res = await apiClient.get<OlderMessagesResponse>(
    `/messages/${conversationId}/messages?before=${before}`,
  );
  return res.data;
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

async function markConversationReadRequest(conversationId: string) {
  return apiClient.patch(`/messages/${conversationId}/read`);
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

// load the page of messages older than the oldest one currently in cache and
// prepend them. returns the mutation so the chat can show a loading state and
// anchor the scroll. dedups by id in case a message straddles the boundary
function useOlderMessages(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (before: string) =>
      fetchOlderMessages(conversationId, before),
    onSuccess: ({ messages: older, hasMoreMessages }) => {
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", conversationId],
        (old) => {
          if (!old) return old;
          const existing = new Set(old.messages.map((m) => m.id));
          const fresh = older.filter((m) => !existing.has(m.id));
          return {
            ...old,
            messages: [...fresh, ...old.messages],
            hasMoreMessages,
          };
        },
      );
    },
  });
}

function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessageRequest,
    onSuccess: (message) => {
      // DON'T invalidate ["conversation", id] - the socket newMessage handler
      // already swaps the optimistic row for the real one. a refetch here would
      // also reset the thread to the newest page, wiping any older history the
      // user scrolled up to load. only refresh the sidebar list preview/order.
      // conversationId comes back on the message - works even for a brand-new convo
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

function useUnsendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsendMessageRequest,
    onSuccess: (_data, input) => {
      // patch the deleted message out of the cached thread directly instead of
      // refetching - a refetch would reset to the newest page and wipe any
      // older history the user scrolled up to load
      queryClient.setQueryData<ConversationDetail>(
        ["conversation", input.conversationId],
        (old) =>
          old
            ? {
                ...old,
                messages: old.messages.filter((m) => m.id !== input.messageId),
              }
            : old,
      );
      // sidebar preview/order may change (last message removed) - cheap refetch
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markConversationReadRequest,
    onSuccess: (_data, conversationId) => {
      // zero this conversation's badge locally - no refetch needed
      queryClient.setQueryData<ConversationPreview[]>(
        ["conversations"],
        (old) =>
          old?.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
      );
    },
  });
}

// total unread across all conversations, for the nav badge. reads the same
// cached ["conversations"] query every consumer shares, so no extra fetch
function useUnreadTotal(): number {
  const { data } = useConversations();
  return (data ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export {
  useConversations,
  useConversation,
  useOlderMessages,
  useSendMessage,
  useUnsendMessage,
  useMarkConversationRead,
  useUnreadTotal,
};
