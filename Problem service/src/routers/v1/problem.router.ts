import express from 'express';
import {  validateQueryParams, validateRequestBody, validateRequestParams } from '../../validators';
import { CreateProblemSchema, UpdateProblemSchema } from '../../validators/problem.validator';
import { z } from 'zod';
import { ProblemController } from '../../controllers/problem.controller';

const problemRouter = express.Router();

problemRouter.post(
    '/', 
    validateRequestBody(CreateProblemSchema), 
    ProblemController.createProblem
);

problemRouter.get(
    '/:id', 
    ProblemController.getProblemById
);
problemRouter.get(
    '/', 
    ProblemController.getAllProblems
);
problemRouter.put(
    '/:id', 
    validateRequestBody(UpdateProblemSchema), 
    ProblemController.updateProblem
);

problemRouter.delete(
    '/:id', 
    ProblemController.deleteProblem
);

problemRouter.get(
    '/difficulty/:difficulty', 
    validateRequestParams(z.object({ difficulty: z.enum(['Easy', 'Medium', 'Hard'], { message: 'Invalid difficulty level' }) })),
    ProblemController.findProblemByDifficulty
);

problemRouter.get(
    '/search', 
    validateQueryParams(z.object({ title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters") })), 
    ProblemController.searchProblems
);

export default problemRouter;