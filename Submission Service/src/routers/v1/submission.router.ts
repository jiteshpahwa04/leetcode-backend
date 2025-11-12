import express from 'express';
import {  validateRequestBody } from '../../validators';
import { CreateSubmissionSchema, UpdateSubmissionStatusSchema } from '../../validators/submission.validator';
import { submissionController } from '../../controllers/submission.controller';

const submissionRouter = express.Router();

submissionRouter.post('/', validateRequestBody(CreateSubmissionSchema), submissionController.createSubmission);
submissionRouter.get('/problem/:problemId', submissionController.findByProblemId);
submissionRouter.get('/:id', submissionController.getSubmissionById);
submissionRouter.delete('/:id', submissionController.deleteById);
submissionRouter.patch('/:id/status', validateRequestBody(UpdateSubmissionStatusSchema), submissionController.updateSubmissionStatus);

export default submissionRouter;