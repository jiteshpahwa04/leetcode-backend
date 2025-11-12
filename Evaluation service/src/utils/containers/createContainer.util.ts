import logger from "../../config/logger.config";
import Docker from "dockerode";

export interface CreateContainerOptions {
    imageName: string;
    cmdExecutable: string[];
    memoryLimit: number; // in bytes
}

export async function createNewDockerContainer(options: CreateContainerOptions) {
    try {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: options.imageName,
            Cmd: options.cmdExecutable,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false, // Disable TTY to capture output correctly, TTY means pseudo-terminal, TTY full form is teletypewriter(old slang)
            OpenStdin: true,
            HostConfig: {
                Memory: options.memoryLimit,
                PidsLimit: 100, // Limit the number of processes in the container
                CpuQuota: 50000, // Limit CPU usage (50% of a single CPU)
                CpuPeriod: 100000, // CPU period for quota
                SecurityOpt: ["no-new-privileges"], // Prevent privilege escalation
                NetworkMode: "none" // Disable networking for security
            }
        });

        logger.info(`Docker container created with ID: ${container.id}`);

        return container;
    } catch (error) {
        logger.error(`Error creating Docker container: ${error}`);
        return null;   
    }
}