import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-baseline gap-1 font-serif text-2xl font-semibold leading-none text-ink", className)}
    >
      <span>Coppermind</span>
      <span className="h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-accent" />
    </Link>
  );
}
