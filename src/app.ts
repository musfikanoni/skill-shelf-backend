
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";

import { envVars } from "./app/config/env";
import { connectDB } from "./app/config/db";
import "./app/config/passport";

import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { WebhookController } from "./app/module/webhook/webhook.controller";

const app = express();

// Stripe webhook
// Keep this before express.json() because Stripe needs the raw request body.
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    WebhookController.stripeWebhook
);

// Session configuration
app.use(
    expressSession({
        secret: envVars.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Common middleware
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
    cors({
        origin: [
            envVars.FRONTEND_URL,
            envVars.FRONTEND_LOCALHOST_URL,
            envVars.DASHBOARD_URL,
            envVars.DASHBOARD_LOCALHOST_URL,
            envVars.FRONTEND_DOMAIN_URL,
            envVars.DASHBOARD_DOMAIN_URL,
        ],
        credentials: true,
    })
);

// Ensure MongoDB is connected before handling API requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error);

        res.status(503).json({
            success: false,
            message: "Database connection unavailable",
        });
    }
});

// API routes
app.use("/api/v1", router);

// Health check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to SkillShelf System Backend",
    });
});

// Error handlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;
