import logger from "../config/logger.config";
import { ISubmission, SubmissionModel, SubmissionStatus } from "../models/submission.model";

export interface ISubmissionRepository {
    createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission>;
    getSubmissionById(submissionId: string): Promise<ISubmission | null>;
    findByProblemId(problemId: string): Promise<ISubmission[]>;
    deleteById(submissionId: string): Promise<boolean>;
    updateSubmissionStatus(submissionId: string, status: SubmissionStatus, output: Object): Promise<ISubmission | null>;
    getSubmissionsByStatus(status: SubmissionStatus, limit: number): Promise<ISubmission[]>;
}

export class SubmissionRepository implements ISubmissionRepository {
    constructor() {
        logger.info("SubmissionRepository initialized");
    }

    async createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission> {
        const submission = new SubmissionModel(submissionData);
        return await submission.save();
    }

    async getSubmissionById(submissionId: string): Promise<ISubmission | null> {
        return await SubmissionModel.findById(submissionId).exec();
    }

    async findByProblemId(problemId: string): Promise<ISubmission[]> {
        return await SubmissionModel.find({ problemId }).exec();
    }

    async deleteById(submissionId: string): Promise<boolean> {
        const result = await SubmissionModel.deleteOne({ _id: submissionId }).exec();
        return result.deletedCount === 1;
    }

    async updateSubmissionStatus(submissionId: string, status: SubmissionStatus, output: Record<string, string>): Promise<ISubmission | null> {
        return await SubmissionModel.findByIdAndUpdate(
            submissionId,
            { status, submissionData: output },
            { new: true }
        ).exec();
    }

    async getSubmissionsByStatus(status: SubmissionStatus, limit: number): Promise<ISubmission[]> {
        return await SubmissionModel.find({ status })
            .sort({ createdAt: 1 })
            .limit(limit)
            .exec();
    }
}