// import { Queue } from "bullmq";

// export const videoQueue = new Queue("video-processing", {
//   connection: {
//     host: "127.0.0.1",
//     port: 6379,
//   },
// });


import { Queue } from "bullmq";
import { envVars } from "./env";

export const videoQueue = new Queue("video-processing", {
  connection: {
    host: envVars.REDIS_HOST,
    port: Number(envVars.REDIS_PORT),
    username: envVars.REDIS_USERNAME,
    password: envVars.REDIS_PASSWORD,
  },
});