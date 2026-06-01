import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// explicit pool sizing. default max is 10 - feed/recs fire several queries in
// parallel, so a burst of concurrent users could queue behind 10 connections.
// 20 stays well under postgres's default max_connections (100). timeout so a
// request fails fast instead of hanging if the pool is saturated
const pool = new Pool({
  connectionString,
  max: 20,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
