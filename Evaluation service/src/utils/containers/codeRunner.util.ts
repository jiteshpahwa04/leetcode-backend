import logger from "../../config/logger.config";
import { commands } from "./commands.util";
import { createNewDockerContainer } from "./createContainer.util";

export interface RunCodeOptions {
    code: string;
    language: 'python' | 'cpp';
    timeout: number; // in milliseconds
    imageName: string;
    input: string;
    output?: string;
}

export async function runCode(options: RunCodeOptions) {
    const timeout = options.timeout;

    const container = await createNewDockerContainer({
        imageName: options.imageName,
        cmdExecutable: commands[options.language](options.code, options.input),
        memoryLimit: 128 * 1024 * 1024 // 128 MB
    });

    let timeLimitExceeded = false;
    const timeLimitExceededTimeout = setTimeout(() => {
       logger.error(`Container execution exceeded time limit of ${timeout} ms. Stopping container.`);
       timeLimitExceeded = true;
    }, timeout);

    await container?.start();

    const status = await container?.wait();

    if (timeLimitExceeded) {
        await container?.stop();
        await container?.remove();
        await container?.kill();
        clearTimeout(timeLimitExceededTimeout);
        return {
            status: 'TLE',
            output: 'Time Limit Exceeded'
        }
    }

    logger.info(`Container exited with status code: ${status?.StatusCode}`);

    const logs = await container?.logs({
        stdout: true,
        stderr: true,
    });

    const output = options.output ?? "";

    const containerLogs = processLogs(logs);

    console.log("Is Output Correct?: ", containerLogs.includes(output));
    await container?.remove();

    clearTimeout(timeLimitExceededTimeout);

    if (status?.StatusCode !== 0) {
        logger.info(`${options.language} code execution failed inside the Docker container.`);
        return {
            status: timeLimitExceeded ? 'TLE' : 'failed',
            output: containerLogs,
        }
    } else {
        logger.info(`${options.language} code executed successfully inside the Docker container.`);
        return {
            status: 'success',
            output: containerLogs,
        }
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