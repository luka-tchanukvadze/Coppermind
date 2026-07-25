import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// This file loads the test settings, and it has to run before prisma loads.
// prisma reads the database URL the moment it is imported, and imports always
// run first in a file. So if this code sat next to the prisma import, prisma
// would connect to the real database before the test settings were ready.
// Keeping it in its own file means it finishes first.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const testEnvPath = path.join(repoRoot, ".env.test");

if (fs.existsSync(testEnvPath)) {
  // Local machine: load the normal .env first for shared values like
  // JWT_SECRET, then load .env.test on top so its database URL replaces the
  // real one. The order matters.
  dotenv.config({ path: path.join(repoRoot, ".env"), override: false, quiet: true });
  dotenv.config({ path: testEnvPath, override: true, quiet: true });
} else if (!process.env.DATABASE_URL) {
  // No .env.test file AND no database URL from the environment. That is a real
  // misconfiguration, so stop. (On the CI server there is no .env.test, but the
  // workflow sets DATABASE_URL itself, so that case skips this and is fine.)
  throw new Error(
    `.env.test not found at ${testEnvPath} and DATABASE_URL is not set.\n` +
      `add: DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/coppermind_test"`,
  );
}

process.env.NODE_ENV = "test";

// Fallback values so the tests also work on the CI server, where there is no
// .env file at all. These are fake values, not real secrets.
process.env.JWT_SECRET ??= "test-secret-not-used-outside-tests";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.JWT_COOKIE_EXPIRES ??= "1";
