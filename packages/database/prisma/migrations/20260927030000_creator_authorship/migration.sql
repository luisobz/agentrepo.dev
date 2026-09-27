ALTER TABLE "Skill" ADD COLUMN "authorId" TEXT;
ALTER TABLE "Agent" ADD COLUMN "authorId" TEXT;

CREATE INDEX "Skill_authorId_idx" ON "Skill"("authorId");
CREATE INDEX "Agent_authorId_idx" ON "Agent"("authorId");

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
