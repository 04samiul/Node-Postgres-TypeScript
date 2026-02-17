import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Express } from "express";
import { pool } from "./db";

const PgStore = connectPgSimple(session);

const databaseUrl = process.env.SUPABASE_URL;

export function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgStore({
        pool: pool,
        createTableIfMissing: true,
        schemaName: 'public',
        tableName: 'session',
        errorLog: (err) => {
          // Filter out SSL certificate warnings in the logs
          if (err.code !== 'SELF_SIGNED_CERT_IN_CHAIN' && err.message !== 'self-signed certificate in certificate chain') {
            console.error('Session Store Error:', err);
          }
        },
        // Using pool instead of conString to share the SSL-configured connection
        pruneSessionInterval: 60 * 15 // 15 minutes
      } as any),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      },
    })
  );
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
