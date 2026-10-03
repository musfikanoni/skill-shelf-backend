import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { envVars } from "./env"
import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

export const s3Client = new S3Client({
  region: envVars.S3.S3_REGION,
  endpoint: `https://${envVars.S3.S3_REGION}.digitaloceanspaces.com`, 
  forcePathStyle: false, 
  credentials: {
    accessKeyId: envVars.S3.S3_ACCESS_KEY as string,
    secretAccessKey: envVars.S3.S3_SECRET_KEY as string,
  },
});

const mimeMap: Record<FileType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/mpeg"],
  audio: ["audio/mpeg", "audio/mp3"],
  pdf: ["application/pdf"],
  any: [],
};

// export const upload = ({
//   folder,
//   fileType = "any",
//   maxCount = 1,
// }: {
//   folder: string;
//   fileType?: FileType;
//   maxCount?: number;
// }) => {
//   const storage = multerS3({
//     s3: s3Client,
//     bucket: envVars.S3.S3_BUCKET_NAME!,
//     acl: "public-read", 
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (_req, file, cb) => {
//       const safeName = file.originalname.replace(/\s+/g, "-");
//       const fileName = `${folder}/${Date.now()}-${safeName}`;
//       cb(null, fileName);
//     },
//   });

//   const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
//     if (fileType !== "any" && !mimeMap[fileType].includes(file.mimetype)) {
//       cb(new Error(`Invalid ${fileType} file type`));
//     } else {
//       cb(null, true);
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: {
//       fileSize: 10 * 1024 * 1024,
//     },
//   }).array("files", maxCount);
// };


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
  const storage = multerS3({
    s3: s3Client,
    bucket: envVars.S3.S3_BUCKET_NAME!,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-");
      const fileName = `${folder}/${Date.now()}-${safeName}`;
      cb(null, fileName);
    },
  });

  const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (fileType !== "any" && !mimeMap[fileType].includes(file.mimetype)) {
      cb(new Error(`Invalid ${fileType} file type`));
    } else {
      cb(null, true);
    }
  };

  const multerInstance = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 500 * 1024 * 1024,
    },
  });

  // 🔥 CHANGE HERE
  // If fields provided → use .fields()
  if (fields) {
    return multerInstance.fields(fields);
  }

  return multerInstance.array("files", maxCount);
};

export const getFileUrl = (file: Express.MulterS3.File) => {
  return (
    file.location ??
    `https://${envVars.S3.S3_BUCKET_NAME}.${envVars.S3.S3_REGION}.digitaloceanspaces.com/${file.key}`
  );
};


export const deleteFileFromS3 = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: envVars.S3.S3_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
};

export const downloadFileFromS3 = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: envVars.S3.S3_BUCKET_NAME!,
    Key: key,
  });

  const response = await s3Client.send(command);

  const filePath = path.join("/tmp", key.replace("/", "_"));

  const stream = fs.createWriteStream(filePath);

   if (response.Body instanceof Readable) {
    response.Body.pipe(stream);
  } else {
    const nodeStream = Readable.fromWeb(response.Body as any);
    nodeStream.pipe(stream);
  }

  return new Promise<string>((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

export type FileType = "image" | "video" | "pdf" | "any" | "audio";

export enum FileTypes {
  IMAGE = "image",
  VIDEO = "video",
  PDF = "pdf",
  AUDIO = "audio",
  ANY = "any",
}