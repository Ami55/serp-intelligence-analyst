import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchLiveSerp } from '../server/serp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { keyword, location, language, device, searchEngine, requestId } = req.body || {};

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
    });

    return res.status(200).json({ requestId, snapshot });
  } catch (error: any) {
    console.error('API /api/serp error:', error);
    const statusCode = error.status || (error.code === 'NO_API_KEY' ? 503 : 500);
    return res.status(statusCode).json({
      error: error.message || 'Failed to fetch SERP data from provider.',
      code: error.code || 'SERP_FETCH_FAILED',
    });
  }
}
