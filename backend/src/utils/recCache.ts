import redisClient from "../redisClient.js";

export const recsCacheKey = (userId: string) => `recs:${userId}`;

// fire-and-forget. swallow errors so cache hiccups don't break the user's action
export async function invalidateRecs(...userIds: string[]) {
  try {
    if (userIds.length === 0) return;
    await Promise.all(userIds.map((id) => redisClient.del(recsCacheKey(id))));
  } catch (err) {
    console.error("Failed to invalidate recs cache:", err);
  }
}
