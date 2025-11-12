import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";

async function setupEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job) => {
        logger.info(`Processing submission job ${job.id} with data: ${JSON.stringify(job.data)}`);
    }, {
        connection: createNewRedisConnection()
    })
    worker.on("completed", (job) => {
        logger.info(`Submission job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
        logger.error(`Submission job ${job?.id} failed with error: ${err.message}`);
    });
}

export async function startWorkers() {
    await setupEvaluationWorker();
    logger.info("Evaluation worker started");
}