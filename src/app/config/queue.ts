import { Queue } from "bullmq";
import { envVars } from "./env";

// Upstash Redis requires TLS — detect by hostname
const isUpstash = envVars.REDIS_HOST?.includes("upstash.io");

export const videoQueue = new Queue("video-processing", {
  connection: {
    host: envVars.REDIS_HOST,
    port: Number(envVars.REDIS_PORT),
    username: envVars.REDIS_USERNAME,
    password: envVars.REDIS_PASSWORD,
    // Enable TLS for Upstash cloud Redis
    ...(isUpstash && { tls: {} }),
  },
});