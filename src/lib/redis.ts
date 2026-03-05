import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function isRedisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function getRedis() {
  if (!isRedisConfigured()) return null;
  if (redisClient) return redisClient;

  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });

  return redisClient;
}
