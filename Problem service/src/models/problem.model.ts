import mongoose, { Document } from "mongoose";

export interface ITestcase {
    input: string;
    output: string;
}

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    editorial?: string;
    testcases: ITestcase[];
}

const testcaseSchema = new mongoose.Schema<ITestcase>({
    input: {
        type: String,
        required: [true, "Testcase input is required"],
        trim: true,
    },
    output: {
        type: String,
        required: [true, "Testcase output is required"],
        trim: true,
    }
}, {
    // _id: false  // Can be enabled if we do not want to use _id for subdocuments
});

const problemSchema = new mongoose.Schema<IProblem>({
    title: {
        type: String,
        required: [true, "Problem title is required"],
        maxLength: [100, "Title cannot exceed 100 characters"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Problem description is required"],
        trim: true,
    },
    difficulty: {
        type: String,
        enum: {
            values: ['Easy', 'Medium', 'Hard'],
            message: "Invalid difficulty level",
        },
        required: [true, "Problem difficulty is required"],
    },
    editorial: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    testcases: [testcaseSchema],
}, {
    timestamps: true
});

problemSchema.index({title: 1}, {unique: true});
problemSchema.index({difficulty: 1});

export const ProblemModel = mongoose.model<IProblem>('Problem', problemSchema);