
/* eslint-disable no-console */

import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectDB } from "./app/config/db";
import { connectRedis } from "./app/config/redis.config";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server | undefined;

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("MongoDB connected successfully");

        // Start Express server
        server = app.listen(Number(envVars.PORT), () => {
            console.log(
                `Server is listening on port ${envVars.PORT}`
            );
        });

        // Initialize video worker
        await import("./app/module/video/video.worker");
        console.log("Video Worker initialized");
    } catch (error) {
        console.error("Server startup failed:", error);
        throw error;
    }
};

const shutdown = async (exitCode = 0): Promise<void> => {
    console.log("Server shutting down...");

    try {
        if (server) {
            await new Promise<void>((resolve, reject) => {
                server!.close((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Close MongoDB connection
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();

        process.exit(exitCode);
    } catch (error) {
        console.error("Error during server shutdown:", error);
        process.exit(1);
    }
};

const bootstrap = async (): Promise<void> => {
    try {
        await connectRedis();
        await startServer();
        await seedSuperAdmin();
    } catch (error) {
        console.error("Application startup failed:", error);
        await shutdown(1);
    }
};

process.on("SIGTERM", () => {
    void shutdown(0);
});

process.on("SIGINT", () => {
    void shutdown(0);
});

process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection detected:", error);
    void shutdown(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception detected:", error);
    void shutdown(1);
});

void bootstrap();
