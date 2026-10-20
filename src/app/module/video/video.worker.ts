import { Worker } from "bullmq";
import fs from "fs";
import https from "https";
import path from "path";
import { getVideoDuration } from "../../utils/getVideoDuration";
import { Video } from "./video.model";

/**
 * Download a Cloudinary video URL to a local temp file
 * Replaces the old downloadFileFromS3 since Cloudinary serves public URLs
 */
const downloadFromCloudinary = (url: string): Promise<string> => {
  const fileName = `video_${Date.now()}${path.extname(url.split("?")[0]) || ".mp4"}`;
  const localPath = path.join(process.cwd(), "tmp", fileName);

  // Ensure tmp dir exists
  if (!fs.existsSync(path.join(process.cwd(), "tmp"))) {
    fs.mkdirSync(path.join(process.cwd(), "tmp"), { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(localPath);
      });
    }).on("error", (err) => {
      fs.unlink(localPath, () => {}); // cleanup on error
      reject(err);
    });
  });
};

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const { videoId, videoKey } = job.data;

    console.log("🎬 Processing video:", videoId);

    try {
      // 1️⃣ Download file from Cloudinary URL
      const localPath = await downloadFromCloudinary(videoKey);

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
      // Upstash Redis requires TLS
      tls: process.env.REDIS_HOST?.includes("upstash.io") ? {} : undefined,
    },
    concurrency: 3,
  }
);

console.log("🚀 Video Worker Running...");