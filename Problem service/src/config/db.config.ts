import mongoose from "mongoose";
import { InternalServerError } from "../utils/errors/app.error";
import { serverConfig } from ".";
import logger from "./logger.config";

export const connectDB = async () => {
    try {
        const mongoURI = serverConfig.MONGODB_URI;
        await mongoose.connect(mongoURI);
        logger.info("Connected to MongoDB successfully");

        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            logger.info("MongoDB connection closed due to app termination");
            process.exit(0);
        });

    } catch (error) {
        logger.error("Error connecting to MongoDB:", error);
        throw new InternalServerError("Database connection failed");
    }
}