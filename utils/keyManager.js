const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Use /tmp in serverless, ./data locally
const KEYS_FILE = IS_PRODUCTION
    ? '/tmp/api-keys.json'
    : path.join(__dirname, '../data/api-keys.json');

class KeyManager {
    constructor() {
        this.ensureKeysFile();
    }

    ensureKeysFile() {
        try {
            // Ensure directory exists
            const dir = path.dirname(KEYS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Create file if not exists
            if (!fs.existsSync(KEYS_FILE)) {
                const defaultKeys = {
                    keys: [
                        {
                            key: 'windaacantik',
                            name: 'Demo Key',
                            description: 'Default demo key for testing',
                            createdAt: new Date().toISOString(),
                            active: true
                        }
                    ]
                };
                fs.writeFileSync(KEYS_FILE, JSON.stringify(defaultKeys, null, 4));
                console.log('✅ Created default API keys file');
            }
        } catch (error) {
            console.error('Warning: Could not create keys file:', error.message);
            // In serverless, we'll use in-memory keys if file creation fails
        }
    }

    readKeys() {
        try {
            if (fs.existsSync(KEYS_FILE)) {
                const data = fs.readFileSync(KEYS_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error reading keys file:', error.message);
        }

        // Return default keys if file doesn't exist or error
        return {
            keys: [
                {
                    key: 'windaacantik',
                    name: 'Demo Key',
                    description: 'Default demo key',
                    createdAt: new Date().toISOString(),
                    active: true
                }
            ]
        };
    }

    saveKeys(keysData) {
        try {
            fs.writeFileSync(KEYS_FILE, JSON.stringify(keysData, null, 4));
            return true;
        } catch (error) {
            console.error('Warning: Could not save keys file in serverless environment:', error.message);
            // In serverless, keys are ephemeral - this is expected
            return false;
        }
    }

    validateKey(apiKey) {
        const keysData = this.readKeys();
        const keyInfo = keysData.keys.find(k => k.key === apiKey && k.active);
        return keyInfo || null;
    }

    generateKey(name, description = '') {
        const keysData = this.readKeys();

        const newKey = {
            key: `key-${uuidv4()}`,
            name,
            description,
            createdAt: new Date().toISOString(),
            active: true
        };

        keysData.keys.push(newKey);
        this.saveKeys(keysData);

        return newKey;
    }

    listKeys() {
        const keysData = this.readKeys();
        return keysData.keys.map(k => ({
            name: k.name,
            description: k.description,
            createdAt: k.createdAt,
            active: k.active
        }));
    }

    revokeKey(apiKey) {
        const keysData = this.readKeys();
        const keyIndex = keysData.keys.findIndex(k => k.key === apiKey);

        if (keyIndex > -1) {
            keysData.keys[keyIndex].active = false;
            this.saveKeys(keysData);
            return true;
        }

        return false;
    }
}

module.exports = new KeyManager();
