import { IProblem, ProblemModel } from "../models/problem.model";

export interface IProblemRepository {
    createProblem(problemData: Partial<IProblem>): Promise<IProblem>;
    getProblemById(problemId: string): Promise<IProblem | null>;
    getAllProblems(): Promise<{problems: IProblem[], total: number}>;
    updateProblem(problemId: string, updateData: Partial<IProblem>): Promise<IProblem | null>;
    deleteProblem(problemId: string): Promise<boolean>;
    findProblemByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<IProblem[]>;
    searchProblems(title: string): Promise<IProblem[]>;
}

export class ProblemRepository implements IProblemRepository {
    async createProblem(problemData: Partial<IProblem>): Promise<IProblem> {
        const newProblem = new ProblemModel(problemData);
        return await newProblem.save();
    }

    async getProblemById(problemId: string): Promise<IProblem | null> {
        return await ProblemModel.findById(problemId);
    }
    
    async getAllProblems(): Promise<{problems: IProblem[], total: number}> {
        const problems = await ProblemModel.find().sort({createdAt: -1});
        const total = await ProblemModel.countDocuments();
        return {problems, total};
    }

    async updateProblem(problemId: string, updateData: Partial<IProblem>): Promise<IProblem | null> {
        return await ProblemModel.findByIdAndUpdate(problemId, updateData, {new: true});
    }

    async deleteProblem(problemId: string): Promise<boolean> {
        const result = await ProblemModel.findByIdAndDelete(problemId);
        return result !== null;
    }

    async findProblemByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<IProblem[]> {
        return await ProblemModel.find({difficulty});
    }

    async searchProblems(title: string): Promise<IProblem[]> {
        const regex = new RegExp(`^${title}$`, 'i'); // Case-insensitive exact match
        return await ProblemModel.find({$or: [{title: regex}, {description: regex}]}).sort({createdAt: -1});
    }
}