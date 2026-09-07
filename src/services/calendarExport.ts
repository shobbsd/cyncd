import type { CalendarEntry } from '../content';

function clean(value: string): string {
  return value.replace(/[\r\n;,]/g, ' ');
}

function nextDate(date: string): string {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10).replaceAll('-', '');
}

/** A small, portable all-day export. It contains no app state beyond the entry. */
export function toIcsEvent(entry: CalendarEntry): string {
  const date = entry.date.replaceAll('-', '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//cyncd//EN',
    'BEGIN:VEVENT',
    `UID:${clean(entry.id)}@cyncd.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${nextDate(entry.date)}`,
    `SUMMARY:${clean(entry.title)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
