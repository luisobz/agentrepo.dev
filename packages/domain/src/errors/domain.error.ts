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

export class DataIntegrityError extends DomainError {
  readonly code = 'DATA_INTEGRITY';

  constructor(detail: string) {
    super(`Stored data violates a domain invariant: ${detail}`);
  }
}
