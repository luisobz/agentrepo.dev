-- Optional editorial references; existing entries retain an empty list.
-- No new tables, grants or policies: existing content access controls apply.
ALTER TABLE "Skill" ADD COLUMN "relatedLinks" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Agent" ADD COLUMN "relatedLinks" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "BlogPost" ADD COLUMN "relatedLinks" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_relatedLinks_array" CHECK (jsonb_typeof("relatedLinks") = 'array' AND jsonb_array_length("relatedLinks") <= 12);
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_relatedLinks_array" CHECK (jsonb_typeof("relatedLinks") = 'array' AND jsonb_array_length("relatedLinks") <= 12);
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_relatedLinks_array" CHECK (jsonb_typeof("relatedLinks") = 'array' AND jsonb_array_length("relatedLinks") <= 12);
