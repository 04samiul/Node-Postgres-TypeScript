import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.SUPABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("SUPABASE_URL or DATABASE_URL must be set");
}

const connectionUrl = dbUrl.includes('?') 
  ? `${dbUrl}&sslmode=no-verify` 
  : `${dbUrl}?sslmode=no-verify`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
