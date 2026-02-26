export function getUserToday(timezone: string): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone });
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function diffSeconds(startISO: string, endISO: string): number {
  return Math.floor((new Date(endISO).getTime() - new Date(startISO).getTime()) / 1000);
}
