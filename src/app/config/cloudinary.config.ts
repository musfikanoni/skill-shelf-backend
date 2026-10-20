import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

// Configure Cloudinary
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export { cloudinary };

// ===========================
// FILE TYPE DEFINITIONS
// ===========================
export type FileType = "image" | "video" | "pdf" | "any" | "audio";

export enum FileTypes {
  IMAGE = "image",
  VIDEO = "video",
  PDF = "pdf",
  AUDIO = "audio",
  ANY = "any",
}

const mimeMap: Record<FileType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/mpeg"],
  audio: ["audio/mpeg", "audio/mp3"],
  pdf: ["application/pdf"],
  any: [],
};

// Resource type mapping for Cloudinary
const resourceTypeMap: Record<FileType, "image" | "video" | "raw" | "auto"> = {
  image: "image",
  video: "video",
  audio: "video", // Cloudinary handles audio under "video"
  pdf: "raw",
  any: "auto",
};

// ===========================
// MULTER + CLOUDINARY UPLOAD
// ===========================
export const upload = ({
  folder,
  fileType = "any",
  maxCount = 1,
  fields,
}: {
  folder: string;
  fileType?: FileType;
  maxCount?: number;
  fields?: { name: string; maxCount: number }[];
}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req: Request, file: Express.Multer.File) => {
      const resourceType = resourceTypeMap[fileType] || "auto";
      return {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-").replace(/\.[^.]+$/, "")}`,
      };
    },
  });

  const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (fileType !== "any" && mimeMap[fileType].length > 0 && !mimeMap[fileType].includes(file.mimetype)) {
      cb(new Error(`Invalid ${fileType} file type`));
    } else {
      cb(null, true);
    }
  };

  const multerInstance = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB
    },
  });

  if (fields) {
    return multerInstance.fields(fields);
  }

  return multerInstance.array("files", maxCount);
};

// ===========================
// GET FILE URL
// ===========================
export const getFileUrl = (file: Express.Multer.File & { path?: string; secure_url?: string }): string => {
  // multer-storage-cloudinary puts the URL in file.path
  return (file as any).path || (file as any).secure_url || "";
};

// ===========================
// DELETE FILE FROM CLOUDINARY
// ===========================
export const deleteFileFromCloudinary = async (publicIdOrUrl: string): Promise<{ success: boolean; message: string }> => {
  try {
    // If it's a full URL, extract the public_id
    const publicId = extractPublicId(publicIdOrUrl);

    await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

// Alias for backward compatibility
export const deleteFileFromS3 = deleteFileFromCloudinary;

// ===========================
// EXTRACT PUBLIC ID FROM URL
// ===========================
export const extractPublicId = (urlOrKey: string): string => {
  // If it's already a key (not a URL), return as-is
  if (!urlOrKey.startsWith("http")) return urlOrKey;

  // Extract public_id from Cloudinary URL
  // e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/filename.jpg
  //  → folder/filename
  const matches = urlOrKey.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return matches?.[1] ?? urlOrKey;
};

// Alias used in user.services.ts — getS3KeyFromUrl
export const getCloudinaryKeyFromUrl = extractPublicId;
