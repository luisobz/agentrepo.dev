-- CreateTable
CREATE TABLE "PlaygroundToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 5,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaygroundToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaygroundDeployment" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaygroundDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaygroundToken_token_key" ON "PlaygroundToken"("token");

-- CreateIndex
CREATE INDEX "PlaygroundDeployment_createdAt_idx" ON "PlaygroundDeployment"("createdAt");

-- AddForeignKey
ALTER TABLE "PlaygroundDeployment" ADD CONSTRAINT "PlaygroundDeployment_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "PlaygroundToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
