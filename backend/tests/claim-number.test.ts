import { describe, expect, it } from 'vitest';
import { createClaimNumber } from '../src/utils/claim-number.js';

describe('createClaimNumber', () => {
  it('formats numbers with the required prefix and zero padding', () => {
    expect(createClaimNumber(1, 2026)).toBe('WC-2026-000001');
    expect(createClaimNumber(42, 2026)).toBe('WC-2026-000042');
  });

  it('normalizes invalid sequence inputs to 1', () => {
    expect(createClaimNumber(0, 2026)).toBe('WC-2026-000001');
    expect(createClaimNumber(-5, 2026)).toBe('WC-2026-000001');
    expect(createClaimNumber(2.7, 2026)).toBe('WC-2026-000002');
  });
});
