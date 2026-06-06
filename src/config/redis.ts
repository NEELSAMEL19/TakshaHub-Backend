import { Redis } from "@upstash/redis";
import validate from "./validate.js";

export const redis = new Redis({
  url: validate.UPSTASH_REDIS_REST_URL,
  token: validate.UPSTASH_REDIS_REST_TOKEN,
});