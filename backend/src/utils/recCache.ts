import prisma from "../prisma.js";
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

// cascade: bust this user's cache AND all their accepted friends' caches
// my shelf changing affects what my friends see (I'm now in/out of their
// "friends have this" pool). without this, friends see stale recs until TTL
export async function invalidateRecsForUserAndFriends(userId: string) {
  try {
    const friendships = await prisma.friendConnection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const friendIds = friendships.map((c) =>
      c.requesterId === userId ? c.addresseeId : c.requesterId,
    );
    await invalidateRecs(userId, ...friendIds);
  } catch (err) {
    console.error("Failed to cascade rec invalidation:", err);
  }
}
