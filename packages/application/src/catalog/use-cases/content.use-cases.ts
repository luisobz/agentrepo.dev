import { EntityNotFoundError, SlugAlreadyInUseError } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import {
  ContentRecord,
  ContentRepository,
  ListContentParams,
  Paginated,
} from '../ports/content.repository';

export class ListContent<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<ListContentParams, Paginated<TModel>>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>
  ) {}

  execute(params: ListContentParams): Promise<Paginated<TModel>> {
    return this.repository.list(params);
  }
}

export class GetContentById<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<string, TModel>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>,
    private readonly entityName: string
  ) {}

  async execute(id: string): Promise<TModel> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new EntityNotFoundError(this.entityName, id);
    }
    return found;
  }
}

export class GetPublishedContentBySlug<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<string, TModel>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>,
    private readonly entityName: string
  ) {}

  async execute(slug: string): Promise<TModel> {
    const found = await this.repository.findBySlug(slug);
    if (!found || !found.isPublished) {
      throw new EntityNotFoundError(this.entityName, slug);
    }
    return found;
  }
}

export class CreateContent<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<TCreate, TModel>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>,
    private readonly entityName: string
  ) {}

  async execute(input: TCreate): Promise<TModel> {
    if (await this.repository.existsSlug(input.slug)) {
      throw new SlugAlreadyInUseError(this.entityName, input.slug);
    }
    return this.repository.create(input);
  }
}

export interface UpdateContentRequest<TUpdate> {
  id: string;
  data: TUpdate;
}

export class UpdateContent<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<UpdateContentRequest<TUpdate>, TModel>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>,
    private readonly entityName: string
  ) {}

  async execute({ id, data }: UpdateContentRequest<TUpdate>): Promise<TModel> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new EntityNotFoundError(this.entityName, id);
    }

    const newSlug = data.slug;
    if (
      newSlug !== undefined &&
      newSlug !== current.slug &&
      (await this.repository.existsSlug(newSlug, id))
    ) {
      throw new SlugAlreadyInUseError(this.entityName, newSlug);
    }

    return this.repository.update(id, data);
  }
}

export class DeleteContent<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> implements UseCase<string, void>
{
  constructor(
    private readonly repository: ContentRepository<TModel, TCreate, TUpdate>,
    private readonly entityName: string
  ) {}

  async execute(id: string): Promise<void> {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new EntityNotFoundError(this.entityName, id);
    }
    await this.repository.delete(id);
  }
}
