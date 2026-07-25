import prisma from "../../src/prisma.js";

// The tests are only allowed to touch a database with this exact name. It is
// written here in the code on purpose, not read from a setting. If it came from
// the same file as the database URL, one bad file could point both at the real
// database, and the check would still pass.
const REQUIRED_DB_NAME = "coppermind_test";

// resetDb() empties every table. If the database URL ever pointed at the real
// database by mistake, this check stops the tests before anything is deleted.
export function assertTestDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Is .env.test missing?");

  // Read the real database name out of the URL and compare it. We check the name
  // itself, not just look for "test" in the text, so a password that happens to
  // contain "test" cannot slip through.
  let dbName: string;
  try {
    dbName = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  if (dbName !== REQUIRED_DB_NAME) {
    throw new Error(
      `Refusing to run. The tests delete everything, so they only run on ` +
        `"${REQUIRED_DB_NAME}", but the database URL points at "${dbName}". Check .env.test.`,
    );
  }

  // Also make sure the database is on this computer, never a remote one.
  const host = new URL(url).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Refusing to run against the remote host "${host}". Tests only run locally.`,
    );
  }
}

// Empty every table between tests. We use TRUNCATE because it is fast. We ask
// postgres for the table names instead of listing them by hand, so this keeps
// working when the schema changes. We skip _prisma_migrations, because deleting
// it would make prisma think the database has no tables at all.
export async function resetDb() {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;
  if (rows.length === 0) return;

  // RESTART IDENTITY resets the id counters. CASCADE handles tables that link
  // to each other, so the order does not matter.
  const tables = rows.map((r) => `"public"."${r.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`,
  );
}
