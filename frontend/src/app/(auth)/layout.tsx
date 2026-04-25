import { Wordmark } from "@/components/shared/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <Wordmark />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-100">{children}</div>
      </main>
      <footer className="px-8 py-6 text-center text-xs text-muted">
        © 2026 Coppermind - for readers who keep their thoughts with the book.
      </footer>
    </div>
  );
}
