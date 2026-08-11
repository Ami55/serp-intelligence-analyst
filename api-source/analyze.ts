import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeSerpSnapshot } from '../server/analyzer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { snapshot, currentQuery, requestId } = req.body || {};
  if (!snapshot || !snapshot.keyword) {
    return res.status(400).json({ error: 'Valid SERP snapshot is required for analysis.' });
  }

  if (currentQuery) {
    const keywordMatches = snapshot.keyword.trim().toLowerCase() === (currentQuery.keyword || '').trim().toLowerCase();
    const locationMatches = snapshot.location.trim().toLowerCase() === (currentQuery.location || '').trim().toLowerCase();
    const deviceMatches = snapshot.device === currentQuery.device;
    if (!keywordMatches || !locationMatches || !deviceMatches) {
      return res.status(400).json({
        error: 'The available SERP data belongs to a different query.',
        code: 'QUERY_MISMATCH',
      });
    }
  }

  try {
    const report = await analyzeSerpSnapshot(snapshot);
    return res.status(200).json({ requestId, report });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return res.status(error.code === 'NO_GEMINI_API_KEY' ? 503 : 500).json({
      error: error.message || 'Failed to generate AI SERP analysis report.',
      code: error.code || 'ANALYSIS_FAILED',
    });
  }
}
