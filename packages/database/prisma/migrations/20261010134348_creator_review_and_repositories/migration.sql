-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "repositoryUrl" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "authorId" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Trigger functions are internal; pin resolution rather than inheriting a caller search_path.
ALTER FUNCTION public.agent_search_vector_update() SET search_path = pg_catalog, public;
ALTER FUNCTION public.skill_search_vector_update() SET search_path = pg_catalog, public;
ALTER FUNCTION public.blogpost_search_vector_update() SET search_path = pg_catalog, public;
