import { defineConfig } from "vitest/config";

// Vitest config. Docs: https://vitest.dev/config/
export default defineConfig({
  test: {
    // node, not jsdom - this is a backend suite, there is no browser/DOM here
    environment: "node",

    // which files count as tests
    include: ["backend/tests/**/*.test.ts"],

    // runs ONCE before the whole suite (loads .env.test, guards the DB url)
    // and registers the per-test cleanup hooks
    setupFiles: ["backend/tests/setup.ts"],

    // IMPORTANT: run test files one at a time.
    // by default vitest runs FILES in parallel across worker threads. every
    // file here shares the single coppermind_test database, so parallel files
    // would truncate each other's rows mid-run and give random failures.
    // one DB -> one file at a time. revisit only if the suite gets slow
    // (the fix then is a schema/database per worker, not parallel-on-one-db).
    fileParallelism: false,

    // a hung DB connection shouldn't hang CI forever
    testTimeout: 15000,
    hookTimeout: 20000,
  },
});
