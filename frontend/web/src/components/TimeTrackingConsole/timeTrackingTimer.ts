/** Parse "2h 30m" / "0h 00m" into milliseconds. */
export function parseElapsedToMs(elapsed: string): number {
  const hMatch = elapsed.match(/(\d+)\s*h/i);
  const mMatch = elapsed.match(/(\d+)\s*m/i);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
  return (hours * 60 + minutes) * 60 * 1000;
}

export function formatMsToElapsed(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function msToHours(ms: number): number {
  return Math.round((ms / 3600000) * 100) / 100;
}
