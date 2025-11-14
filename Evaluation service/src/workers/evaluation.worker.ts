import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob } from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";

async function setupEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => {
        logger.info(`Processing submission job ${job.id}`);
        const data: EvaluationJob = job.data;
        console.log("Evaluation job data:", data);

        const result = await runCode({
            code: data.code,
            language: data.language,
            input: data.problem.testcases[0].input,
            timeout: LANGUAGE_CONFIG[data.language].timeout,
            imageName: LANGUAGE_CONFIG[data.language].imageName,
            output: data.problem.testcases[0].output
        });

        console.log("Evaluation result:", result);
    }, {
        connection: createNewRedisConnection()
    })
    worker.on("completed", (job) => {
        logger.info(`Submission job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
        logger.error(`Submission job ${job?.id} failed with error: ${err.message}`);
    });

    worker.on("error", (err) => {
        logger.error(`Worker encountered an error: ${err.message}`);
    });
}

export async function startWorkers() {
    await setupEvaluationWorker();
    logger.info("Evaluation worker started");
}