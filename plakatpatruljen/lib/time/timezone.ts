import { TIMEZONE } from '@/config/constants';

export function toCopenhagenTime(date: Date): string {
  return date.toLocaleString('da-DK', { timeZone: TIMEZONE });
}

export function formatDanishDate(date: Date): string {
  return date.toLocaleDateString('da-DK', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDanishTime(date: Date): string {
  return date.toLocaleTimeString('da-DK', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}
