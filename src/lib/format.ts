// Parse ISO 8601 duration like PT2H35M → "2h 35m"
export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? `${match[2]}m` : "";
  return [h, m].filter(Boolean).join(" ");
}

// "2024-11-15T06:45:00" → "06:45"
export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

// "2024-11-15T06:45:00" → "15 Nov"
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

// Calculate if arrival is next day / +N days
export function dayDiff(departure: string, arrival: string): number {
  const dep = new Date(departure).setHours(0, 0, 0, 0);
  const arr = new Date(arrival).setHours(0, 0, 0, 0);
  return Math.round((arr - dep) / 86_400_000);
}
