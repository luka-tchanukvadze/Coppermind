import { MessageSquareMore } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <MessageSquareMore className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-2xl font-medium text-ink">Select a conversation</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Pick someone from the list, or start a new conversation from a friend&apos;s profile.
      </p>
    </div>
  );
}
