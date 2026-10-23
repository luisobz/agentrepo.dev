-- CreateTable
CREATE TABLE "PrivateSkill" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrivateSkill_ownerId_updatedAt_idx" ON "PrivateSkill"("ownerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateSkill_ownerId_slug_key" ON "PrivateSkill"("ownerId", "slug");

-- AddForeignKey
ALTER TABLE "PrivateSkill" ADD CONSTRAINT "PrivateSkill_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Private documents are accessible only through the owner-scoped backend.
ALTER TABLE public."PrivateSkill" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."PrivateSkill" FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agentrepo_prisma') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."PrivateSkill" TO agentrepo_prisma;
  END IF;
END $$;
