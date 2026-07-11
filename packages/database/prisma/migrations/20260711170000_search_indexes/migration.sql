-- Trigram extension for indexed ILIKE '%term%' (admin substring search).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Full-text search vectors (public search) ───────────────────────────────
-- A trigger-maintained tsvector column + GIN index turns the public search
-- from a per-row to_tsvector() computed at query time (full-table scan) into an
-- index scan. A trigger (rather than a STORED generated column) keeps the
-- column representable as a plain Prisma `Unsupported("tsvector")?` with no
-- schema drift. 'english' matches the previous default text-search config.

-- Skill: title + description + content
ALTER TABLE "Skill" ADD COLUMN "searchVector" tsvector;
CREATE OR REPLACE FUNCTION "skill_search_vector_update"() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english',
    coalesce(NEW."title", '') || ' ' ||
    coalesce(NEW."description", '') || ' ' ||
    coalesce(NEW."content", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "skill_search_vector_trg" BEFORE INSERT OR UPDATE ON "Skill"
  FOR EACH ROW EXECUTE FUNCTION "skill_search_vector_update"();
UPDATE "Skill" SET "searchVector" = to_tsvector('english',
  coalesce("title", '') || ' ' || coalesce("description", '') || ' ' || coalesce("content", ''));
CREATE INDEX "Skill_searchVector_idx" ON "Skill" USING GIN ("searchVector");

-- Agent: title + shortDescription + readmeContent
ALTER TABLE "Agent" ADD COLUMN "searchVector" tsvector;
CREATE OR REPLACE FUNCTION "agent_search_vector_update"() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english',
    coalesce(NEW."title", '') || ' ' ||
    coalesce(NEW."shortDescription", '') || ' ' ||
    coalesce(NEW."readmeContent", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "agent_search_vector_trg" BEFORE INSERT OR UPDATE ON "Agent"
  FOR EACH ROW EXECUTE FUNCTION "agent_search_vector_update"();
UPDATE "Agent" SET "searchVector" = to_tsvector('english',
  coalesce("title", '') || ' ' || coalesce("shortDescription", '') || ' ' || coalesce("readmeContent", ''));
CREATE INDEX "Agent_searchVector_idx" ON "Agent" USING GIN ("searchVector");

-- BlogPost: title + excerpt + content
ALTER TABLE "BlogPost" ADD COLUMN "searchVector" tsvector;
CREATE OR REPLACE FUNCTION "blogpost_search_vector_update"() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english',
    coalesce(NEW."title", '') || ' ' ||
    coalesce(NEW."excerpt", '') || ' ' ||
    coalesce(NEW."content", ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "blogpost_search_vector_trg" BEFORE INSERT OR UPDATE ON "BlogPost"
  FOR EACH ROW EXECUTE FUNCTION "blogpost_search_vector_update"();
UPDATE "BlogPost" SET "searchVector" = to_tsvector('english',
  coalesce("title", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("content", ''));
CREATE INDEX "BlogPost_searchVector_idx" ON "BlogPost" USING GIN ("searchVector");

-- ─── Trigram indexes (admin ILIKE substring search) ─────────────────────────
-- Names follow Prisma's default @@index naming so the schema stays drift-free.
CREATE INDEX "Skill_title_idx" ON "Skill" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Skill_slug_idx" ON "Skill" USING GIN ("slug" gin_trgm_ops);
CREATE INDEX "Skill_description_idx" ON "Skill" USING GIN ("description" gin_trgm_ops);

CREATE INDEX "Agent_title_idx" ON "Agent" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Agent_slug_idx" ON "Agent" USING GIN ("slug" gin_trgm_ops);
CREATE INDEX "Agent_shortDescription_idx" ON "Agent" USING GIN ("shortDescription" gin_trgm_ops);

CREATE INDEX "BlogPost_title_idx" ON "BlogPost" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost" USING GIN ("slug" gin_trgm_ops);
CREATE INDEX "BlogPost_excerpt_idx" ON "BlogPost" USING GIN ("excerpt" gin_trgm_ops);
