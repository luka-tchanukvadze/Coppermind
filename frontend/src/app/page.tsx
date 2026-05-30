"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  NotebookPen,
  MessageSquareHeart,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/shared/wordmark";

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}

function LandingContent() {
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl");

  // forward returnUrl to login/signup pages so it survives the click
  const loginHref = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : "/login";
  const signupHref = returnUrl
    ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}`
    : "/signup";

  return (
    <div className="paper min-h-screen">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={loginHref}>Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={signupHref}>Sign up</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />A library that
          feels like one
        </div>
        <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Your private library.
          <br />
          <span className="italic text-accent">Your public shelves.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
          Track your reading, keep your notes with the book, and talk books with
          friends who actually read. A calmer reading app - no ratings race, no
          algorithm.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={signupHref}>
              Start reading <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto"
          >
            <Link href={loginHref}>I have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-24 px-6 pb-24">
        <Feature
          icon={<NotebookPen className="h-5 w-5" />}
          kicker="Notes"
          title="Keep your thoughts with the book."
          body="Every book on your shelf is a page of its own. Write what you're thinking, pin the lines you love, decide later whether the world gets to see them. Private entries stay private. Public ones become a shelf your friends can visit."
          example={
            <div className="rounded-md border bg-surface p-6 shadow-[0_1px_0_#e8e2d5]">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-muted">
                On Piranesi · public entry
              </div>
              <h3 className="mb-3 font-serif text-xl font-medium text-ink">
                On unreliable narrators
              </h3>
              <p className="text-sm leading-relaxed text-ink/85">
                The thing I keep coming back to is how the narrator never
                technically lies, but the framing makes truth feel like a loose
                suggestion. Everything they describe is accurate; the
                architecture is real, the tides are real…
              </p>
            </div>
          }
          flip={false}
        />
        <Feature
          icon={<MessageSquareHeart className="h-5 w-5" />}
          kicker="Community"
          title="Just you and the people you read with."
          body="Real friends, not followers. Direct messages and discussion threads that go somewhere. No leaderboards. No streaks. No badges."
          example={
            <div className="space-y-3 rounded-md border bg-surface p-6 shadow-[0_1px_0_#e8e2d5]">
              <div className="flex gap-3">
                <div className="max-w-[80%] rounded-md rounded-tl-none bg-muted-bg px-3 py-2 text-sm">
                  just finished Piranesi
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="max-w-[80%] rounded-md rounded-tr-none bg-accent px-3 py-2 text-sm text-white">
                  and??
                </div>
              </div>
              <div className="flex gap-3">
                <div className="max-w-[80%] rounded-md rounded-tl-none bg-muted-bg px-3 py-2 text-sm">
                  it wrecked me.
                </div>
              </div>
            </div>
          }
          flip={true}
        />
        <Feature
          icon={<BookMarked className="h-5 w-5" />}
          kicker="Shelves"
          title="A shelf, not a spreadsheet."
          body="Want to read, reading, finished - that's it. No progress bars, no star ratings. Just your books and what you thought of them."
          example={
            <div className="space-y-2 rounded-md border bg-surface p-5 shadow-[0_1px_0_#e8e2d5]">
              {[
                {
                  title: "Piranesi",
                  author: "Susanna Clarke",
                  status: "Reading",
                  color: "#2D4A3E",
                },
                {
                  title: "The Overstory",
                  author: "Richard Powers",
                  status: "Finished",
                  color: "#7A5C2E",
                },
                {
                  title: "Babel",
                  author: "R.F. Kuang",
                  status: "Want to read",
                  color: "#4A3763",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="flex items-center gap-3 border-b border-border/50 py-2 last:border-b-0"
                >
                  <div
                    className="h-10 w-7 shrink-0 rounded-xs"
                    style={{ background: b.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-sm font-medium">
                      {b.title}
                    </div>
                    <div className="truncate text-xs italic text-muted">
                      {b.author}
                    </div>
                  </div>
                  <div className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          }
          flip={false}
        />
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted">
          <div className="flex items-center gap-3">
            <Wordmark className="text-lg" />
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/luka-tchanukvadze"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/luka-tchanukvadze"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              LinkedIn
            </a>
            <span>© {new Date().getFullYear()} Coppermind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  kicker,
  title,
  body,
  example,
  flip,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  example: React.ReactNode;
  flip: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-10 md:grid-cols-2 ${flip ? "md:[&>*:first-child]:order-last" : ""}`}
    >
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-accent">
          <span className="text-accent">{icon}</span>
          {kicker}
        </div>
        <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">{body}</p>
      </div>
      <div>{example}</div>
    </div>
  );
}
