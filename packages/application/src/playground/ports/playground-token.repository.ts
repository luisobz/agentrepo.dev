import type { PlaygroundToken } from '@agentrepo/domain';
import type { Paginated } from '../../catalog/ports/content.repository';

export interface CreatePlaygroundTokenInput {
  token: string;
  label: string;
  maxUses: number;
  expiresAt: Date;
}

export interface ListPlaygroundTokensParams {
  page: number;
  pageSize: number;
}

export interface PlaygroundTokenRepository {
  create(input: CreatePlaygroundTokenInput): Promise<PlaygroundToken>;
  list(params: ListPlaygroundTokensParams): Promise<Paginated<PlaygroundToken>>;
  findByToken(token: string): Promise<PlaygroundToken | null>;
  /**
   * Atomically consumes one use if (and only if) the token is still active,
   * unexpired and under its budget. Returns the updated row or null when the
   * consumption was rejected.
   */
  consumeUse(token: string, now: Date): Promise<PlaygroundToken | null>;
  setActive(id: string, isActive: boolean): Promise<PlaygroundToken>;
  remove(id: string): Promise<void>;
}
