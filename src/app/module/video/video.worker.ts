import { Worker } from "bullmq";
import fs from "fs";
import { downloadFileFromS3 } from "../../config/S3Client.config";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { Video } from "./video.model";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, videoKey } = job.data;

    console.log("🎬 Processing video:", videoId);

    try {
      // 1️⃣ Download file
      const localPath = await downloadFileFromS3(videoKey);

      // 2️⃣ Extract duration
      const duration = await getVideoDuration(localPath);

      console.log("⏱ Duration extracted:", duration);

      // 3️⃣ Update DB
      await Video.findByIdAndUpdate(videoId, {
        duration: Math.round(duration),
      });

      // 4️⃣ Cleanup
      fs.unlinkSync(localPath);

      console.log("✅ Video updated:", videoId);
    } catch (err) {
      console.error("❌ Worker error:", err);
      throw err;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    },
    concurrency: 3,
  }
);

console.log("🚀 Video Worker Running...");