export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export function calculateCountdown(targetDate: Date, fromDate: Date = new Date()): CountdownResult {
  const diff = targetDate.getTime() - fromDate.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds, isExpired: false };
}

export function formatCountdown(countdown: CountdownResult): string {
  if (countdown.isExpired) return '0:00';
  if (countdown.days > 0) return `${countdown.days}d ${countdown.hours}t`;
  if (countdown.hours > 0) return `${countdown.hours}t ${countdown.minutes}m`;
  return `${countdown.minutes}m ${countdown.seconds}s`;
}
