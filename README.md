# SERP Intelligence Analyst

A Vite/React app with two Vercel serverless endpoints:

- `POST /api/serp` retrieves live Google results through SerpApi.
- `POST /api/analyze` analyzes the normalized snapshot with Gemini.

API keys are read only by serverless functions and are never included in the browser bundle.

After a SERP snapshot is loaded, **Download PDF** exports an A4 report containing
the query details, executive summary, organic results, AI Overview, citations,
SERP features, search intent, and content recommendations.

The deployable handlers in `api/` load pre-bundled CommonJS implementations
from `serverless/`. This avoids Vercel runtime module-resolution failures. If
you change backend logic in `api-source/` or `server/`, run
`npm run bundle:functions` and commit the updated `serverless/*.cjs` files.

## Local development

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and add both keys.
3. Run `npm run dev`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import that repository in Vercel. The framework should be detected as Vite.
3. In **Project Settings -> Environment Variables**, add:
   - `SERPAPI_KEY`: your key from serpapi.com
   - `GEMINI_API_KEY`: your Gemini API key
4. Enable both variables for Production and Preview, then redeploy.
5. In **Settings -> Deployment Protection**, turn **Vercel Authentication** off if the public app or API responds with `401 Protected deployment`.

Do not commit `.env.local` or paste either key into source code. The existing `.gitignore` excludes environment files.
