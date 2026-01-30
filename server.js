require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const cardGenerator = require('./utils/cardGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(express.json({ limit: '10mb' })); // For base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Serves /generator.html, /js/..., /css/...
app.use('/docs', express.static(path.join(__dirname, 'public'))); // Keep /docs/ working for backward compatibility

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Appleby College ID Card Generator API',
        version: '1.0.0',
        documentation: '/docs/index.html',
        endpoints: {
            generate: 'POST /api/generate',
            download: 'GET /api/download/:cardId',
            validateKey: 'GET /api/keys/validate',
            createKey: 'POST /api/keys/create (Admin)',
            listKeys: 'GET /api/keys/list (Admin)',
            revokeKey: 'POST /api/keys/revoke (Admin)'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Cleanup old files every hour
setInterval(() => {
    cardGenerator.cleanOldFiles();
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, cleaning up...');
    await cardGenerator.cleanup();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/docs/index.html`);
    console.log(`🔑 Demo API Key: windaacantik\n`);
});
