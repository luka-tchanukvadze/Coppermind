import prisma from "../prisma.js";
import { ActivityKind, Progress } from "../../generated/prisma/index.js";

interface CreateActivityInput {
  userId: string;
  kind: ActivityKind;
  bookId?: string;
  discussionId?: string;
  commentId?: string;
  customDataId?: string;
}

// fire-and-forget. errors logged, never thrown - the feed is best-effort
// and must not slow or break the user's main action.
export async function createActivity(input: CreateActivityInput) {
  try {
    await prisma.activity.create({ data: input });
  } catch (err) {
    console.error(
      "Failed to create activity:",
      err instanceof Error ? err.message : err,
    );
  }
}

export function progressToActivityKind(progress: Progress): ActivityKind {
  switch (progress) {
    case Progress.WANT_TO_READ:
      return ActivityKind.WANTS_TO_READ;
    case Progress.READING:
      return ActivityKind.STARTED_READING;
    case Progress.READ:
      return ActivityKind.FINISHED_BOOK;
  }
}
