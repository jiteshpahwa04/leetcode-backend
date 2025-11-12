import Redis from "ioredis";
import { serverConfig } from ".";
import logger from "./logger.config";

const redisConfig = {
    host: serverConfig.REDIS_HOST,
    port: serverConfig.REDIS_PORT,
    maxRetriesPerRequest: null
}

export const redis = new Redis(redisConfig);

redis.on("connect", () => {
    logger.info("Connected to Redis successfully");
});

redis.on("error", (err) => {
    logger.error("Redis connection error:", err);
});

export const createNewRedisConnection = () => {
    return new Redis(redisConfig);
}