/**
 * A stored admin refresh session. The refresh token itself never persists:
 * only its hash is kept, and `familyId` groups the rotation chain so a
 * reused (already-rotated) token can revoke the whole family.
 * `replacedById` is set only when the session was revoked by rotation; a
 * revocation without a successor (logout, family kill) must never be
 * granted the rotation grace window.
 */
export interface AdminSession {
  id: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedById: string | null;
  createdAt: Date;
}
