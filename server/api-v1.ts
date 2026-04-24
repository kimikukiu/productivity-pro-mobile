import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ ok: true, version: 'v1' });
});

// Placeholder for v1 API routes
router.get('/status', (_req, res) => {
  res.json({ 
    status: 'operational',
    endpoints: ['/health', '/status'],
    message: 'API v1 - Minimal implementation'
  });
});

export default router;
