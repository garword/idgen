const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireApiKey, requireAdminKey } = require('../middleware/auth');
const keyManager = require('../utils/keyManager');
const cardGenerator = require('../utils/cardGenerator');

// Generate ID Card
router.post('/generate', requireApiKey, async (req, res) => {
    try {
        const { name, role, idNumber, validFrom, validTo, photo } = req.body;

        // Validate input
        if (!name || !role || !idNumber) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, role, idNumber'
            });
        }

        // Generate card
        const result = await cardGenerator.generateCard({
            name,
            role,
            idNumber,
            validFrom,
            validTo,
            photo
        });

        const downloadUrl = `/api/download/${result.cardId}`;

        res.json({
            success: true,
            data: {
                cardId: result.cardId,
                downloadUrl,
                expiresIn: '24 hours'
            }
        });

    } catch (error) {
        console.error('Generate error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate card'
        });
    }
});

// Download Generated Card
router.get('/download/:cardId', requireApiKey, (req, res) => {
    try {
        const { cardId } = req.params;
        const filePath = path.join(__dirname, '../temp', `${cardId}.png`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Card not found or expired'
            });
        }

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({
                    success: false,
                    error: 'Failed to download card'
                });
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to download card'
        });
    }
});

// Create API Key (Admin Only)
router.post('/keys/create', requireAdminKey, (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Key name is required'
            });
        }

        const newKey = keyManager.generateKey(name, description);

        res.json({
            success: true,
            data: {
                apiKey: newKey.key,
                name: newKey.name,
                description: newKey.description,
                createdAt: newKey.createdAt
            }
        });

    } catch (error) {
        console.error('Create key error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create API key'
        });
    }
});

// Validate API Key
router.get('/keys/validate', requireApiKey, (req, res) => {
    res.json({
        success: true,
        valid: true,
        keyInfo: {
            name: req.apiKeyInfo.name,
            createdAt: req.apiKeyInfo.createdAt
        }
    });
});

// List API Keys (Admin Only)
router.get('/keys/list', requireAdminKey, (req, res) => {
    try {
        const keys = keyManager.listKeys();
        res.json({
            success: true,
            data: keys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to list keys'
        });
    }
});

// Revoke API Key (Admin Only)
router.post('/keys/revoke', requireAdminKey, (req, res) => {
    try {
        const { apiKey } = req.body;
        const revoked = keyManager.revokeKey(apiKey);

        if (revoked) {
            res.json({
                success: true,
                message: 'API key revoked successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to revoke key'
        });
    }
});

module.exports = router;
