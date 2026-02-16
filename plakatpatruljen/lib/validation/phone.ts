export function isValidDanishPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+45)?[2-9]\d{7}$/.test(cleaned);
}

export function normalizeDanishPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+45')) return cleaned;
  if (cleaned.startsWith('45') && cleaned.length === 10) return `+${cleaned}`;
  return `+45${cleaned}`;
}

export function formatDanishPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-+]/g, '');
  const digits = cleaned.startsWith('45') ? cleaned.slice(2) : cleaned;
  if (digits.length !== 8) return phone;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
}
