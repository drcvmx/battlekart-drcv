/**
 * Safely parse a date-only string (YYYY-MM-DD) without timezone shift.
 * 
 * Problem: new Date("2024-01-15") is parsed as UTC midnight,
 * which becomes the previous day in timezones behind UTC (like Mexico).
 * 
 * Solution: Append T12:00:00 to avoid the midnight boundary issue.
 */
export function parseDateSafe(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  // If it's just a date (YYYY-MM-DD), append noon to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T12:00:00`);
  }
  
  // Otherwise parse as-is (timestamps with time component)
  return new Date(dateString);
}

/**
 * Format a date-only string for display in Spanish (Mexico).
 * Handles timezone-safe parsing automatically.
 */
export function formatDateEsMX(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }
): string {
  const date = parseDateSafe(dateString);
  if (!date || isNaN(date.getTime())) return "No registrada";
  return date.toLocaleDateString("es-MX", options);
}

/**
 * Format a date for short display (e.g., "15 ene 2024")
 */
export function formatDateShort(dateString: string | null | undefined): string {
  return formatDateEsMX(dateString, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date with time for display
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "No registrada";
  // Timestamps usually include time, so no T12:00:00 hack needed
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
