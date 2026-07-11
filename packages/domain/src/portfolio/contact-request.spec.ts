import { describe, it, expect } from 'vitest';
import {
  assertContactSubject,
  assertContactRequestStatus,
  isContactSubject,
  isContactRequestStatus,
  CONTACT_SUBJECTS,
  CONTACT_REQUEST_STATUSES,
} from './contact-request';
import { DataIntegrityError } from '../errors/domain.error';

describe('isContactSubject', () => {
  it('accepts every declared subject', () => {
    for (const subject of CONTACT_SUBJECTS) {
      expect(isContactSubject(subject)).toBe(true);
    }
  });

  it('rejects unknown values', () => {
    expect(isContactSubject('sales')).toBe(false);
    expect(isContactSubject(null)).toBe(false);
    expect(isContactSubject(42)).toBe(false);
  });
});

describe('assertContactSubject', () => {
  it('returns the value for a valid subject', () => {
    expect(assertContactSubject('freelance')).toBe('freelance');
  });

  it('throws DataIntegrityError for an invalid subject', () => {
    expect(() => assertContactSubject('sales')).toThrow(DataIntegrityError);
  });
});

describe('isContactRequestStatus', () => {
  it('accepts every declared status', () => {
    for (const status of CONTACT_REQUEST_STATUSES) {
      expect(isContactRequestStatus(status)).toBe(true);
    }
  });

  it('rejects unknown values and wrong casing', () => {
    expect(isContactRequestStatus('pending')).toBe(false);
    expect(isContactRequestStatus('DONE')).toBe(false);
    expect(isContactRequestStatus(null)).toBe(false);
  });
});

describe('assertContactRequestStatus', () => {
  it('returns the value for a valid status', () => {
    expect(assertContactRequestStatus('PENDING')).toBe('PENDING');
  });

  it('throws DataIntegrityError for an invalid status', () => {
    expect(() => assertContactRequestStatus('pending')).toThrow(DataIntegrityError);
  });
});
