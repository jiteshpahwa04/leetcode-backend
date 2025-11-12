import Docker from "dockerode";
import logger from "../../config/logger.config";
import { PYTHON_IMAGE } from "../constants";

export async function pullImage(image: string) {
    const docker = new Docker();
    
    return new Promise((res, rej) => {
        docker.pull(image, (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) {
                return rej(err);
            }

            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err: Error | null, output: any) {
                if (err) {
                    return rej(err);
                }

                res(output);
            }

            function onProgress(event: any) {
                logger.info(`Pulling image ${image}: ${JSON.stringify(event)}`);
            }
        })
    })
}

export async function pullAllImages() {
    const images = [PYTHON_IMAGE];

    const promises = images.map(img => pullImage(img));
    try {
        const results = await Promise.all(promises);
        logger.info(`All images pulled successfully: ${JSON.stringify(results)}`);
    } catch (error) {
        logger.error(`Error pulling images: ${error}`);
    }
}