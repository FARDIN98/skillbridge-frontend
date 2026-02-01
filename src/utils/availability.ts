import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';

export interface AvailabilitySlot {
  date: Date;
  time: string; // "09:00"
  dayOfWeek: string; // "Monday"
  displayTime: string; // "9:00 AM"
  displayDate: string; // "Mon, Feb 5"
}

/**
 * Parse a single availability string like "Monday 09:00-17:00"
 * Returns { day: "Monday", startTime: "09:00", endTime: "17:00" }
 */
export function parseAvailabilityString(availStr: string): {
  day: string;
  startTime: string;
  endTime: string;
} | null {
  const match = availStr.match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!match) return null;

  return {
    day: match[1],
    startTime: match[2],
    endTime: match[3]
  };
}

/**
 * Convert day name to day index (0 = Sunday, 1 = Monday, ...)
 */
function dayNameToIndex(dayName: string): number {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(dayName);
}

/**
 * Generate hourly time slots between start and end time
 * Example: generateTimeSlots("09:00", "17:00") => ["09:00", "10:00", ..., "16:00"]
 */
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return slots;
}

/**
 * Generate available slots for the next N days based on tutor's availability
 * @param availabilityStrings Array like ["Monday 09:00-17:00", "Tuesday 10:00-15:00"]
 * @param daysAhead Number of days to look ahead (default: 14)
 * @returns Array of AvailabilitySlot objects
 */
export function generateAvailableSlots(
  availabilityStrings: string[],
  daysAhead: number = 14
): AvailabilitySlot[] {
  if (!availabilityStrings || availabilityStrings.length === 0) {
    return [];
  }

  // Parse all availability strings
  const availabilityByDay = new Map<string, { startTime: string; endTime: string }>();

  availabilityStrings.forEach(str => {
    const parsed = parseAvailabilityString(str);
    if (parsed) {
      availabilityByDay.set(parsed.day, {
        startTime: parsed.startTime,
        endTime: parsed.endTime
      });
    }
  });

  const slots: AvailabilitySlot[] = [];
  const today = startOfDay(new Date());

  // Generate slots for the next N days (starting from today)
  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(today, i);
    const dayOfWeek = format(date, 'EEEE'); // "Monday", "Tuesday", etc.

    const availability = availabilityByDay.get(dayOfWeek);
    if (availability) {
      const timeSlots = generateTimeSlots(availability.startTime, availability.endTime);

      timeSlots.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        const dateTime = setHours(setMinutes(date, minute), hour);

        slots.push({
          date: dateTime,
          time,
          dayOfWeek,
          displayTime: format(dateTime, 'h:mm a'),
          displayDate: format(date, 'EEE, MMM d')
        });
      });
    }
  }

  return slots;
}

/**
 * Group slots by date for display
 * Returns Map<dateString, AvailabilitySlot[]>
 */
export function groupSlotsByDate(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const grouped = new Map<string, AvailabilitySlot[]>();

  slots.forEach(slot => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    const existing = grouped.get(dateKey) || [];
    existing.push(slot);
    grouped.set(dateKey, existing);
  });

  return grouped;
}

/**
 * Check if a specific date/time falls within tutor's availability
 */
export function isTimeAvailable(
  date: Date,
  time: string,
  availabilityStrings: string[]
): boolean {
  const dayOfWeek = format(date, 'EEEE');

  for (const availStr of availabilityStrings) {
    const parsed = parseAvailabilityString(availStr);
    if (parsed && parsed.day === dayOfWeek) {
      const [hour] = time.split(':').map(Number);
      const [startHour] = parsed.startTime.split(':').map(Number);
      const [endHour] = parsed.endTime.split(':').map(Number);

      return hour >= startHour && hour < endHour;
    }
  }

  return false;
}
