"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { UserPic } from "@/components/shared/user-pic";
import { OnlineDot } from "@/components/shared/online-dot";
import { PresenceStatus } from "@/components/shared/presence-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatThreadSkeleton } from "@/components/chat/chat-skeleton";
import { EmojiButton } from "@/components/chat/emoji-button";
import { cn } from "@/lib/utils";
import { useTypingFor } from "@/lib/presence/presence-provider";
import {
  useConversation,
  useOlderMessages,
  useSendMessage,
  useMarkConversationRead,
  type ConversationDetail,
  type Message,
} from "@/lib/api/conversations";
import { useMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { formatTime, formatShortDate } from "@/lib/format";

type MessageGroup = { userId: string; messages: Message[] };

// collapse consecutive messages from the same sender into one group. also break
// on a day change, so a group never spans midnight - otherwise the date divider
// (computed from the group's FIRST message) would swallow the next day's
// messages and never show a new day header
function groupConsecutive(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    const sameSender = last && last.userId === m.userId;
    const sameDay =
      last &&
      formatShortDate(last.messages.at(-1)!.createdAt) ===
        formatShortDate(m.createdAt);
    if (sameSender && sameDay) last.messages.push(m);
    else groups.push({ userId: m.userId, messages: [m] });
  }
  return groups;
}

// thin wrapper: key the room by conversationId so switching threads REMOUNTS
// it. without this, Next reuses the one instance (the room is layout children
// with no key), so refs like prependAnchorRef and an in-flight older-messages
// mutation would leak across conversations - opening a chat mid-load could
// land scrolled wrong, skip mark-read, or prepend into the wrong thread
export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return <ChatRoom key={conversationId} conversationId={conversationId} />;
}

