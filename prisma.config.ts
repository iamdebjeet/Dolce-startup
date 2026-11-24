import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations use DIRECT_URL when set (e.g. Neon's non-pooled URL); the app itself uses DATABASE_URL.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "" },
});
