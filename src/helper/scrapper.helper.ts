import axios from 'axios';
import path = require('path');
import fs = require('fs');

export const publicImagesDir = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
}

export function imageExists(url: string) {
    const fileName = path.basename(url);
    const localPath = path.join(publicImagesDir, fileName);
    return fs.existsSync(localPath);
}

export function saveImageFromUrl(
    url: string,
    filename: string
): Promise<string | null> {
    return new Promise(async (res, rej) => {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            const contentType = response.headers['content-type'];
            const extension = contentType.split('/')[1];
            const fileName = `${sanitizeFileName(filename)}.${extension}`;
            const filePath = path.join(publicImagesDir, fileName);

            fs.writeFileSync(filePath, response.data);
            console.log(
                'File saved',
                `${process.env.BACKEND_URL}/public/images/${fileName}`
            );
            res(`${process.env.BACKEND_URL}/public/images/${fileName}`);
        } catch (e) {
            console.log(
                'An error occured during saving image to public directory',
                e
            );
            rej(null);
        }
    });
}

export function removeImage(url: string): Promise<string | null> {
    const fileName = url.split('/').pop();
    const filePath = path.join(publicImagesDir, fileName);
    return new Promise(async (res, rej) => {
        try {
            fs.unlink(filePath, (err) => {
                if (err) throw err;
                res('Success');
            });
        } catch (e) {
            console.log(
                'An error occured during removing image from public directory',
                e
            );
            rej(null);
        }
    });
}

function sanitizeFileName(str: string) {
    const sanitized = str
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    return sanitized;
}