function ChatRoom({ conversationId }: { conversationId: string }) {
  const {
    data: conversation,
    isLoading,
    error,
  } = useConversation(conversationId);
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();
  const olderMessages = useOlderMessages(conversationId);

  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];
  const hasMore = conversation?.hasMoreMessages ?? false;
  const oldestId = messages[0]?.id;
  const other = conversation?.participants[0]?.user;
  // hooks must run unconditionally - useTypingFor tolerates undefined friendId
  // and is a no-op while the conversation is still loading
  const { isTyping, notifyTyping, stopTyping } = useTypingFor(other?.id);

  // pin the list to the bottom. scroll the container directly instead of
  // scrollIntoView so it can never tug the window. runs on new messages and
  // on viewport resize - the mobile keyboard shrinks the viewport and would
  // otherwise leave the newest message stuck behind the input
  const scrollToBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // whether the user was at/near the bottom, sampled continuously on scroll.
  // read this (not a fresh measurement) when messages change: by the time the
  // effect runs the new message has already grown scrollHeight, so measuring
  // then would wrongly read "not at bottom" for a tall incoming message. start
  // true so the very first load counts as at-bottom
  const nearBottomRef = useRef(true);
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (el) nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  // tracks whether the next messages-length change is a history PREPEND (load
  // older) or a normal APPEND/initial-load. on a prepend I must NOT yank to
  // the bottom - instead we restore the scroll position so the view stays put.
  // holds the scrollHeight captured just before the older page is requested
  const prependAnchorRef = useRef<number | null>(null);

  // restore scroll position after older messages prepend. useLayoutEffect runs
  // before paint so the user never sees the jump: the new content grew the
  // scrollHeight, so add the delta to keep the same messages under the cursor.
  // does NOT clear the anchor - the passive effect below reads it too, and
  // layout effects run first, so clearing here would let the bottom-pin fire
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el && prependAnchorRef.current !== null) {
      el.scrollTop = el.scrollHeight - prependAnchorRef.current;
    }
  }, [messages.length]);

  // single reaction to a messages-length change. reading the prepend flag in
  // one place (then clearing it) avoids a cross-effect ordering race - a
  // prepend must skip BOTH the bottom-pin and the mark-read below
  const hasConversation = !!conversation;
  // first render = initial load: always pin + mark read even though the empty
  // scroller's "near bottom" check is ambiguous. after that, only follow new
  // messages when the user is actually at the bottom
  const didInitialScrollRef = useRef(false);
  useEffect(() => {
    const isPrepend = prependAnchorRef.current !== null;
    if (isPrepend) {
      // layout effect already restored position, just consume the flag
      prependAnchorRef.current = null;
      return;
    }
    // on initial load always snap to newest + mark read. after that, a new
    // message only pins (and marks read) if the user was near the bottom (read
    // from the ref sampled on scroll, before this message grew the height) - so
    // someone scrolled up reading history isn't yanked down
    const initial = !didInitialScrollRef.current;
    if (initial || nearBottomRef.current) {
      didInitialScrollRef.current = true;
      scrollToBottom();
      if (hasConversation) markRead.mutate(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length, hasConversation, scrollToBottom]);

  // auto-load older messages when the top sentinel scrolls into view. volatile
  // values are read from refs so loadOlder stays referentially stable - without
  // this the observer below would tear down and rebuild on every render (incl.
  // every keystroke in the input)
  const oldestIdRef = useRef(oldestId);
  oldestIdRef.current = oldestId;
  const isPendingRef = useRef(olderMessages.isPending);
  isPendingRef.current = olderMessages.isPending;
  const mutateOlder = olderMessages.mutate;

  const loadOlder = useCallback(() => {
    const el = scrollerRef.current;
    const id = oldestIdRef.current;
    if (!el || !id || isPendingRef.current) return;
    // flip the guard synchronously - react-query's isPending only turns true on
    // the next render, so without this a second observer callback (momentum
    // scroll, spinner layout shift) fires a duplicate request before then
    isPendingRef.current = true;
    // capture current scrollHeight so the layout effect can restore position
    prependAnchorRef.current = el.scrollHeight;
    mutateOlder(id, {
      // on failure clear the anchor, else the next append is mistaken for a
      // prepend and the bottom-pin gets skipped
      onError: () => {
        prependAnchorRef.current = null;
      },
    });
  }, [mutateOlder]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadOlder();
      },
      { root: scrollerRef.current, rootMargin: "120px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadOlder]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    vv.addEventListener("resize", scrollToBottom);
    return () => vv.removeEventListener("resize", scrollToBottom);
  }, [scrollToBottom]);

  // drop the dead conversation's cache entry on a 404. done in an effect, not
  // in render - mutating the cache mid-render can trip React's "update while
  // rendering" warning. without this the stale ConversationDetail lingers
  const is404 = error instanceof ApiError && error.status === 404;
  useEffect(() => {
    if (is404) {
      queryClient.removeQueries({ queryKey: ["conversation", conversationId] });
    }
  }, [is404, conversationId, queryClient]);

  if (isLoading) {
    return <ChatThreadSkeleton />;
  }

  if (is404) {
    notFound();
  }
  if (error || !conversation || !other) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Could not load this conversation.
      </div>
    );
  }

  const groups = groupConsecutive(messages);

  // unfriended -> read-only thread. only lock on an explicit false from the
  // server; undefined (e.g. a cache entry written by the socket handler) is
  // treated as "still a friend" so we never wrongly disable the composer
  const notFriend = conversation.isFriend === false;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !other || !me) return;
    setText("");
    stopTyping();
    // sending always jumps to the newest message, even if I'd scrolled up
    nearBottomRef.current = true;

    // clientMessageId rides along with the request and comes back on the
    // socket emit so the dedupe in use-new-message-subscription can swap
    // the optimistic message for the real one without flashing a duplicate
    const clientMessageId = crypto.randomUUID();
    const optimistic: Message = {
      id: clientMessageId,
      // stamp clientMessageId == id so the bubble knows this row is still
      // optimistic (unsend stays hidden until the server swap gives it a real
      // id). the socket dedupe still finds it by id == clientMessageId
      clientMessageId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      userId: me.id,
      conversationId,
      user: { id: me.id, name: me.name, photo: me.photo },
    };
    queryClient.setQueryData<ConversationDetail>(
      ["conversation", conversationId],
      (old) =>
        old ? { ...old, messages: [...old.messages, optimistic] } : old,
    );

    sendMessage.mutate(
      { friendId: other.id, text: trimmed, clientMessageId },
      {
        onError: (err) => {
          // roll back the optimistic message
          queryClient.setQueryData<ConversationDetail>(
            ["conversation", conversationId],
            (old) =>
              old
                ? {
                    ...old,
                    messages: old.messages.filter(
                      (m) => m.id !== clientMessageId,
                    ),
                  }
                : old,
          );
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/chat"
          aria-label="Back to conversations"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink hover:bg-muted-bg md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="relative shrink-0">
          <UserPic photo={other?.photo} name={other?.name ?? ""} size="md" />
          {other?.id && <OnlineDot userId={other.id} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink">{other?.name}</div>
          {other?.id && (
            <PresenceStatus
              userId={other.id}
              lastSeenAt={other.lastSeenAt}
              isTyping={isTyping}
            />
          )}
        </div>
      </header>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-6 py-6"
      >
        <div className="mx-auto max-w-2xl space-y-5">
          {/* sentinel: scrolling it into view pages in older messages. the
              spinner shows while that request is in flight */}
          {hasMore && (
            <div ref={topSentinelRef} className="flex justify-center py-2">
              {olderMessages.isPending && (
                <span className="text-[11px] uppercase tracking-widest text-muted">
                  Loading earlier messages...
                </span>
              )}
            </div>
          )}
          {groups.map((g, i) => {
            const isMe = g.userId === me?.id;
            const firstDate = g.messages[0].createdAt;
            const showDate =
              i === 0 ||
              formatShortDate(firstDate) !==
                formatShortDate(groups[i - 1].messages.at(-1)!.createdAt);
            return (
              <div key={g.messages[0].id}>
                {showDate && (
                  <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
                    <div className="h-px flex-1 bg-border" />
                    <span>{formatShortDate(firstDate)}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  {g.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} isMe={isMe} />
                  ))}
                  <div className="mt-0.5 text-[11px] text-muted">
                    {formatTime(g.messages.at(-1)!.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t bg-surface/60 px-4 py-3 sm:px-6 sm:py-4">
        {notFriend ? (
          // history above stays readable, but the composer is gone. sendMessage
          // would 404 anyway - this just makes the state obvious instead of
          // letting them type into a dead input and only learn on send
          <p className="mx-auto max-w-2xl text-center text-sm text-muted">
            You and {other?.name?.split(" ")[0] ?? "this person"} aren&apos;t
            friends anymore.{" "}
            <Link
              href="/friends"
              className="font-medium text-accent hover:underline"
            >
              Add them from Friends
            </Link>{" "}
            to message again.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mx-auto flex max-w-2xl items-center gap-2"
          >
            <EmojiButton onPick={(emoji) => setText((t) => t + emoji)} />
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value.trim()) notifyTyping();
                else stopTyping();
              }}
              placeholder={`Message ${other?.name?.split(" ")[0] ?? ""}...`}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </footer>
    </div>
  );
}
