import { SERPSnapshot, OrganicResult, AIOverview, AIOverviewCitation, AIOverviewMentionedEntity, SERPFeature } from '../src/types';
import { classifyPageType } from '../src/utils/pageType';

/**
 * Helper to safely extract domain name from URL
 */
function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr || 'unknown';
  }
}

function inferCountryCode(location: string): string {
  const normalized = location.toLowerCase();
  const countryHints: Array<[string[], string]> = [
    [['canada', 'quebec', 'montreal', 'vancouver', 'toronto', 'ottawa', 'calgary'], 'ca'],
    [['united kingdom', 'england', 'scotland', 'wales', 'london', 'manchester'], 'uk'],
    [['australia', 'sydney', 'melbourne', 'brisbane'], 'au'],
    [['germany', 'berlin', 'munich', 'hamburg'], 'de'],
    [['france', 'paris', 'lyon', 'marseille'], 'fr'],
    [['japan', 'tokyo', 'osaka', 'kyoto'], 'jp'],
    [['spain', 'madrid', 'barcelona'], 'es'],
  ];
  return countryHints.find(([hints]) => hints.some((hint) => normalized.includes(hint)))?.[1] || 'us';
}

function isConversationalFollowUp(text: string): boolean {
  return /^(if you (share|provide|tell)|tell me|let me know|i can (build|create|help|suggest))/i.test(text.trim());
}

function extractAiOverviewContent(rawAiOverview: any): { answerText: string; answerBullets: string[] } {
  if (typeof rawAiOverview === 'string') return { answerText: rawAiOverview, answerBullets: [] };
  if (rawAiOverview.text) return { answerText: rawAiOverview.text, answerBullets: [] };
  if (Array.isArray(rawAiOverview.paragraphs)) {
    const paragraphs = rawAiOverview.paragraphs.filter((text: unknown) => typeof text === 'string' && !isConversationalFollowUp(text));
    return { answerText: paragraphs.join('\n\n'), answerBullets: [] };
  }

  const paragraphs: string[] = [];
  const bullets: string[] = [];
  const visitBlocks = (blocks: any[]) => {
    blocks.forEach((block) => {
      const snippet = String(block?.snippet || block?.text || '').trim();
      if (snippet && !isConversationalFollowUp(snippet)) {
        if (block.type === 'paragraph') paragraphs.push(snippet);
        else if (block.type === 'heading') bullets.push(snippet);
      }
      if (block.type === 'list' && Array.isArray(block.list)) {
        block.list.forEach((item: any) => {
          const itemText = [item?.title, item?.snippet].filter(Boolean).join(' ').trim();
          if (itemText && !isConversationalFollowUp(itemText)) bullets.push(itemText);
        });
      }
      if (Array.isArray(block.text_blocks)) visitBlocks(block.text_blocks);
    });
  };

  if (Array.isArray(rawAiOverview.text_blocks)) visitBlocks(rawAiOverview.text_blocks);
  if (!paragraphs.length && rawAiOverview.snippet && !isConversationalFollowUp(rawAiOverview.snippet)) {
    paragraphs.push(rawAiOverview.snippet);
  }
  return {
    answerText: paragraphs.join('\n\n'),
    answerBullets: Array.from(new Set(bullets)),
  };
}

/**
 * Calls SerpApi and normalizes response into SERPSnapshot
 */
