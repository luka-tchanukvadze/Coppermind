// Date helpers. We use UTC getters everywhere so server-render and client-hydrate
// produce the SAME string regardless of the user's timezone (otherwise React
// throws a hydration mismatch). When real users sign in we can switch to their
// timezone preference once it's stored on the User model.

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const hh = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Note: Date.now() differs between server render and client hydration by a few
// hundred ms - safe here because our buckets are minutes/hours/days, never seconds.
// If we ever show "X seconds ago" we'll need to render this client-only.
export function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso);
}

export function progressLabel(p: "WANT_TO_READ" | "READING" | "READ"): string {
  if (p === "WANT_TO_READ") return "Want to read";
  if (p === "READING") return "Reading";
  return "Finished";
}
