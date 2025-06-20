"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
// Extensões permitidas
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
function fileFilter(req, file, cb) {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Tipo de arquivo não permitido (somente imagens)"));
    }
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("O arquivo não é uma imagem válida"));
    }
    cb(null, true);
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = "uploads/images/";
        // Garante que a pasta exista
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
        cb(null, filename);
    }
});
exports.uploadImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
