import { AdminSession } from '@agentrepo/domain';

export interface CreateAdminSessionInput {
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
}

export interface AdminSessionRepository {
  create(input: CreateAdminSessionInput): Promise<AdminSession>;
  findByTokenHash(tokenHash: string): Promise<AdminSession | null>;
  /** Revoke by rotation: records the successor so races can be told apart from reuse. */
  markReplaced(id: string, replacedById: string, revokedAt: Date): Promise<void>;
  revokeFamily(familyId: string, revokedAt: Date): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}
