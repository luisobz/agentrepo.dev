import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: "../../../.env" });

export default defineConfig({
  schema: "./schema.prisma",
  migrations: {
    path: "./migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
