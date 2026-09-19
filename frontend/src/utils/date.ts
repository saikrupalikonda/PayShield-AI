/**
 * PayShield Unified Timezone Utilities
 * Timezone: Asia/Kolkata (IST, UTC+05:30)
 *
 * Guarantees consistent date/time parsing and formatting across all
 * browser environments regardless of local host timezone.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';
export const TIME_UNAVAILABLE = 'Time unavailable';

/**
 * Parses any timestamp input (ISO string, epoch ms, Date object) safely into a valid Date object.
 * Naive ISO strings without explicit timezone are interpreted as UTC (standard for PayShield backend).
 */
export function parseTimestampToDate(timestamp: unknown): Date | null {
  if (timestamp === null || timestamp === undefined || timestamp === '') {
    return null;
  }
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }
  if (typeof timestamp === 'number') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof timestamp === 'string') {
    let s = timestamp.trim();
    if (!s) return null;
    // If naive ISO string (e.g. 2026-09-19T03:55:33.083153) missing timezone designator, append Z for UTC
    if (s.includes('T') && !s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
      s = s + 'Z';
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Returns the epoch milliseconds of the timestamp for chronological sorting (newest -> oldest).
 * Missing or invalid timestamps return 0.
 */
export function parseTimestampToMs(timestamp: unknown): number {
  const d = parseTimestampToDate(timestamp);
  return d ? d.getTime() : 0;
}

interface ISTParts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  dayPeriod: string;
  timeStr: string;
  dateStr: string;
}

function getISTParts(date: Date): ISTParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const day = get('day');
  const month = get('month');
  const year = get('year');
  const hour = get('hour');
  const minute = get('minute');
  const dayPeriod = (get('dayPeriod') || 'AM').toUpperCase();

  const timeStr = `${hour}:${minute} ${dayPeriod}`;
  const dateStr = `${day} ${month} ${year}`;

  return { day, month, year, hour, minute, dayPeriod, timeStr, dateStr };
}

function getISTCalendarDate(date: Date): string {
  // Returns YYYY-MM-DD in Asia/Kolkata
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formats a timestamp in India Standard Time (Asia/Kolkata).
 * Example: "19 Sep 2026 • 10:00 AM IST" (or with comma: "19 Sep 2026, 10:00 AM IST")
 * Returns "Time unavailable" on invalid or missing input.
 */
export function formatISTTimestamp(
  timestamp: unknown,
  separator: '•' | ',' = '•'
): string {
  const date = parseTimestampToDate(timestamp);
  if (!date) return TIME_UNAVAILABLE;

  try {
    const { dateStr, timeStr } = getISTParts(date);
    return `${dateStr} ${separator} ${timeStr} IST`;
  } catch {
    return TIME_UNAVAILABLE;
  }
}

/**
 * Formats a relative/contextual IST timestamp for history and timeline views.
 * Examples:
 * - "Today • 10:42 AM IST"
 * - "Yesterday • 8:15 PM IST"
 * - "17 Sep 2026 • 6:30 PM IST"
 * Returns "Time unavailable" on invalid or missing input.
 */
export function formatRelativeISTTimestamp(
  timestamp: unknown,
  nowDate: Date = new Date()
): string {
  const date = parseTimestampToDate(timestamp);
  if (!date) return TIME_UNAVAILABLE;

  try {
    const { dateStr, timeStr } = getISTParts(date);
    const targetCalendar = getISTCalendarDate(date);
    const todayCalendar = getISTCalendarDate(nowDate);

    // Calculate yesterday's calendar date in IST
    const yesterdayDate = new Date(nowDate.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayCalendar = getISTCalendarDate(yesterdayDate);

    if (targetCalendar === todayCalendar) {
      return `Today • ${timeStr} IST`;
    }
    if (targetCalendar === yesterdayCalendar) {
      return `Yesterday • ${timeStr} IST`;
    }

    return `${dateStr} • ${timeStr} IST`;
  } catch {
    return TIME_UNAVAILABLE;
  }
}
