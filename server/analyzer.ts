import { GoogleGenAI, Type } from '@google/genai';
import { SERPSnapshot, AnalysisReport } from '../src/types';

/**
 * Uses Gemini API (gemini-3.6-flash) to generate a unified SERP Intelligence Report
 */
export async function analyzeSerpSnapshot(snapshot: SERPSnapshot): Promise<AnalysisReport> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is missing on the server. Configure GEMINI_API_KEY in Settings -> Secrets.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const prompt = `
You are a senior SERP Intelligence & SEO Analyst.
Analyze the following SERP snapshot and produce an intelligence report.

SERP QUERY DETAILS:
- Keyword: "${snapshot.keyword}"
- Location: "${snapshot.location}"
- Language: "${snapshot.language}"
- Device: "${snapshot.device}"
- Search Engine: "${snapshot.searchEngine}"
- Source: "${snapshot.source}"

ORGANIC TOP RESULTS (${snapshot.organicResults.length} total):
${JSON.stringify(snapshot.organicResults.slice(0, 10), null, 2)}

AI OVERVIEW DETECTED:
${JSON.stringify(snapshot.aiOverview, null, 2)}

DETECTED SERP FEATURES:
${JSON.stringify(snapshot.features, null, 2)}

CRITICAL INSTRUCTIONS:
1. Base all intent analysis, competitor patterns, and content recommendations strictly on the observed organic titles, snippets, result types, and detected features in this query.
2. Provide concise, high-value, actionable insights without SEO fluff or jargon.
3. The top summary MUST contain four findings:
   - dominantIntent: Single concise sentence explaining the dominant user intent.
   - competitorPattern: Main structural pattern across top competitors (e.g. buyer's guides vs direct product landing pages).
   - aiOverviewOpportunity: Clear opportunity to earn or replace an AI Overview citation.
   - recommendedAction: The single highest-priority action to rank #1.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert SEO strategist and search engine data analyst. Provide precise, evidence-based SERP intelligence reports.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topSummary: {
            type: Type.OBJECT,
            properties: {
              dominantIntent: { type: Type.STRING },
              competitorPattern: { type: Type.STRING },
              aiOverviewOpportunity: { type: Type.STRING },
              recommendedAction: { type: Type.STRING }
            },
            required: ['dominantIntent', 'competitorPattern', 'aiOverviewOpportunity', 'recommendedAction']
          },
          searchIntent: {
            type: Type.OBJECT,
            properties: {
              primaryIntent: { type: Type.STRING },
              secondaryIntent: { type: Type.STRING },
              evidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              dominantFormat: { type: Type.STRING },
              userExpectations: { type: Type.STRING }
            },
            required: ['primaryIntent', 'secondaryIntent', 'evidence', 'dominantFormat', 'userExpectations']
          },
          contentRecommendations: {
            type: Type.OBJECT,
            properties: {
              recommendedPageType: { type: Type.STRING },
              requiredSections: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              topicsToCover: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              featureOpportunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              competitiveDifferentiators: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              eeatRequirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              topActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['recommendedPageType', 'requiredSections', 'topicsToCover', 'featureOpportunities', 'competitiveDifferentiators', 'eeatRequirements', 'topActions']
          }
        },
        required: ['topSummary', 'searchIntent', 'contentRecommendations']
      }
    }
  });

  const jsonText = response.text || '';
  if (!jsonText) {
    throw new Error('Gemini returned an empty response during SERP analysis.');
  }

  const parsed = JSON.parse(jsonText);

  return {
    topSummary: parsed.topSummary,
    searchIntent: parsed.searchIntent,
    contentRecommendations: parsed.contentRecommendations,
    generatedAt: new Date().toISOString()
  };
}
