import { z } from "zod";

export const CreateSubmissionSchema = z.object({
    problemId: z.string().uuid(),
    code: z.string().min(1),
    language: z.string().min(2).max(100)
});

export const UpdateSubmissionStatusSchema = z.object({
    status: z.enum(['PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR'])
});