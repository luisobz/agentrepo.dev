CREATE TABLE "ContentViewDay" (
  "kind" TEXT NOT NULL CHECK ("kind" IN ('skill', 'agent', 'blog')),
  "contentId" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0 CHECK ("count" >= 0),
  CONSTRAINT "ContentViewDay_pkey" PRIMARY KEY ("kind", "contentId", "day")
);
CREATE INDEX "ContentViewDay_day_idx" ON "ContentViewDay"("day");
ALTER TABLE "ContentViewDay" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "ContentViewDay" FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "ContentViewDay" FROM anon;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "ContentViewDay" FROM authenticated;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'agentrepo_prisma') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ContentViewDay" TO agentrepo_prisma;
  END IF;
END $$;
