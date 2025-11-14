import { NextFunction, Request, Response } from "express";
import { SubmissionRepository } from "../repositories/submission.repository";
import { SubmissionService } from "../services/submission.service";

const submissionRepository = new SubmissionRepository();
const submissionService = new SubmissionService(submissionRepository);
export const submissionController = {
    createSubmission: async (req: Request, res: Response, next: NextFunction) => {
        const submissionData = req.body;
        await submissionService.createSubmission(submissionData);
        res.status(201).json({ 
            message: "Submission created successfully" 
        });
    },
    getSubmissionById: async (req: Request, res: Response, next: NextFunction) => {
        const submissionId = req.params.id;
        const submission = await submissionService.getSubmissionById(submissionId);
        res.status(200).json({ 
            data: submission 
        });
    },
    findByProblemId: async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        const submissions = await submissionService.findByProblemId(problemId);
        res.status(200).json({
            data: submissions
        });
    },
    deleteById: async (req: Request, res: Response, next: NextFunction) => {
        const submissionId = req.params.id;
        await submissionService.deleteById(submissionId);
        res.status(200).json({
            message: "Submission deleted successfully"
        });
    },
    updateSubmissionStatus: async (req: Request, res: Response, next: NextFunction) => {
        const submissionId = req.params.id;
        const { status, output } = req.body;
        const updatedSubmission = await submissionService.updateSubmissionStatus(submissionId, status, output);
        res.status(200).json({
            data: updatedSubmission
        });
    }
};