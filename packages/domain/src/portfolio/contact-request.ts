import { DataIntegrityError } from '../errors/domain.error';

export const CONTACT_SUBJECTS = [
  'employment',
  'freelance',
  'question',
  'other',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_REQUEST_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;

export type ContactRequestStatus = (typeof CONTACT_REQUEST_STATUSES)[number];

export interface ContactRequest {
  id: string;
  email: string;
  subject: ContactSubject;
  message: string;
  status: ContactRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function isContactSubject(value: unknown): value is ContactSubject {
  return (
    typeof value === 'string' &&
    (CONTACT_SUBJECTS as readonly string[]).includes(value)
  );
}

export function assertContactSubject(value: unknown): ContactSubject {
  if (!isContactSubject(value)) {
    throw new DataIntegrityError(`unknown contact subject "${String(value)}"`);
  }
  return value;
}

export function isContactRequestStatus(
  value: unknown
): value is ContactRequestStatus {
  return (
    typeof value === 'string' &&
    (CONTACT_REQUEST_STATUSES as readonly string[]).includes(value)
  );
}

export function assertContactRequestStatus(value: unknown): ContactRequestStatus {
  if (!isContactRequestStatus(value)) {
    throw new DataIntegrityError(
      `unknown contact request status "${String(value)}"`
    );
  }
  return value;
}
