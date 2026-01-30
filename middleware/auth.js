const keyManager = require('../utils/keyManager');

function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required. Please provide X-API-Key header.'
        });
    }

    const keyInfo = keyManager.validateKey(apiKey);

    if (!keyInfo) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or inactive API key.'
        });
    }

    // Attach key info to request for logging
    req.apiKeyInfo = keyInfo;
    next();
}

function requireAdminKey(req, res, next) {
    const adminKey = req.headers['x-admin-key'];
    const correctAdminKey = process.env.ADMIN_KEY || 'your-super-secret-admin-key-change-this';

    if (!adminKey || adminKey !== correctAdminKey) {
        return res.status(403).json({
            success: false,
            error: 'Admin access required. Invalid admin key.'
        });
    }

    next();
}

module.exports = {
    requireApiKey,
    requireAdminKey
};
