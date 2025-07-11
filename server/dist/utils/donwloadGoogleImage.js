"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donwloadGoogleImage = donwloadGoogleImage;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
async function donwloadGoogleImage(pictureUrl) {
    const response = await axios_1.default.get(pictureUrl, { responseType: 'stream' });
    const ext = path_1.default.extname(pictureUrl).split('?')[0] || '.jpg';
    const filename = `user_${(0, uuid_1.v4)()}${ext}`;
    const filePath = path_1.default.join(__dirname, '..', '..', 'uploads', 'images', filename);
    fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
    const writer = fs_1.default.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(undefined));
        writer.on('error', reject);
    });
    return filename;
}
