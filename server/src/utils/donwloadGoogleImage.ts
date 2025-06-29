import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function donwloadGoogleImage(pictureUrl: string): Promise<string> {
  const response = await axios.get(pictureUrl, { responseType: 'stream' });

  const ext = path.extname(pictureUrl).split('?')[0] || '.jpg';
  const filename = `user_${uuidv4()}${ext}`;
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'images', filename);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(undefined));
    writer.on('error', reject);
  });

  return filename;
}
