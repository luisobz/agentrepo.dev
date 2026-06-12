export interface ContentRecord {
  id: string;
  slug: string;
  isPublished: boolean;
}

export type ContentOrderField = 'createdAt' | 'updatedAt';

export interface ListContentParams {
  page: number;
  pageSize: number;
  search?: string;
  publishedOnly?: boolean;
  /** Field for descending ordering; defaults to `updatedAt`. */
  orderBy?: ContentOrderField;
}

export interface Paginated<TModel> {
  items: TModel[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ContentRepository<
  TModel extends ContentRecord,
  TCreate extends { slug: string },
  TUpdate extends { slug?: string },
> {
  list(params: ListContentParams): Promise<Paginated<TModel>>;
  findById(id: string): Promise<TModel | null>;
  findBySlug(slug: string): Promise<TModel | null>;
  existsSlug(slug: string, excludeId?: string): Promise<boolean>;
  create(data: TCreate): Promise<TModel>;
  update(id: string, data: TUpdate): Promise<TModel>;
  delete(id: string): Promise<void>;
}
