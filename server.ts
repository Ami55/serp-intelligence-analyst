import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchLiveSerp } from './server/serp';
import { analyzeSerpSnapshot } from './server/analyzer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // POST /api/serp - Live SERP fetch
  app.post('/api/serp', async (req, res) => {
    const { keyword, location, language, device, searchEngine, requestId, customApiKey: bodyApiKey } = req.body || {};
    const customApiKey = (req.headers['x-serpapi-key'] as string) || bodyApiKey;

    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return res.status(400).json({ error: 'Keyword is required and cannot be empty.' });
    }

    try {
      const snapshot = await fetchLiveSerp({
        keyword: keyword.trim(),
        location: location || 'United States',
        language: language || 'English',
        device: device === 'mobile' ? 'mobile' : 'desktop',
        searchEngine: searchEngine || 'Google',
        customApiKey,
      });

      return res.json({
        requestId,
        snapshot
      });
    } catch (err: any) {
      console.error('API /api/serp error:', err);
      const statusCode = err.status || (err.code === 'NO_API_KEY' ? 503 : 500);
      return res.status(statusCode).json({
        error: err.message || 'Failed to fetch SERP data from provider.',
        code: err.code || 'SERP_FETCH_FAILED'
      });
    }
  });

  // POST /api/analyze - AI Analysis Report
  app.post('/api/analyze', async (req, res) => {
    const { snapshot, currentQuery, requestId } = req.body || {};

    if (!snapshot || !snapshot.keyword) {
      return res.status(400).json({ error: 'Valid SERP snapshot is required for analysis.' });
    }

    // Verify snapshot query matches current query
    if (currentQuery) {
      const matchKeyword = snapshot.keyword.trim().toLowerCase() === (currentQuery.keyword || '').trim().toLowerCase();
      const matchLocation = snapshot.location.trim().toLowerCase() === (currentQuery.location || '').trim().toLowerCase();
      const matchDevice = snapshot.device === currentQuery.device;

      if (!matchKeyword || !matchLocation || !matchDevice) {
        return res.status(400).json({
          error: 'The available SERP data belongs to a different query. Retrieve or provide data for the current keyword.',
          code: 'QUERY_MISMATCH'
        });
      }
    }

    try {
      const report = await analyzeSerpSnapshot(snapshot);
      return res.json({
        requestId,
        report
      });
    } catch (err: any) {
      console.error('API /api/analyze error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate AI SERP analysis report.',
        code: 'ANALYSIS_FAILED'
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SERP Intelligence Analyst server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
