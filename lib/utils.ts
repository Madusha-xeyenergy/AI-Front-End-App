export { cn } from "cn"

// "2026-10-07T09:30:00.000Z" → "Oct 07, 2026". A fixed locale and time zone mean
// the server and the browser render the same text (no hydration mismatch).
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}
