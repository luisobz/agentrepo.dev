import { EntityNotFoundError, SlugAlreadyInUseError } from '@agentrepo/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ContentRepository,
  ListContentParams,
  Paginated,
} from '../ports/content.repository';
import {
  CreateContent,
  DeleteContent,
  GetContentById,
  GetPublishedContentBySlug,
  ListContent,
  UpdateContent,
} from './content.use-cases';

interface FakeModel {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
}

type FakeCreate = Omit<FakeModel, 'id'>;
type FakeUpdate = Partial<FakeCreate>;

class InMemoryContentRepository
  implements ContentRepository<FakeModel, FakeCreate, FakeUpdate>
{
  constructor(private readonly rows: FakeModel[] = []) {}

  async list(params: ListContentParams): Promise<Paginated<FakeModel>> {
    const filtered = this.rows.filter(
      (row) => !params.publishedOnly || row.isPublished
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: filtered.slice(start, start + params.pageSize),
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findById(id: string): Promise<FakeModel | null> {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<FakeModel | null> {
    return this.rows.find((row) => row.slug === slug) ?? null;
  }

  async existsSlug(slug: string, excludeId?: string): Promise<boolean> {
    return this.rows.some((row) => row.slug === slug && row.id !== excludeId);
  }

  async create(data: FakeCreate): Promise<FakeModel> {
    const created = { id: `id-${this.rows.length + 1}`, ...data };
    this.rows.push(created);
    return created;
  }

  async update(id: string, data: FakeUpdate): Promise<FakeModel> {
    const index = this.rows.findIndex((row) => row.id === id);
    this.rows[index] = { ...this.rows[index], ...data };
    return this.rows[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.rows.findIndex((row) => row.id === id);
    this.rows.splice(index, 1);
  }
}

const seedRows = (): FakeModel[] => [
  { id: 'id-1', slug: 'published-row', title: 'Published', isPublished: true },
  { id: 'id-2', slug: 'draft-row', title: 'Draft', isPublished: false },
];

describe('content use cases', () => {
  let repository: InMemoryContentRepository;

  beforeEach(() => {
    repository = new InMemoryContentRepository(seedRows());
  });

  describe('ListContent', () => {
    it('returns the paginated result from the repository', async () => {
      const result = await new ListContent(repository).execute({
        page: 1,
        pageSize: 1,
      });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(1);
    });

    it('filters drafts out when publishedOnly is set', async () => {
      const result = await new ListContent(repository).execute({
        page: 1,
        pageSize: 10,
        publishedOnly: true,
      });

      expect(result.items.map((item) => item.slug)).toEqual(['published-row']);
    });
  });

  describe('GetContentById', () => {
    it('returns the entity when it exists', async () => {
      const useCase = new GetContentById(repository, 'Fake');

      await expect(useCase.execute('id-1')).resolves.toMatchObject({
        slug: 'published-row',
      });
    });

    it('throws EntityNotFoundError for unknown ids', async () => {
      const useCase = new GetContentById(repository, 'Fake');

      await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
        EntityNotFoundError
      );
    });
  });

  describe('GetPublishedContentBySlug', () => {
    it('returns published entities', async () => {
      const useCase = new GetPublishedContentBySlug(repository, 'Fake');

      await expect(useCase.execute('published-row')).resolves.toMatchObject({
        id: 'id-1',
      });
    });

    it('hides drafts behind EntityNotFoundError', async () => {
      const useCase = new GetPublishedContentBySlug(repository, 'Fake');

      await expect(useCase.execute('draft-row')).rejects.toBeInstanceOf(
        EntityNotFoundError
      );
    });
  });

  describe('CreateContent', () => {
    it('persists and returns the new entity', async () => {
      const useCase = new CreateContent(repository, 'Fake');

      const created = await useCase.execute({
        slug: 'fresh-row',
        title: 'Fresh',
        isPublished: false,
      });

      expect(created.id).toBeDefined();
      await expect(repository.findBySlug('fresh-row')).resolves.not.toBeNull();
    });

    it('rejects duplicate slugs with SlugAlreadyInUseError', async () => {
      const useCase = new CreateContent(repository, 'Fake');

      await expect(
        useCase.execute({ slug: 'published-row', title: 'Dup', isPublished: false })
      ).rejects.toBeInstanceOf(SlugAlreadyInUseError);
    });
  });

  describe('UpdateContent', () => {
    it('applies partial updates', async () => {
      const useCase = new UpdateContent(repository, 'Fake');

      const updated = await useCase.execute({
        id: 'id-2',
        data: { title: 'Renamed' },
      });

      expect(updated.title).toBe('Renamed');
      expect(updated.slug).toBe('draft-row');
    });

    it('allows keeping the current slug', async () => {
      const useCase = new UpdateContent(repository, 'Fake');

      await expect(
        useCase.execute({ id: 'id-1', data: { slug: 'published-row' } })
      ).resolves.toMatchObject({ slug: 'published-row' });
    });

    it('rejects slugs already used by another entity', async () => {
      const useCase = new UpdateContent(repository, 'Fake');

      await expect(
        useCase.execute({ id: 'id-2', data: { slug: 'published-row' } })
      ).rejects.toBeInstanceOf(SlugAlreadyInUseError);
    });

    it('throws EntityNotFoundError for unknown ids', async () => {
      const useCase = new UpdateContent(repository, 'Fake');

      await expect(
        useCase.execute({ id: 'missing', data: { title: 'X' } })
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('DeleteContent', () => {
    it('removes existing entities', async () => {
      const useCase = new DeleteContent(repository, 'Fake');

      await useCase.execute('id-1');

      await expect(repository.findById('id-1')).resolves.toBeNull();
    });

    it('throws EntityNotFoundError for unknown ids', async () => {
      const useCase = new DeleteContent(repository, 'Fake');

      await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
        EntityNotFoundError
      );
    });
  });
});
