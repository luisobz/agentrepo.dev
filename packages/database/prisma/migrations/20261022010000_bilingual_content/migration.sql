ALTER TABLE "Skill" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'en', ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}', ADD CONSTRAINT "Skill_sourceLocale_check" CHECK ("sourceLocale" IN ('en', 'es'));
ALTER TABLE "Agent" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'en', ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}', ADD CONSTRAINT "Agent_sourceLocale_check" CHECK ("sourceLocale" IN ('en', 'es'));
ALTER TABLE "BlogPost" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'en', ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}', ADD CONSTRAINT "BlogPost_sourceLocale_check" CHECK ("sourceLocale" IN ('en', 'es'));
ALTER TABLE "SkillVersion" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'en', ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}', ADD CONSTRAINT "SkillVersion_sourceLocale_check" CHECK ("sourceLocale" IN ('en', 'es'));
ALTER TABLE "AgentVersion" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'en', ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}', ADD CONSTRAINT "AgentVersion_sourceLocale_check" CHECK ("sourceLocale" IN ('en', 'es'));

-- Keep the existing GIN index usable for both source and translated prose.
CREATE OR REPLACE FUNCTION public.skill_search_vector_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  NEW."searchVector" :=
    to_tsvector('english', coalesce(NEW."title", '') || ' ' || coalesce(NEW."description", '') || ' ' || coalesce(NEW."content", '') || ' ' || coalesce(NEW."translations"->>'en', '')) ||
    to_tsvector('spanish', coalesce(NEW."title", '') || ' ' || coalesce(NEW."description", '') || ' ' || coalesce(NEW."content", '') || ' ' || coalesce(NEW."translations"->>'es', ''));
  RETURN NEW;
END;
$$;
UPDATE public."Skill" SET "searchVector" = "searchVector";

-- Keep the existing GIN index usable for both source and translated prose.
CREATE OR REPLACE FUNCTION public.agent_search_vector_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  NEW."searchVector" :=
    to_tsvector('english', coalesce(NEW."title", '') || ' ' || coalesce(NEW."shortDescription", '') || ' ' || coalesce(NEW."readmeContent", '') || ' ' || coalesce(NEW."translations"->>'en', '')) ||
    to_tsvector('spanish', coalesce(NEW."title", '') || ' ' || coalesce(NEW."shortDescription", '') || ' ' || coalesce(NEW."readmeContent", '') || ' ' || coalesce(NEW."translations"->>'es', ''));
  RETURN NEW;
END;
$$;
UPDATE public."Agent" SET "searchVector" = "searchVector";

-- Keep the existing GIN index usable for both source and translated prose.
CREATE OR REPLACE FUNCTION public.blogpost_search_vector_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  NEW."searchVector" :=
    to_tsvector('english', coalesce(NEW."title", '') || ' ' || coalesce(NEW."excerpt", '') || ' ' || coalesce(NEW."content", '') || ' ' || coalesce(NEW."translations"->>'en', '')) ||
    to_tsvector('spanish', coalesce(NEW."title", '') || ' ' || coalesce(NEW."excerpt", '') || ' ' || coalesce(NEW."content", '') || ' ' || coalesce(NEW."translations"->>'es', ''));
  RETURN NEW;
END;
$$;
UPDATE public."BlogPost" SET "searchVector" = "searchVector";
