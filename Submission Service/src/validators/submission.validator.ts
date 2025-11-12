import { z } from "zod";
import { SubmissionLanguage } from "../models/submission.model";

export const CreateSubmissionSchema = z.object({
    problemId: z.string().min(1),
    code: z.string().min(1),
    language: z.enum(Object.values(SubmissionLanguage) as [string, ...string[]])
});

export const UpdateSubmissionStatusSchema = z.object({
    status: z.enum(['PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR'])
});