import multer from "multer";

export const multerUpload = multer({
  storage: multer.memoryStorage(), 
  limits: {
    fileSize: 500 * 1024 * 1024, 
  },
});
