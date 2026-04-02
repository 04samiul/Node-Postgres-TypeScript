import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.SUPABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_URL must be set. Provide your Supabase database connection string.",
  );
}
//17 to 26 is replit code
// Use connection string directly with ssl disabled for initial pool if needed, 
// but preferred way for Supabase is letting the driver handle it via connectionString.
//const connectionString = databaseUrl.includes('?') 
  //? `${databaseUrl}&sslmode=no-verify` 
  //: `${databaseUrl}?sslmode=no-verify`;

//export const pool = new Pool({ 
 // connectionString,
//  max: 20,
 // idleTimeoutMillis: 30000,
//  connectionTimeoutMillis: 5000 // Increased timeout
//});

// sslmode=require এবং pgbouncer=true যোগ করা হয়েছে by GEMENI (28 to 38)
const connectionString = databaseUrl.includes('?') 
  ? `${databaseUrl}&sslmode=require&pgbouncer=true` 
  : `${databaseUrl}?sslmode=require&pgbouncer=true`;

export const pool = new Pool({
  connectionString,
  max: 10, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // ৫ সেকেন্ড থেকে বাড়িয়ে ১০ সেকেন্ড করুন
});
export const db = drizzle(pool, { schema });
