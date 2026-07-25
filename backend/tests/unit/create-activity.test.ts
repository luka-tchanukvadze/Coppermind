import { describe, it, expect } from "vitest";
import { progressToActivityKind } from "../../src/utils/createActivity.js";
import { ActivityKind, Progress } from "../../generated/prisma/index.js";

// A plain function, so no database is needed. If this mapping is wrong, the feed
// shows the wrong thing (like "finished a book" when I only wanted to read it),
// and nothing would crash to warn me. That is the kind of quiet bug a test catches.

describe("progressToActivityKind", () => {
  it("maps WANT_TO_READ to WANTS_TO_READ", () => {
    expect(progressToActivityKind(Progress.WANT_TO_READ)).toBe(
      ActivityKind.WANTS_TO_READ,
    );
  });

  it("maps READING to STARTED_READING", () => {
    expect(progressToActivityKind(Progress.READING)).toBe(
      ActivityKind.STARTED_READING,
    );
  });

  it("maps READ to FINISHED_BOOK", () => {
    expect(progressToActivityKind(Progress.READ)).toBe(
      ActivityKind.FINISHED_BOOK,
    );
  });
});

/*
  Could add later, not needed now:
  - truncate() in feedController.ts: test text that is shorter, equal, and longer
    than the limit. The "..." cutoff is easy to get off by one.
  - APIFeatures: test that it ignores unknown fields and limits the page size.

  Not worth a unit test: createActivity() itself. It just wraps a prisma call in
  a try/catch. Checking that it really writes a feed row is better as an
  integration test.
*/
