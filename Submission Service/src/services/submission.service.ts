import { getProblemById } from "../apis/problem.api";
import logger from "../config/logger.config";
import { ISubmission, SubmissionStatus } from "../models/submission.model";
import { addSubmissionJob } from "../producers/submission.producer";
import { ISubmissionRepository } from "../repositories/submission.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export interface ISubmissionService {
    createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission>;
    getSubmissionById(submissionId: string): Promise<ISubmission | null>;
    findByProblemId(problemId: string): Promise<ISubmission[]>;
    deleteById(submissionId: string): Promise<boolean>;
    updateSubmissionStatus(submissionId: string, status: SubmissionStatus): Promise<ISubmission | null>;
    getSubmissionsByStatus(status: SubmissionStatus, limit: number): Promise<ISubmission[]>;
}

export class SubmissionService implements ISubmissionService {
    private submissionRepository: ISubmissionRepository;

    constructor(submissionRepository: ISubmissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    async createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission> {
        // check if problem exists
        if(!submissionData.problemId) {
            throw new BadRequestError("Problem ID is required for submission");
        }

        if(!submissionData.code) {
            throw new BadRequestError("Code is required for submission");
        }

        if(!submissionData.language) {
            throw new BadRequestError("Language is required for submission");
        }

        const problem = await getProblemById(submissionData.problemId);

        if (!problem) {
            throw new NotFoundError(`Problem with ID ${submissionData.problemId} not found`);
        }

        // add the submission payload to the db
        const submission = await this.submissionRepository.createSubmission(submissionData);

        // submission to redis queue for processing
        const jobId = await addSubmissionJob({
            submissionId: submission.id,
            problem,
            code: submission.code,
            language: submission.language
        })

        logger.info(`Submission job added to queue with Job ID: ${jobId} for Submission ID: ${submission.id}`);

        return submission;
    }

    async getSubmissionById(submissionId: string): Promise<ISubmission | null> {
        const submission = await this.submissionRepository.getSubmissionById(submissionId);
        if(!submission) {
            throw new NotFoundError(`Submission with ID ${submissionId} not found`);
        }

        return submission;
    }

    async findByProblemId(problemId: string): Promise<ISubmission[]> {
        const submissions = await this.submissionRepository.findByProblemId(problemId);
        if (!submissions) {
            throw new NotFoundError(`No submissions found for problem ID ${problemId}`);
        }

        return submissions;
    }

    async deleteById(submissionId: string): Promise<boolean> {
        const submission = await this.getSubmissionById(submissionId);
        if (!submission) {
            throw new NotFoundError(`Submission with ID ${submissionId} not found`);
        }

        return await this.submissionRepository.deleteById(submissionId);
    }

    async updateSubmissionStatus(submissionId: string, status: SubmissionStatus): Promise<ISubmission | null> {
        const submission = await this.getSubmissionById(submissionId);
        if (!submission) {
            throw new NotFoundError(`Submission with ID ${submissionId} not found`);
        }

        return await this.submissionRepository.updateSubmissionStatus(submissionId, status);
    }

    async getSubmissionsByStatus(status: SubmissionStatus, limit: number): Promise<ISubmission[]> {
        return await this.submissionRepository.getSubmissionsByStatus(status, limit);
    }
}