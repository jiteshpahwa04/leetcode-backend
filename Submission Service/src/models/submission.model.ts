import mongoose, { Document } from "mongoose";

export enum SubmissionStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
}

export enum SubmissionLanguage {
    CPP = "cpp",
    JAVA = "java",
    PYTHON = "python",
    JAVASCRIPT = "javascript"
}

export interface ISubmission extends Document {
    problemId: string;
    code: string;
    language: SubmissionLanguage;
    status: SubmissionStatus;
    submissionData: Object;
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema = new mongoose.Schema<ISubmission>({
    problemId: {
        type: String,
        required: [true, "Problem ID is required for submission"]
    },
    code: {
        type: String,
        required: [true, "Code is required for evaluation"]
    },
    language: {
        type: String,
        enum: Object.values(SubmissionLanguage),
        required: [true, "Language is required for submission"]
    },
    status: {
        type: String,
        enum: Object.values(SubmissionStatus),
        default: SubmissionStatus.PENDING
    },
    submissionData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_, record) => {
            record.id = record._id;
            delete record._id;
            delete (record as any).__v;
            return record;
        }
    }
});

submissionSchema.index({ status: 1, createdAt: -1 });

export const SubmissionModel = mongoose.model<ISubmission>("Submission", submissionSchema);