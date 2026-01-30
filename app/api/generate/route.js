import { NextResponse } from 'next/server';
// import Jimp from 'jimp'; // ESM import issues with 0.22.12
const Jimp = require('jimp');
import bwipjs from 'bwip-js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    const { name, role, idNumber, validFrom, validTo, photo } = await req.json();

    if (!name || !role || !idNumber) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const tempDir = path.join(process.cwd(), 'public/temp'); // Store in public/temp for easy download? 
        // Vercel serverless functions are read-only except /tmp.
        // BUT we cannot serve files from /tmp easily via a URL unless we have a route that reads it.
        // Let's use /tmp and a separate GET route to serve it.

        // Wait, for Next.js in Vercel, we can return the base64 or a buffer directly?
        // Or store in /tmp and serve via /api/download?
        // Let's do /tmp and return a download URL (which points to an API route).

        const workingDir = '/tmp';
        // Note: For local dev, we need a local temp.
        const effectiveTemp = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'temp');

        if (!fs.existsSync(effectiveTemp)) {
            fs.mkdirSync(effectiveTemp, { recursive: true });
        }

        const cardId = uuidv4();
        const outputPath = path.join(effectiveTemp, `${cardId}.png`);

        // Fonts - Load from public/fonts using process.cwd() which works in Vercel
        // This avoids issues with __dirname in bundled environments
        const fontPathTitle = path.join(process.cwd(), 'public/fonts/open-sans-32-black.fnt');
        const fontPathBody = path.join(process.cwd(), 'public/fonts/open-sans-16-black.fnt');

        console.log('[DEBUG] Loading fonts from:', fontPathTitle);

        if (!fs.existsSync(fontPathTitle)) {
            console.error('[FATAL] Font file not found at:', fontPathTitle);
            // Verify if public/fonts exists
            const checkDir = path.join(process.cwd(), 'public/fonts');
            if (fs.existsSync(checkDir)) {
                console.log('[DEBUG] public/fonts contents:', fs.readdirSync(checkDir));
            } else {
                console.log('[DEBUG] public/fonts directory MISSING at:', checkDir);
                console.log('[DEBUG] CWD contents:', fs.readdirSync(process.cwd()));
            }
            throw new Error(`Font missing: ${fontPathTitle}`);
        }

        const fontTitle = await Jimp.loadFont(fontPathTitle);
        const fontBody = await Jimp.loadFont(fontPathBody);

        // Load Background (From public folder)
        const bgPath = path.join(process.cwd(), 'public', 'bg_clean.png');
        if (!fs.existsSync(bgPath)) {
            console.error('BG Missing:', bgPath);
            throw new Error('Background assets missing');
        }

        const image = await Jimp.read(bgPath);
        const WIDTH = image.bitmap.width;
        const HEIGHT = image.bitmap.height;

        // Process Photo
        if (photo) {
            const photoBuffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const userPhoto = await Jimp.read(photoBuffer);

            const pX = Math.round(WIDTH * 0.148);
            const pY = Math.round(HEIGHT * 0.382);
            const pW = Math.round(WIDTH * 0.295);
            const pH = Math.round(HEIGHT * 0.455);

            userPhoto.cover(pW, pH);
            image.composite(userPhoto, pX, pY);
        }

        // Text
        const infoX = Math.round(WIDTH * 0.48);
        const infoY = Math.round(HEIGHT * 0.37);
        image.print(fontTitle, infoX, infoY, name);
        image.print(fontBody, infoX, infoY + 50, role);
        image.print(fontBody, infoX, infoY + 80, idNumber);

        // Barcode
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: idNumber,
            scale: 3,
            height: 10,
            includetext: false,
            textxalign: 'center',
        });
        const barcodeImg = await Jimp.read(barcodeBuffer);

        const bcX = Math.round(WIDTH * 0.48);
        const bcY = Math.round(HEIGHT * 0.72);
        const bcTargetW = Math.round(WIDTH * 0.38);
        barcodeImg.resize(bcTargetW, Jimp.AUTO);
        image.composite(barcodeImg, bcX, bcY);

        const validText = `Valid: ${validFrom || '2022'}-${validTo || '2027'}`;
        image.print(fontBody, bcX, bcY + barcodeImg.bitmap.height + 5, validText);

        await image.writeAsync(outputPath);

        return NextResponse.json({
            success: true,
            cardId: cardId,
            downloadUrl: `/api/download?id=${cardId}`
        });

    } catch (error) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
