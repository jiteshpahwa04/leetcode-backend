import logger from "../../config/logger.config";
import { commands } from "./commands.util";
import { createNewDockerContainer } from "./createContainer.util";

export interface RunCodeOptions {
    code: string;
    language: 'python' | 'cpp';
    timeout: number; // in milliseconds
    imageName: string;
    input: string;
}

export async function runCode(options: RunCodeOptions): Promise<void> {
    const timeout = options.timeout;

    const container = await createNewDockerContainer({
        imageName: options.imageName,
        cmdExecutable: commands[options.language](options.code, options.input),
        memoryLimit: 128 * 1024 * 1024 // 128 MB
    });

    const timeLimitExceededTimeout = setTimeout(() => {
       logger.error(`Container execution exceeded time limit of ${timeout} ms. Stopping container.`);
       container?.kill();
    }, timeout);

    await container?.start();

    const status = await container?.wait();

    logger.info(`Container exited with status code: ${status?.StatusCode}`);

    const logs = await container?.logs({
        stdout: true,
        stderr: true,
    });

    const sampleOutput = "36";

    const containerLogs = processLogs(logs);

    console.log("Is Output Correct?: ", containerLogs.includes(sampleOutput));

    await container?.remove();

    clearTimeout(timeLimitExceededTimeout);

    if (status?.StatusCode !== 0) {
        logger.info(`${options.language} code execution failed inside the Docker container.`);
    } else {
        logger.info(`${options.language} code executed successfully inside the Docker container.`);
    }
}

function processLogs(logs: Buffer | undefined) {
    if (!logs) {
        return "";
    }
    
    return logs.toString('utf-8')
        .replace(/\x00/g, '') // Remove null characters
        .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '') // Remove control characters except \n (0x0A)
        .trim();
}