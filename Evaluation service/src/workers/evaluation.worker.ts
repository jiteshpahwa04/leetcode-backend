import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob, EvaluationResult, Testcase } from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";

const matchTestCasesWithResults = (testcases: Testcase[], evaluationResults: EvaluationResult[]) => {
    const output:string[] = [];

    if (testcases.length !== evaluationResults.length) {
        console.log("Mismatch in number of testcases and evaluation results");
        return;
    }

    testcases.map((testcase, index) => {
        if (evaluationResults[index].status === 'TLE') {
            output.push('TLE');
        } else if (evaluationResults[index].status === 'failed' ) {
            output.push('ERROR');
        } else {
            if (evaluationResults[index].output?.trim() === testcase.output.trim()) {
                output.push('AC');
            } else {
                output.push('WA');
            }
        }
    });

    return output;
}

async function setupEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => {
        logger.info(`Processing submission job ${job.id}`);
        const data: EvaluationJob = job.data;
        console.log("Evaluation job data:", data);
        try {
            const testCasesRunnerPromise = data.problem.testcases.map(testcase => {
                return runCode({
                    code: data.code,
                    language: data.language,
                    timeout: LANGUAGE_CONFIG[data.language].timeout,
                    imageName: LANGUAGE_CONFIG[data.language].imageName,
                    input: testcase.input,
                    output: testcase.output
                });
            });

            const testCasesResults = await Promise.all(testCasesRunnerPromise);

            logger.info(`Test cases results for job ${job.id}: ${JSON.stringify(testCasesResults)}`);

            const finalResults = matchTestCasesWithResults(data.problem.testcases, testCasesResults);

            logger.info(`Final evaluation results for job ${job.id}: ${JSON.stringify(finalResults)}`);
        } catch (error) {
            logger.error(`Error processing submission job ${job.id}: ${(error as Error).message}`);
            return;
        }
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