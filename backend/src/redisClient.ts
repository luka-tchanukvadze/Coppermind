import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error(
    "Redis Client Error:",
    err instanceof Error ? err.message : err,
  );
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

export default redisClient;
