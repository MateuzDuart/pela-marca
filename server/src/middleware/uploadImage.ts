import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { randomUUID } from "crypto";

// Extensões permitidas
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Tipo de arquivo não permitido (somente imagens)"));
  }

  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("O arquivo não é uma imagem válida"));
  }

  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = "uploads/images/";

    // Garante que a pasta exista
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    cb(null, filename);
  }
});

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
