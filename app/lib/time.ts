/**
 * Formats a date as a relative time string (e.g., "5 mins ago", "2 hours ago").
 * Lightweight replacement for date-fns to avoid extra dependencies.
 */
export function formatRelativeTime(date: string | Date | number): string {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  // Fallback to absolute date if more than a week
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
}
