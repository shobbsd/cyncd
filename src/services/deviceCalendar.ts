import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import type { CalendarEntry } from '../content';

function allDayBounds(date: string): { startDate: Date; endDate: Date } {
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  return { startDate, endDate };
}

/**
 * Add an event only after the user taps the explicit hand-off action. Android
 * has no single system default calendar, so it uses the portable ICS path.
 */
export async function addToDeviceCalendar(
  entry: CalendarEntry,
): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  const permission = await Calendar.requestCalendarPermissions(true);
  if (permission.status !== 'granted') return false;
  const calendar = Calendar.getDefaultCalendarSync();
  const { startDate, endDate } = allDayBounds(entry.date);
  await calendar.createEvent({
    title: entry.title,
    startDate,
    endDate,
    allDay: true,
  });
  return true;
}
