import mongoose from "mongoose";
import { envVars } from "./env";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(envVars.DB_URL, {
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 5,
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    return connectionPromise;
};