export function getUserToday(timezone: string): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone });
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00Z');
  const b = new Date(dateB + 'T00:00:00Z');
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

export function subtractDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split('T')[0]!;
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0]!;
}

export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = addDays(startDate, 1);
  while (current < endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getWeekRange(date: string): { start: string; end: string } {
  const d = new Date(date + 'T00:00:00Z');
  const dayOfWeek = d.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = addDays(date, mondayOffset);
  const end = addDays(start, 6);
  return { start, end };
}

export function getGreeting(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);

  if (hour >= 5 && hour < 12) return 'おはようございます';
  if (hour >= 12 && hour < 18) return 'こんにちは';
  return 'こんばんは';
}
