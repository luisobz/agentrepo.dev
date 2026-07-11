import { Prisma } from '@prisma/client';

/** UTC midnight of today: the bucket key for download counting. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Start of the rolling 7-day window (today included). */
export function weekWindowStart(): Date {
  const start = todayUtc();
  start.setUTCDate(start.getUTCDate() - 6);
  return start;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
