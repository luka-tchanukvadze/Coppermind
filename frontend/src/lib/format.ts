// Date helpers. Use LOCAL getters so dates/times match the user's timezone -
// a message sent at 1am local must show as today, not yesterday's UTC date.
// Safe from hydration mismatch because every caller renders client-side from
// TanStack-Query data (undefined during SSR, so no date is in the server HTML).

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
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

// chat header presence text. <1min: "Last seen just now". <1h: "Last seen Xm ago".
// <24h: "Last seen Xh ago". past 1 day deliberately fuzz to "recently"
// instead of "5d ago" - feels less like surveillance
export function formatLastSeen(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Last seen just now";
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  return "Last seen recently";
}

export function progressLabel(p: "WANT_TO_READ" | "READING" | "READ"): string {
  if (p === "WANT_TO_READ") return "Want to read";
  if (p === "READING") return "Reading";
  return "Finished";
}
