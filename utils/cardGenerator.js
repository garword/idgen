const Jimp = require('jimp');
const { createCanvas } = require('canvas'); // Or pure JS barcode generator if canvas is issue, but jsbarcode usually needs canvas. 
// Actually JIMP is pure JS. JsBarcode can allow text output, but usually needs a canvas for image.
// Vercel supports 'canvas' mostly, but let's be careful. 
// Safer: Use a buffer based barcode generator or just draw lines?
// 'jsbarcode' with 'canvas' package works fine on Vercel mostly.
// BUT to be 100% safe, let's use 'jimp' essentially.

// RE-EVALUATION: 'canvas' package needs system libs too (libcairo).
// If Puppeteer failed on libs, 'canvas' MIGHT fail too.
// Is there a PURE JS barcode generator? 'bwip-js' is pure JS.
// 'text-to-svg' + 'sharp'?

// Let's stick with JIMP for composition.
// For barcode: 'bwip-js' generates PNG buffers purely in JS.
const bwipjs = require('bwip-js');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class CardGenerator {
    constructor() {
        this.tempDir = IS_PRODUCTION ? '/tmp' : path.join(__dirname, '../temp');
        this.fontTitle = null; // Will load fonts once
        this.fontBody = null;
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async loadFonts() {
        if (!this.fontTitle) {
            this.fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Close enough to Arial Black
            this.fontBody = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);  // Close enough to Arial
        }
    }

    async generateCard(data) {
        const { name, role, idNumber, validFrom, validTo, photo } = data;
        const cardId = uuidv4();
        const outputPath = path.join(this.tempDir, `${cardId}.png`);

        try {
            await this.loadFonts();

            // 1. Load Background
            const bgPath = path.join(__dirname, '../bg_clean.png');
            console.log(`[DEBUG] __dirname: ${__dirname}`);
            console.log(`[DEBUG] Expected bgPath: ${bgPath}`);

            if (!fs.existsSync(bgPath)) {
                console.error(`[FATAL] Background file missing at: ${bgPath}`);
                // List files in current dir and parent to debug
                console.log(`[DEBUG] Files in ${__dirname}:`, fs.readdirSync(__dirname));
                console.log(`[DEBUG] Files in ../:`, fs.readdirSync(path.join(__dirname, '../')));
                throw new Error(`Background image not found at ${bgPath}`);
            }

            const image = await Jimp.read(bgPath);
            console.log('[DEBUG] Background loaded successfully');


            // 2. Process User Photo
            if (photo) {
                // photo is base64
                const photoBuffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ""), 'base64');
                const userPhoto = await Jimp.read(photoBuffer);

                // CSS Layout Coords (percentages):
                // top: 38.2% -> 0.382 * 638 = ~243 y
                // left: 14.8% -> 0.148 * 1004 = ~149 x
                // width: 29.5% -> 0.295 * 1004 = ~296 w
                // height: 45.5% -> 0.455 * 638 = ~290 h

                const pX = Math.round(WIDTH * 0.148);
                const pY = Math.round(HEIGHT * 0.382);
                const pW = Math.round(WIDTH * 0.295);
                const pH = Math.round(HEIGHT * 0.455);

                userPhoto.cover(pW, pH); // Crop/Resize to fit
                image.composite(userPhoto, pX, pY);
            }

            // 3. Draw Text
            // Info Area: left: 48%, top: 37%
            const infoX = Math.round(WIDTH * 0.48);
            const infoY = Math.round(HEIGHT * 0.37);

            // Name (Large, Bold) - JIMP fonts are limited unless custom .fnt loaded
            // We'll use standard fonts for stability.
            image.print(this.fontTitle, infoX, infoY, name);

            // Role
            image.print(this.fontBody, infoX, infoY + 50, role);

            // ID
            image.print(this.fontBody, infoX, infoY + 80, idNumber);

            // 4. Generate Barcode (Pure JS)
            const barcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',       // Barcode type
                text: idNumber,        // Text to encode
                scale: 3,               // 3x scaling factor
                height: 10,              // Bar height, in millimeters
                includetext: false,            // Show human-readable text
                textxalign: 'center',        // Always good to set this
            });
            const barcodeImg = await Jimp.read(barcodeBuffer);

            // Barcode Area: bottom: 16%, left: 48% -> top = 84% from bottom? No, bottom is 16%.
            // Top = 100% - 16% - height%?
            // Let's visual check: It's below the text.
            const bcX = Math.round(WIDTH * 0.48);
            const bcY = Math.round(HEIGHT * 0.72); // Approx

            // Resize barcode if needed to fit width: 38% -> ~380px
            const bcTargetW = Math.round(WIDTH * 0.38);
            barcodeImg.resize(bcTargetW, Jimp.AUTO);

            image.composite(barcodeImg, bcX, bcY);

            // Valid Date
            const validText = `Valid: ${validFrom || '2022'}-${validTo || '2027'}`;
            image.print(this.fontBody, bcX, bcY + barcodeImg.bitmap.height + 5, validText);

            // 5. Write Output
            await image.writeAsync(outputPath);

            return {
                cardId,
                filePath: outputPath,
                fileName: `${cardId}.png`
            };

        } catch (error) {
            console.error('JIMP Generation Error:', error);
            throw error;
        }
    }

    async cleanup() {
        // No browser to close
    }

    cleanOldFiles() {
        // Existing cleanup logic
        const maxAge = parseInt(process.env.MAX_FILE_AGE_HOURS || '24') * 60 * 60 * 1000;
        const now = Date.now();
        if (fs.existsSync(this.tempDir)) {
            fs.readdir(this.tempDir, (err, files) => {
                if (err) return;
                files.forEach(file => {
                    const filePath = path.join(this.tempDir, file);
                    fs.stat(filePath, (err, stats) => {
                        if (err) return;
                        if (now - stats.mtime.getTime() > maxAge) {
                            fs.unlink(filePath, () => { });
                        }
                    });
                });
            });
        }
    }
}

module.exports = new CardGenerator();
