export function magColor(mag) {
  if (mag >= 6) return "var(--mag-6)";
  if (mag >= 5) return "var(--mag-5)";
  if (mag >= 4) return "var(--mag-4)";
  return "var(--mag-low)";
}

export function magRadius(mag) {
  return Math.max(4, Math.min(22, (mag - 2) * 4));
}

export function formatWib(iso) {
  return (
    new Date(iso).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

export function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}
