const puppeteer = require('puppeteer');
const puppeteerCore = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class CardGenerator {
    constructor() {
        this.browser = null;
        // Use /tmp in production (Vercel), ./temp locally
        this.tempDir = IS_PRODUCTION ? '/tmp' : path.join(__dirname, '../temp');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async initBrowser() {
        if (!this.browser) {
            if (IS_PRODUCTION) {
                // Use @sparticuz/chromium for Vercel/AWS Lambda
                this.browser = await puppeteerCore.launch({
                    args: [
                        ...chromium.args,
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process'
                    ],
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true
                });
            } else {
                // Use regular puppeteer for local development
                this.browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
            }
        }
        return this.browser;
    }

    async generateCard(data) {
        const {
            name,
            role,
            idNumber,
            validFrom,
            validTo,
            photo
        } = data;

        // Validate required fields
        if (!name || !role || !idNumber) {
            throw new Error('Missing required fields: name, role, idNumber');
        }

        const cardId = uuidv4();
        const outputPath = path.join(this.tempDir, `${cardId}.png`);

        try {
            const browser = await this.initBrowser();
            const page = await browser.newPage();

            // Set viewport to card dimensions
            await page.setViewport({
                width: 1024,
                height: 648,
                deviceScaleFactor: 2
            });

            // Load template HTML
            const templatePath = path.join(__dirname, '../templates/card.html');
            const templateUrl = `file://${templatePath}`;

            await page.goto(templateUrl, {
                waitUntil: 'networkidle0'
            });

            // Inject data
            await page.evaluate((cardData) => {
                document.getElementById('card-name').textContent = cardData.name;
                document.getElementById('card-role').textContent = cardData.role;
                document.getElementById('card-id').textContent = cardData.idNumber;
                document.getElementById('card-valid').textContent =
                    `Valid: ${cardData.validFrom || '2024'}-${cardData.validTo || '2029'}`;

                // Set photo if provided
                if (cardData.photo) {
                    const photoImg = document.getElementById('card-photo');
                    if (photoImg) {
                        photoImg.src = cardData.photo;
                    }
                }
            }, { name, role, idNumber, validFrom, validTo, photo });

            // Wait for rendering
            await page.waitForTimeout(500);

            // Take screenshot of the card element
            const cardElement = await page.$('#id-card');
            if (cardElement) {
                await cardElement.screenshot({
                    path: outputPath,
                    omitBackground: false
                });
            } else {
                throw new Error('Card element not found in template');
            }

            await page.close();

            return {
                cardId,
                filePath: outputPath,
                fileName: `${cardId}.png`
            };

        } catch (error) {
            console.error('Error generating card:', error);
            throw error;
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    // Clean old files (older than MAX_FILE_AGE_HOURS)
    cleanOldFiles() {
        const maxAge = parseInt(process.env.MAX_FILE_AGE_HOURS || '24') * 60 * 60 * 1000;
        const now = Date.now();

        fs.readdir(this.tempDir, (err, files) => {
            if (err) return;

            files.forEach(file => {
                const filePath = path.join(this.tempDir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;

                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlink(filePath, err => {
                            if (!err) console.log(`Cleaned old file: ${file}`);
                        });
                    }
                });
            });
        });
    }
}

module.exports = new CardGenerator();
