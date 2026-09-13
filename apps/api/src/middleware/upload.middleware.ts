import multer from "multer";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single("resume");
