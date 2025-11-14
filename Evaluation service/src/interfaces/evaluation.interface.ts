export interface Testcase {
    _id: string;
    input: string;
    output: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    editorial?: string;
    createdAt: Date;
    updatedAt: Date;
    testcases: Testcase[];
}

export interface EvaluationJob {
    submissionId: string;
    language: 'python' | 'cpp';
    code: string;
    problem: Problem
}

export interface EvaluationResult {
    status: string;
    output: string | undefined;
}