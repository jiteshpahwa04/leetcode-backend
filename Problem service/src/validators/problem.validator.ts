import { z } from "zod";

export const CreateProblemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {message: "Invalid difficulty level"}),
    tags: z.array(z.string()).optional(),
    editorial: z.string().optional(),
    testcases: z.array(z.object({
        input: z.string().min(1, "Testcase input is required"),
        output: z.string().min(1, "Testcase output is required"),
    })).min(1, "At least one testcase is required"),
});

export const UpdateProblemSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {message: "Invalid difficulty level"}).optional(),
    tags: z.array(z.string()).optional(),
    editorial: z.string().optional(),
    testcases: z.array(z.object({
        input: z.string().min(1, "Testcase input is required"),
        output: z.string().min(1, "Testcase output is required"),
    })).optional(),
});

export type CreateProblemDTO = z.infer<typeof CreateProblemSchema>;
export type UpdateProblemDTO = z.infer<typeof UpdateProblemSchema>;
