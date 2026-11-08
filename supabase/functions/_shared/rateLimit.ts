import { Ratelimit } from "npm:@upstash/ratelimit";
import { Redis } from "npm:@upstash/redis";

const redis = Redis.fromEnv();

type RateLimitConfig = {
  limit: number;
  window: string;
  prefix: string;
};

export function createRateLimiter({
  limit,
  window,
  prefix,
}: RateLimitConfig) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix,
    analytics: false,
  });
}