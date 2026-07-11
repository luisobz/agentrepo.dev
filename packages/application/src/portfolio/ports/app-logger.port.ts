/**
 * Minimal logging port so use cases can report background failures without
 * depending on a concrete logger (NestJS Logger is wired in at the edges).
 */
export interface AppLoggerPort {
  warn(message: string): void;
  error(message: string, stack?: string): void;
}
