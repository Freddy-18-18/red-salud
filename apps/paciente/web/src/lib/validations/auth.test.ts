import { describe, it, expect } from 'vitest';
import { strongPasswordSchema, resetPasswordSchema } from './auth';

// ---------------------------------------------------------------------------
// strongPasswordSchema
// ---------------------------------------------------------------------------
//
// Production rule: 12+ chars, uppercase + lowercase + digit + symbol.
// This schema is shared across reset-password, register, and any future
// password-change flow so the rule lives in exactly one place.
// ---------------------------------------------------------------------------

describe('strongPasswordSchema', () => {
  it('rejects passwords shorter than 12 characters', () => {
    const result = strongPasswordSchema.safeParse('Aa1!short');
    expect(result.success).toBe(false);
  });

  it('rejects passwords without an uppercase letter', () => {
    const result = strongPasswordSchema.safeParse('abcdefghij1!');
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a lowercase letter', () => {
    const result = strongPasswordSchema.safeParse('ABCDEFGHIJ1!');
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a digit', () => {
    const result = strongPasswordSchema.safeParse('AbcdefghijK!');
    expect(result.success).toBe(false);
  });

  it('rejects passwords without a symbol', () => {
    const result = strongPasswordSchema.safeParse('Abcdefghij1K');
    expect(result.success).toBe(false);
  });

  it('accepts a strong password', () => {
    const result = strongPasswordSchema.safeParse('MyP@ssw0rd123!');
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resetPasswordSchema
// ---------------------------------------------------------------------------

describe('resetPasswordSchema', () => {
  const valid = {
    password: 'NewP@ssw0rd123!',
    confirmPassword: 'NewP@ssw0rd123!',
  };

  it('accepts matching strong passwords', () => {
    const result = resetPasswordSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects when confirmation does not match', () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      confirmPassword: 'NewP@ssw0rd999!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchError = result.error.errors.find((e) =>
        e.path.includes('confirmPassword'),
      );
      expect(mismatchError).toBeDefined();
    }
  });

  it('rejects a weak password even if confirmation matches', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'short1A',
      confirmPassword: 'short1A',
    });
    expect(result.success).toBe(false);
  });
});
