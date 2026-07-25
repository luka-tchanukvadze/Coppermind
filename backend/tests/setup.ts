// Must be first. This loads the test settings before prisma is imported.
import "./load-env.js";

import { beforeAll, beforeEach, afterAll } from "vitest";
import prisma from "../src/prisma.js";
import { assertTestDatabase, resetDb } from "./helpers/db.js";

// This file runs once for every test file.

beforeAll(async () => {
  assertTestDatabase(); // safety check before we touch the database
  await prisma.$connect();
});

// Clear the database before each test, not after. If a test fails, its data is
// still there to look at, and the next test starts clean either way. Doing it
// before every test also keeps tests separate, so no test depends on another one.
beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect(); // close the connection so the program can exit
});