export async function fetchLiveSerp(params: {
  keyword: string;
  location: string;
  language: string;
  device: 'desktop' | 'mobile';
  searchEngine: string;
}): Promise<SERPSnapshot> {
  const apiKey =
    process.env.SERPAPI_KEY ||
    process.env.SERP_API_KEY;

  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'MY_SERPAPI_KEY'
  ) {
    const err: any = new Error(
      'SERPAPI_KEY is missing on the server. Add it in Vercel Project Settings -> Environment Variables.'
    );
    err.code = 'NO_API_KEY';
    throw err;
  }

  const queryParams = new URLSearchParams({
    q: params.keyword.trim(),
    api_key: apiKey,
    engine: params.searchEngine.toLowerCase().includes('google') ? 'google' : 'google',
    device: params.device === 'mobile' ? 'mobile' : 'desktop',
    hl: params.language === 'Spanish' ? 'es' : params.language === 'French' ? 'fr' : params.language === 'German' ? 'de' : 'en',
    gl: inferCountryCode(params.location),
  });

  if (params.location && params.location.trim()) {
    queryParams.set('location', params.location.trim());
  }

  const serpApiUrl = `https://serpapi.com/search.json?${queryParams.toString()}`;

  const response = await fetch(serpApiUrl);
  if (!response.ok) {
    const errorText = await response.text();
    let message = `SerpApi returned HTTP status ${response.status}`;
    try {
      const parsedErr = JSON.parse(errorText);
      if (parsedErr.error) {
        message = parsedErr.error;
      }
    } catch {
      // Keep raw message
    }
    const err: any = new Error(`SERP Fetch Error: ${message}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`SerpApi error: ${data.error}`);
  }

  // 1. Organic Results
  const rawOrganic = data.organic_results || [];
  const organicResults: OrganicResult[] = rawOrganic.map((item: any, idx: number) => {
    const url = item.link || item.url || '';
    const domain = item.domain || extractDomain(url);
    const title = item.title || 'Untitled Result';
    const position = item.position || idx + 1;
    const snippet = item.snippet || item.description || '';

    let resultType = 'Standard Organic';
    if (item.sitelinks) resultType = 'Sitelinks';
    if (item.rich_snippet) resultType = 'Rich Snippet';
    if (item.product_info) resultType = 'Product Result';

    const pageType = classifyPageType(url, title, snippet, resultType);

    return {
      position,
      title,
      url,
      domain,
      snippet,
      resultType,
      pageType
    };
  });

  // Helper map for organic domain check
  const top10DomainMap = new Map<string, number>();
  organicResults.slice(0, 10).forEach(r => {
    if (!top10DomainMap.has(r.domain.toLowerCase())) {
      top10DomainMap.set(r.domain.toLowerCase(), r.position);
    }
  });

  // 2. AI Overview Processing
  const rawAiOverview = data.ai_overview;
  let aiOverview: AIOverview = {
    present: false,
    citations: [],
    mentionedEntities: [],
    statusNote: 'AI Overview was not present or returned by Google for this query.'
  };

  if (rawAiOverview) {
    const isPresent = true;
    const { answerText, answerBullets: structuredBullets } = extractAiOverviewContent(rawAiOverview);
    const answerBullets = Array.isArray(rawAiOverview.bullets)
      ? rawAiOverview.bullets.filter((text: unknown) => typeof text === 'string' && !isConversationalFollowUp(text))
      : structuredBullets;

    // Extract citations
    const citations: AIOverviewCitation[] = [];
    const rawRefs = rawAiOverview.references || rawAiOverview.sources || rawAiOverview.citations || rawAiOverview.links || [];

    if (Array.isArray(rawRefs)) {
      rawRefs.forEach((ref: any) => {
        const url = ref.link || ref.url || '';
        if (!url) return;
        const domain = extractDomain(url);
        const title = ref.title || ref.source || domain;
        const supportedClaim = ref.snippet || ref.claim || ref.context || undefined;

        const organicPos = top10DomainMap.get(domain.toLowerCase()) ?? null;
        const alsoInOrganicTop10 = organicPos !== null;

        citations.push({
          title,
          domain,
          url,
          supportedClaim,
          alsoInOrganicTop10,
          organicPosition: organicPos
        });
      });
    }

    // Extract mentioned entities
    const mentionedEntities: AIOverviewMentionedEntity[] = [];
    const citationDomains = new Set(citations.map(c => c.domain.toLowerCase()));

    // If SerpApi provided structured entities or if we parse mentioned entities from rawAiOverview
    const rawEntities = rawAiOverview.entities || rawAiOverview.mentioned_entities || [];
    if (Array.isArray(rawEntities) && rawEntities.length > 0) {
      rawEntities.forEach((ent: any) => {
        const name = typeof ent === 'string' ? ent : ent.name || ent.title;
        if (!name) return;
        const type = ent.type || 'Entity / Brand';
        const context = ent.context || ent.description;
        const entDomain = ent.domain ? ent.domain.toLowerCase() : '';
        const citedSourceAvailable = citationDomains.has(entDomain) || citations.some(c => c.title?.toLowerCase().includes(name.toLowerCase()));

        mentionedEntities.push({
          name,
          type,
          context,
          citedSourceAvailable
        });
      });
    } else if (answerText) {
      // Rule: Do NOT invent citations. But we can extract capitalized proper nouns/brands mentioned in text for mentioned entities table
      // e.g. software names or company names explicitly mentioned
      const words = answerText.match(/\b([A-Z][a-zA-Z0-9\.]+(?:\s+[A-Z][a-zA-Z0-9\.]+)*)\b/g) || [];
      const commonStopWords = new Set(['Google', 'Search', 'The', 'A', 'An', 'This', 'That', 'These', 'Key', 'Top', 'For', 'And', 'In', 'On', 'With', 'By', 'To', 'AI', 'Overview']);
      const uniqueNames = Array.from(new Set(words.filter(w => w.length > 2 && !commonStopWords.has(w)))).slice(0, 6);

      uniqueNames.forEach(name => {
        const hasCitation = citations.some(c => c.domain.toLowerCase().includes(name.toLowerCase()) || c.title?.toLowerCase().includes(name.toLowerCase()));
        mentionedEntities.push({
          name,
          type: 'Mentioned Term / Brand',
          context: `Mentioned in AI Overview summary text`,
          citedSourceAvailable: hasCitation
        });
      });
    }

    // Competitive analysis calculation
    const totalCited = citations.length;
    const citedInTop10 = citations.filter(c => c.alsoInOrganicTop10).length;
    const citedOutsideTop10 = totalCited - citedInTop10;

    let statusNote = undefined;
    if (citations.length === 0 && answerText) {
      statusNote = 'AI Overview detected, but citation data was not provided by the connected SERP API.';
    }

    aiOverview = {
      present: isPresent,
      position: rawAiOverview.position || 1,
      answerText,
      answerBullets,
      citations,
      mentionedEntities,
      competitiveAnalysis: {
        totalCitedSites: totalCited,
        citedInOrganicTop10Count: citedInTop10,
        citedOutsideOrganicTop10Count: citedOutsideTop10,
        opportunitiesToBecomeCitable: [
          'Publish concise, authoritative answer blocks addressing high-intent queries.',
          'Implement structured data (Article, TechArticle, SoftwareApplication) to aid AI parsing.',
          'Provide clear data tables and verifiable claims that LLMs can extract easily.'
        ]
      },
      statusNote
    };
  }

  // 3. Other SERP Features
  const features: SERPFeature[] = [];

  if (aiOverview.present) {
    features.push({
      type: 'AI Overview',
      present: true,
      position: aiOverview.position || 1,
      details: `Generative AI response detected with ${aiOverview.citations.length} cited sources.`,
      opportunity: 'Target citation placement with structured answer summaries.'
    });
  }

  if (data.related_questions && Array.isArray(data.related_questions) && data.related_questions.length > 0) {
    features.push({
      type: 'People Also Ask (PAA)',
      present: true,
      position: 2,
      details: `${data.related_questions.length} expandable question boxes found.`,
      opportunity: 'Incorporate exact PAA questions as H2/H3 subheadings with 40-word concise answers.'
    });
  }

  if (data.knowledge_graph) {
    features.push({
      type: 'Knowledge Graph',
      present: true,
      position: 1,
      details: data.knowledge_graph.title ? `Entity card for ${data.knowledge_graph.title}` : 'Knowledge Graph box present.',
      opportunity: 'Enhance brand entity authority via Wikidata and Schema.org Organization markup.'
    });
  }

  if (data.top_stories && data.top_stories.length > 0) {
    features.push({
      type: 'Top Stories / News',
      present: true,
      position: 3,
      details: `${data.top_stories.length} news items displayed.`,
      opportunity: 'Publish fresh press releases and news articles with NewsArticle schema.'
    });
  }

  if (data.inline_images || (data.images_results && data.images_results.length > 0)) {
    features.push({
      type: 'Image Pack',
      present: true,
      position: 4,
      details: 'Visual image grid detected in organic flow.',
      opportunity: 'Optimize target product and header images with descriptive ALT tags and image sitemaps.'
    });
  }

  if (data.inline_videos || (data.videos_results && data.videos_results.length > 0)) {
    features.push({
      type: 'Video Carousel',
      present: true,
      position: 4,
      details: 'Video search results or YouTube snippets present.',
      opportunity: 'Create video walkthroughs with YouTube video chapters and VideoObject schema.'
    });
  }

  if (data.ads && Array.isArray(data.ads) && data.ads.length > 0) {
    features.push({
      type: 'Sponsored Ads',
      present: true,
      position: 0,
      details: `${data.ads.length} paid ad placements above organic results.`,
      opportunity: 'High commercial intent keyword; test PPC campaigns or optimize organic landing pages.'
    });
  }

  if (data.related_searches && Array.isArray(data.related_searches) && data.related_searches.length > 0) {
    features.push({
      type: 'Related Searches',
      present: true,
      position: 10,
      details: `${data.related_searches.length} secondary search query suggestions.`,
      opportunity: 'Use related query phrases for semantic body copy and supporting content ideas.'
    });
  }

  return {
    keyword: params.keyword.trim(),
    location: params.location || 'United States',
    language: params.language || 'English',
    device: params.device || 'desktop',
    searchEngine: params.searchEngine || 'Google',
    capturedAt: new Date().toISOString(),
    organicResults,
    aiOverview,
    features,
    source: 'live-api'
  };
}
