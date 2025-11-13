import logger from "../../config/logger.config";
import { PYTHON_IMAGE } from "../constants";
import { createNewDockerContainer } from "./createContainer.util";

export async function runPythonCode(pythonCode: string): Promise<void> {
    const runCommand = `echo '${pythonCode}' > code.py && python3 code.py`;

    const container = await createNewDockerContainer({
        imageName: PYTHON_IMAGE,
        cmdExecutable: ['/bin/bash', '-c', runCommand],
        memoryLimit: 128 * 1024 * 1024 // 128 MB
    });

    await container?.start();

    const status = await container?.wait();

    logger.info(`Container exited with status code: ${status?.StatusCode}`);

    const logs = await container?.logs({
        stdout: true,
        stderr: true,
    });

    logger.info(`Container logs:\n${logs?.toString()}`);

    await container?.remove();
}