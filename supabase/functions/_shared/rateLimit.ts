import {RateLimit} from "npm:@upstash/ratelimit";
import {Redis} from "npm:@upstash/redis";

type RateLimitConfig={
limit:number;
weindow:string;
prefix:string;
};

