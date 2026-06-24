export const createClaimNumber = (sequence: number, year = new Date().getFullYear()): string => {
  const normalized = Math.max(1, Math.floor(sequence));
  return `WC-${year}-${String(normalized).padStart(6, '0')}`;
};
