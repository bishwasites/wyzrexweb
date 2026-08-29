import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

declare global {
  // eslint-disable-next-line no-var
  var __wyzrexPool: Pool | undefined;
}

// Reuse the pool across hot reloads in dev so we don't exhaust connections.
const pool =
  global.__wyzrexPool ??
  new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__wyzrexPool = pool;
}

export const db = drizzle(pool, { schema });
