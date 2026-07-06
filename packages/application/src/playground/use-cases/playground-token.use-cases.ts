import type { PlaygroundToken } from '@agentrepo/domain';
import { isPlaygroundTokenUsable } from '@agentrepo/domain';
import { randomUUID } from 'crypto';
import type { Paginated } from '../../catalog/ports/content.repository';
import { UseCase } from '../../shared/base.use-case';
import type {
  ListPlaygroundTokensParams,
  PlaygroundTokenRepository,
} from '../ports/playground-token.repository';

export interface CreatePlaygroundTokenRequest {
  label: string;
  maxUses: number;
  expiresAt: Date;
}

export class CreatePlaygroundToken
  implements UseCase<CreatePlaygroundTokenRequest, PlaygroundToken>
{
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  execute(request: CreatePlaygroundTokenRequest): Promise<PlaygroundToken> {
    return this.tokens.create({ ...request, token: randomUUID() });
  }
}

export class ListPlaygroundTokens
  implements UseCase<ListPlaygroundTokensParams, Paginated<PlaygroundToken>>
{
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  execute(
    params: ListPlaygroundTokensParams
  ): Promise<Paginated<PlaygroundToken>> {
    return this.tokens.list(params);
  }
}

export interface SetPlaygroundTokenActiveRequest {
  id: string;
  isActive: boolean;
}

export class SetPlaygroundTokenActive
  implements UseCase<SetPlaygroundTokenActiveRequest, PlaygroundToken>
{
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  execute(request: SetPlaygroundTokenActiveRequest): Promise<PlaygroundToken> {
    return this.tokens.setActive(request.id, request.isActive);
  }
}

export class DeletePlaygroundToken implements UseCase<string, void> {
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  execute(id: string): Promise<void> {
    return this.tokens.remove(id);
  }
}

export interface ValidateTokenResult {
  valid: boolean;
  remainingUses: number;
}

/** Non-consuming check used when the visitor enters a token in the UI. */
export class CheckPlaygroundToken
  implements UseCase<string, ValidateTokenResult>
{
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  async execute(token: string): Promise<ValidateTokenResult> {
    const found = await this.tokens.findByToken(token);
    if (!found || !isPlaygroundTokenUsable(found)) {
      return { valid: false, remainingUses: 0 };
    }
    return { valid: true, remainingUses: found.maxUses - found.usesCount };
  }
}

/**
 * Consumes one use of the token if it is usable; the repository performs the
 * check-and-increment atomically to survive concurrent submissions.
 */
export class ConsumePlaygroundToken
  implements UseCase<string, ValidateTokenResult>
{
  constructor(private readonly tokens: PlaygroundTokenRepository) {}

  async execute(token: string): Promise<ValidateTokenResult> {
    const consumed = await this.tokens.consumeUse(token, new Date());
    if (!consumed) {
      return { valid: false, remainingUses: 0 };
    }
    return {
      valid: true,
      remainingUses: consumed.maxUses - consumed.usesCount,
    };
  }
}
