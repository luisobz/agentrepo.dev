import { BackendEnvironments } from '@agentrepo/config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

interface RequestWithHeaders {
  headers: Record<string, string | string[] | undefined>;
}

function safeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

/** Protects internal endpoints with the shared BFF ↔ backend-ai secret. */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const provided = request.headers['x-internal-key'];

    if (
      typeof provided !== 'string' ||
      !safeEquals(provided, BackendEnvironments.INTERNAL_API_SECRET)
    ) {
      throw new UnauthorizedException('Invalid internal key');
    }
    return true;
  }
}
