import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env")
});

export default defineConfig({
  schema: "./prisma/schema.prisma",

  migrations: {
    path: "./prisma/migrations",
    seed: "tsx ./src/seeds/index.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});