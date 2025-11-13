import logger from "../../config/logger.config";
import { PYTHON_IMAGE } from "../constants";
import { commands } from "./commands.util";
import { createNewDockerContainer } from "./createContainer.util";

export interface RunCodeOptions {
    code: string;
    language: 'python';
    timeout: number; // in milliseconds
}

export async function runCode(options: RunCodeOptions): Promise<void> {
    const timeout = options.timeout;
    
    const container = await createNewDockerContainer({
        imageName: PYTHON_IMAGE,
        cmdExecutable: commands[options.language](options.code),
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

    logger.info(`Container logs:\n${logs?.toString()}`);

    await container?.remove();

    clearTimeout(timeLimitExceededTimeout);

    if (status?.StatusCode !== 0) {
        logger.info("Python code execution failed inside the Docker container.");
    } else {
        logger.info("Python code executed successfully inside the Docker container.");
    }
}