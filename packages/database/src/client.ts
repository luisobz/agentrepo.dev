import { PrismaClient as PrismaClientClass } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { BackendEnvironments } from "@agentrepo/config";

BackendEnvironments.load();
const adapter = new PrismaPg({ connectionString: BackendEnvironments.DATABASE_URL })
export const prisma = new PrismaClientClass({ adapter });
export type PrismaClient = typeof prisma;