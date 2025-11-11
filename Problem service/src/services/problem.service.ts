import { IProblem } from "../models/problem.model";
import { IProblemRepository } from "../repositories/problem.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { sanitizeMarkdown } from "../utils/markdown.sanitizer";
import { CreateProblemDTO, UpdateProblemDTO } from "../validators/problem.validator";

export interface IProblemService {
    createProblem(problemData: Partial<IProblem>): Promise<IProblem>;
    getProblemById(problemId: string): Promise<IProblem | null>;
    getAllProblems(): Promise<{problems: IProblem[], total: number}>;
    updateProblem(problemId: string, updateData: Partial<IProblem>): Promise<IProblem | null>;
    deleteProblem(problemId: string): Promise<boolean>;
    findProblemByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<IProblem[]>;
    searchProblems(title: string): Promise<IProblem[]>;
}

export class ProblemService implements IProblemService {
    private problemRepository: IProblemRepository;

    constructor(problemRepository: IProblemRepository) { // constructor injection / constructor based dependency injection
        this.problemRepository = problemRepository;
    }

    async createProblem(problemData: CreateProblemDTO): Promise<IProblem> {
        // Sanitize the markdown description and editorial to prevent XSS attacks
        const sanitizedPayload = {
            ...problemData,
            description: await sanitizeMarkdown(problemData.description),
            editorial: problemData.editorial && await sanitizeMarkdown(problemData.editorial),
        }
        return await this.problemRepository.createProblem(sanitizedPayload);
    }

    async getProblemById(problemId: string): Promise<IProblem | null> {
        const problem = await this.problemRepository.getProblemById(problemId);
        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        return problem;
    }

    async getAllProblems(): Promise<{problems: IProblem[], total: number}> {
        return await this.problemRepository.getAllProblems();
    }

    async updateProblem(problemId: string, updateData: UpdateProblemDTO): Promise<IProblem | null> {
        const problem = await this.problemRepository.getProblemById(problemId);
        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        // Sanitize the markdown description and editorial to prevent XSS attacks
        const sanitizedPayload = {
            ...updateData,
            description: updateData.description ? await sanitizeMarkdown(updateData.description) : problem.description,
            editorial: updateData.editorial ? await sanitizeMarkdown(updateData.editorial) : problem.editorial,
        }
        return await this.problemRepository.updateProblem(problemId, sanitizedPayload);
    }

    async deleteProblem(problemId: string): Promise<boolean> {
        const problem = await this.problemRepository.getProblemById(problemId);
        if (!problem) {
            throw new NotFoundError("Problem not found");
        }

        return await this.problemRepository.deleteProblem(problemId);
    }

    async findProblemByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<IProblem[]> {
        return await this.problemRepository.findProblemByDifficulty(difficulty);
    }

    async searchProblems(title: string): Promise<IProblem[]> {
        if(!title || title.trim() === "") {
            throw new BadRequestError("Title cannot be empty");
        }

        return await this.problemRepository.searchProblems(title);
    }
}