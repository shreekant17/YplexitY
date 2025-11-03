import { formatDistanceToNow } from "date-fns";

export function getRelativeTime(iso8601String) {
  const date = new Date(iso8601String);
  const now = new Date();

  // If the time difference is less than a second, return "just now"
  if ((now - date) / 1000 < 1) {
    return "just now";
  }

  // Format the relative time
  return `${formatDistanceToNow(date, { addSuffix: true })}`;
}
