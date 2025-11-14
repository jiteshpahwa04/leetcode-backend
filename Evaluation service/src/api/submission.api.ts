import axios from "axios";
import { serverConfig } from "../config";
import logger from "../config/logger.config";

export async function updateSubmission(submissionId:string, status: string, output: string) {
    try {
        logger.info(`Updating submission ${submissionId} with status: ${status} and output: ${output}`);
        const url = `${serverConfig.SUBMISSION_SERVICE_URL}/submissions/${submissionId}/status`;
        const response = await axios.patch(url, 
            {
                status,
                output
            }
        );

        if (response.status !== 200) {
            logger.error(`Failed to update submission ${submissionId}. Status code: ${response.status}`);
        } else {
            logger.info(`Successfully updated submission ${submissionId}`);
        }
        return;
    } catch (error) {
        logger.error(`Error updating submission ${submissionId}: ${error}`);   
    }
}