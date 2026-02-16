// Danish CVR (Central Business Register) number validation
// CVR is 8 digits with a modulus 11 check

const CVR_WEIGHTS = [2, 7, 6, 5, 4, 3, 2, 1];

export function isValidCVR(cvr: string): boolean {
  const cleaned = cvr.replace(/\s/g, '');
  if (!/^\d{8}$/.test(cleaned)) return false;

  const digits = cleaned.split('').map(Number);
  const sum = digits.reduce((acc, digit, i) => acc + digit * CVR_WEIGHTS[i], 0);
  return sum % 11 === 0;
}

export function formatCVR(cvr: string): string {
  const cleaned = cvr.replace(/\D/g, '');
  if (cleaned.length !== 8) return cvr;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
}
