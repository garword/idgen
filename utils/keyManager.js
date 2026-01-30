const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const KEYS_FILE = path.join(__dirname, '../data/api-keys.json');

class KeyManager {
    constructor() {
        this.ensureKeysFile();
    }

    ensureKeysFile() {
        if (!fs.existsSync(KEYS_FILE)) {
            fs.writeFileSync(KEYS_FILE, JSON.stringify({ keys: [] }, null, 2));
        }
    }

    readKeys() {
        const data = fs.readFileSync(KEYS_FILE, 'utf8');
        return JSON.parse(data);
    }

    writeKeys(data) {
        fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
    }

    generateKey(name, description = '') {
        const newKey = {
            key: uuidv4(),
            name,
            description,
            createdAt: new Date().toISOString(),
            active: true
        };

        const data = this.readKeys();
        data.keys.push(newKey);
        this.writeKeys(data);

        return newKey;
    }

    validateKey(apiKey) {
        const data = this.readKeys();
        const key = data.keys.find(k => k.key === apiKey && k.active);
        return key || null;
    }

    listKeys() {
        const data = this.readKeys();
        return data.keys;
    }

    revokeKey(apiKey) {
        const data = this.readKeys();
        const key = data.keys.find(k => k.key === apiKey);
        if (key) {
            key.active = false;
            this.writeKeys(data);
            return true;
        }
        return false;
    }
}

module.exports = new KeyManager();
