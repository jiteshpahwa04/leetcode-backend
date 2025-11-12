import { Queue, QueueEvents } from "bullmq";
import { createNewRedisConnection } from "../config/redis.config";
import logger from "../config/logger.config";

export const submissionQueue = new Queue("submission", {
    connection: createNewRedisConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        }
    }
});

submissionQueue.on("error", (error) => {
    logger.error("Submission Queue Error:", error);
});

submissionQueue.on("waiting", (jobId) => {
    logger.info(`Job ${jobId} is waiting to be processed`);
});

// On consumer:
export const submissionEvent = new QueueEvents("submission");

submissionEvent.on("completed", ({ jobId }) => {
    logger.info(`Job ${jobId} has been completed`);
});

submissionEvent.on("failed", ({ jobId, failedReason }) => {
    logger.error(`Job ${jobId} has failed with reason: ${failedReason}`);
});