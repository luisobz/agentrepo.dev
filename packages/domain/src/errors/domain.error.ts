export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EntityNotFoundError extends DomainError {
  readonly code = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, identifier: string) {
    super(`${entityName} not found: ${identifier}`);
  }
}

export class SlugAlreadyInUseError extends DomainError {
  readonly code = 'SLUG_ALREADY_IN_USE';

  constructor(entityName: string, slug: string) {
    super(`${entityName} slug already in use: ${slug}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid credentials');
  }
}

export class InvalidRefreshTokenError extends DomainError {
  readonly code = 'INVALID_REFRESH_TOKEN';

  constructor() {
    super('Refresh token is invalid, expired or has been revoked');
  }
}

export class IdentityProviderUnavailableError extends DomainError {
  readonly code = 'IDENTITY_PROVIDER_UNAVAILABLE';

  constructor() {
    super('Identity provider is unavailable');
  }
}

export class DataIntegrityError extends DomainError {
  readonly code = 'DATA_INTEGRITY';

  constructor(detail: string) {
    super(`Stored data violates a domain invariant: ${detail}`);
  }
}
