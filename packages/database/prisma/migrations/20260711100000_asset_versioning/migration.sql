-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "latestVersionId" TEXT,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0.0';

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "latestVersionId" TEXT;

-- CreateTable
CREATE TABLE "SkillVersion" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "changelog" TEXT,
    "downloadsTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillVersionDownloadDay" (
    "versionId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillVersionDownloadDay_pkey" PRIMARY KEY ("versionId","day")
);

-- CreateTable
CREATE TABLE "AgentVersion" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "readmeContent" TEXT,
    "fileTree" JSONB NOT NULL,
    "changelog" TEXT,
    "downloadsTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentVersionDownloadDay" (
    "versionId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AgentVersionDownloadDay_pkey" PRIMARY KEY ("versionId","day")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_latestVersionId_key" ON "Skill"("latestVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_latestVersionId_key" ON "Agent"("latestVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillVersion_skillId_version_key" ON "SkillVersion"("skillId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_agentId_version_key" ON "AgentVersion"("agentId", "version");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "SkillVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillVersion" ADD CONSTRAINT "SkillVersion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillVersionDownloadDay" ADD CONSTRAINT "SkillVersionDownloadDay_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SkillVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "AgentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentVersionDownloadDay" ADD CONSTRAINT "AgentVersionDownloadDay_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "AgentVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: snapshot every existing skill as its 1.0.0 release and tag it latest.
INSERT INTO "SkillVersion" ("id", "skillId", "version", "content", "changelog", "createdAt")
SELECT gen_random_uuid(), s."id", s."version", s."content", NULL, s."createdAt"
FROM "Skill" s;

UPDATE "Skill" s
SET "latestVersionId" = v."id"
FROM "SkillVersion" v
WHERE v."skillId" = s."id" AND v."version" = s."version";

-- Backfill: snapshot every existing agent under its current version string.
INSERT INTO "AgentVersion" ("id", "agentId", "version", "readmeContent", "fileTree", "changelog", "createdAt")
SELECT gen_random_uuid(), a."id", a."version", a."readmeContent", a."fileTree", NULL, a."createdAt"
FROM "Agent" a;

UPDATE "Agent" a
SET "latestVersionId" = v."id"
FROM "AgentVersion" v
WHERE v."agentId" = a."id" AND v."version" = a."version";
