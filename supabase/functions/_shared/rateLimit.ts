import {RateLimit} from "npm:@upstash/ratelimit";
import {Redis} from "npm:@upstash/redis";


const redis=Redis.fromEnv();

type RateLimitConfig={
limit:number;
weindow:string;
prefix:string;
};

export function createRatelimiter(
    {
        limit,
        window,
        prefix,
    }
):RateLimitConfig{

return createLimiter({
    Redis,
    limiter:RateLimiter.slidingWindows(limit,windows);
    prefix,
    analytics:false,
});



};
