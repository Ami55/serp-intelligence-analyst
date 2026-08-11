var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api-source/serp.ts
var serp_exports = {};
__export(serp_exports, {
  default: () => handler
});
module.exports = __toCommonJS(serp_exports);

// src/utils/pageType.ts
function classifyPageType(url = "", title = "", snippet = "", resultType = "") {
  const lowerUrl = (url || "").toLowerCase();
  const lowerTitle = (title || "").toLowerCase();
  const lowerSnippet = (snippet || "").toLowerCase();
  const lowerResult = (resultType || "").toLowerCase();
  if (lowerTitle.includes("best ") || lowerTitle.includes("top 10") || lowerTitle.includes("top 5") || lowerTitle.includes("top 15") || lowerTitle.includes(" review") || lowerTitle.includes(" vs ") || lowerTitle.includes("versus") || lowerTitle.includes("comparison") || lowerTitle.includes("alternative") || lowerResult.includes("listicle") || lowerResult.includes("review")) {
    return "Review / Comparison";
  }
  if (lowerUrl.includes("/blog/") || lowerUrl.includes("/article/") || lowerUrl.includes("/news/") || lowerUrl.includes("/post/") || lowerUrl.includes("/insights/") || lowerTitle.startsWith("how to") || lowerTitle.includes("what is") || lowerTitle.includes("guide to") || lowerTitle.includes("tips for") || lowerTitle.includes("definition") || lowerResult.includes("informational")) {
    return "Blog / Informational";
  }
  if (lowerUrl.includes("/category/") || lowerUrl.includes("/categories/") || lowerUrl.includes("/collections/") || lowerUrl.includes("/shop/") || lowerUrl.includes("/store/") || lowerTitle.includes("shop all") || lowerTitle.includes("buy online") || lowerTitle.includes("store") || lowerResult.includes("category")) {
    return "E-commerce Category";
  }
  if (lowerUrl.includes("/tool/") || lowerUrl.includes("/calculator/") || lowerUrl.includes("/app/") || lowerUrl.includes("/generator/") || lowerTitle.includes("free online") || lowerTitle.includes("calculator") || lowerTitle.includes("generator") || lowerTitle.includes("converter")) {
    return "SaaS / Web Tool";
  }
  if (lowerUrl.includes("wikipedia.org") || lowerUrl.includes("yelp.com") || lowerUrl.includes("tripadvisor.com") || lowerUrl.includes("g2.com") || lowerUrl.includes("capterra.com") || lowerUrl.includes("trustpilot.com") || lowerUrl.includes("linkedin.com") || lowerUrl.includes("/directory/") || lowerUrl.includes("/listings/")) {
    return "Directory / Marketplace";
  }
  if (lowerUrl.includes("/docs/") || lowerUrl.includes("/documentation/") || lowerUrl.includes("/help/") || lowerUrl.includes("/kb/") || lowerUrl.includes("/guide/") || lowerUrl.includes("/learn/")) {
    return "Guide / Documentation";
  }
  if (lowerUrl.endsWith(".gov") || lowerUrl.includes(".gov/") || lowerUrl.endsWith(".edu") || lowerUrl.includes(".edu/") || lowerUrl.includes("/about") || lowerUrl.includes("/contact")) {
    return "Official / Institutional";
  }
  if (lowerUrl.includes("/pricing") || lowerUrl.includes("/features") || lowerUrl.includes("/product") || lowerUrl.includes("/solutions") || lowerResult.includes("landing") || lowerResult.includes("product") || lowerSnippet.includes("free trial") || lowerSnippet.includes("sign up")) {
    return "Commercial / Product";
  }
  return "Commercial / Product";
}

// server/serp.ts
function extractDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr || "unknown";
  }
}
function inferCountryCode(location) {
  const normalized = location.toLowerCase();
  const countryHints = [
    [["canada", "quebec", "montreal", "vancouver", "toronto", "ottawa", "calgary"], "ca"],
    [["united kingdom", "england", "scotland", "wales", "london", "manchester"], "uk"],
    [["australia", "sydney", "melbourne", "brisbane"], "au"],
    [["germany", "berlin", "munich", "hamburg"], "de"],
    [["france", "paris", "lyon", "marseille"], "fr"],
    [["japan", "tokyo", "osaka", "kyoto"], "jp"],
    [["spain", "madrid", "barcelona"], "es"]
  ];
  return countryHints.find(([hints]) => hints.some((hint) => normalized.includes(hint)))?.[1] || "us";
}
function isConversationalFollowUp(text) {
  return /^(if you (share|provide|tell)|tell me|let me know|i can (build|create|help|suggest))/i.test(text.trim());
}
function extractAiOverviewContent(rawAiOverview) {
  if (typeof rawAiOverview === "string") return { answerText: rawAiOverview, answerBullets: [] };
  if (rawAiOverview.text) return { answerText: rawAiOverview.text, answerBullets: [] };
  if (Array.isArray(rawAiOverview.paragraphs)) {
    const paragraphs2 = rawAiOverview.paragraphs.filter((text) => typeof text === "string" && !isConversationalFollowUp(text));
    return { answerText: paragraphs2.join("\n\n"), answerBullets: [] };
  }
  const paragraphs = [];
  const bullets = [];
  const visitBlocks = (blocks) => {
    blocks.forEach((block) => {
      const snippet = String(block?.snippet || block?.text || "").trim();
      if (snippet && !isConversationalFollowUp(snippet)) {
        if (block.type === "paragraph") paragraphs.push(snippet);
        else if (block.type === "heading") bullets.push(snippet);
      }
      if (block.type === "list" && Array.isArray(block.list)) {
        block.list.forEach((item) => {
          const itemText = [item?.title, item?.snippet].filter(Boolean).join(" ").trim();
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
    answerText: paragraphs.join("\n\n"),
    answerBullets: Array.from(new Set(bullets))
  };
}
async function fetchLiveSerp(params) {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_SERPAPI_KEY") {
    const err = new Error(
      "SERPAPI_KEY is missing on the server. Add it in Vercel Project Settings -> Environment Variables."
    );
    err.code = "NO_API_KEY";
    throw err;
  }
  const queryParams = new URLSearchParams({
    q: params.keyword.trim(),
    api_key: apiKey,
    engine: params.searchEngine.toLowerCase().includes("google") ? "google" : "google",
    device: params.device === "mobile" ? "mobile" : "desktop",
    hl: params.language === "Spanish" ? "es" : params.language === "French" ? "fr" : params.language === "German" ? "de" : "en",
    gl: inferCountryCode(params.location)
  });
  if (params.location && params.location.trim()) {
    queryParams.set("location", params.location.trim());
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
    }
    const err = new Error(`SERP Fetch Error: ${message}`);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`SerpApi error: ${data.error}`);
  }
  const rawOrganic = data.organic_results || [];
  const organicResults = rawOrganic.map((item, idx) => {
    const url = item.link || item.url || "";
    const domain = item.domain || extractDomain(url);
    const title = item.title || "Untitled Result";
    const position = item.position || idx + 1;
    const snippet = item.snippet || item.description || "";
    let resultType = "Standard Organic";
    if (item.sitelinks) resultType = "Sitelinks";
    if (item.rich_snippet) resultType = "Rich Snippet";
    if (item.product_info) resultType = "Product Result";
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
  const top10DomainMap = /* @__PURE__ */ new Map();
  organicResults.slice(0, 10).forEach((r) => {
    if (!top10DomainMap.has(r.domain.toLowerCase())) {
      top10DomainMap.set(r.domain.toLowerCase(), r.position);
    }
  });
  const rawAiOverview = data.ai_overview;
  let aiOverview = {
    present: false,
    citations: [],
    mentionedEntities: [],
    statusNote: "AI Overview was not present or returned by Google for this query."
  };
  if (rawAiOverview) {
    const isPresent = true;
    const { answerText, answerBullets: structuredBullets } = extractAiOverviewContent(rawAiOverview);
    const answerBullets = Array.isArray(rawAiOverview.bullets) ? rawAiOverview.bullets.filter((text) => typeof text === "string" && !isConversationalFollowUp(text)) : structuredBullets;
    const citations = [];
    const rawRefs = rawAiOverview.references || rawAiOverview.sources || rawAiOverview.citations || rawAiOverview.links || [];
    if (Array.isArray(rawRefs)) {
      rawRefs.forEach((ref) => {
        const url = ref.link || ref.url || "";
        if (!url) return;
        const domain = extractDomain(url);
        const title = ref.title || ref.source || domain;
        const supportedClaim = ref.snippet || ref.claim || ref.context || void 0;
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
    const mentionedEntities = [];
    const citationDomains = new Set(citations.map((c) => c.domain.toLowerCase()));
    const rawEntities = rawAiOverview.entities || rawAiOverview.mentioned_entities || [];
    if (Array.isArray(rawEntities) && rawEntities.length > 0) {
      rawEntities.forEach((ent) => {
        const name = typeof ent === "string" ? ent : ent.name || ent.title;
        if (!name) return;
        const type = ent.type || "Entity / Brand";
        const context = ent.context || ent.description;
        const entDomain = ent.domain ? ent.domain.toLowerCase() : "";
        const citedSourceAvailable = citationDomains.has(entDomain) || citations.some((c) => c.title?.toLowerCase().includes(name.toLowerCase()));
        mentionedEntities.push({
          name,
          type,
          context,
          citedSourceAvailable
        });
      });
    } else if (answerText) {
      const words = answerText.match(/\b([A-Z][a-zA-Z0-9\.]+(?:\s+[A-Z][a-zA-Z0-9\.]+)*)\b/g) || [];
      const commonStopWords = /* @__PURE__ */ new Set(["Google", "Search", "The", "A", "An", "This", "That", "These", "Key", "Top", "For", "And", "In", "On", "With", "By", "To", "AI", "Overview"]);
      const uniqueNames = Array.from(new Set(words.filter((w) => w.length > 2 && !commonStopWords.has(w)))).slice(0, 6);
      uniqueNames.forEach((name) => {
        const hasCitation = citations.some((c) => c.domain.toLowerCase().includes(name.toLowerCase()) || c.title?.toLowerCase().includes(name.toLowerCase()));
        mentionedEntities.push({
          name,
          type: "Mentioned Term / Brand",
          context: `Mentioned in AI Overview summary text`,
          citedSourceAvailable: hasCitation
        });
      });
    }
    const totalCited = citations.length;
    const citedInTop10 = citations.filter((c) => c.alsoInOrganicTop10).length;
    const citedOutsideTop10 = totalCited - citedInTop10;
    let statusNote = void 0;
    if (citations.length === 0 && answerText) {
      statusNote = "AI Overview detected, but citation data was not provided by the connected SERP API.";
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
          "Publish concise, authoritative answer blocks addressing high-intent queries.",
          "Implement structured data (Article, TechArticle, SoftwareApplication) to aid AI parsing.",
          "Provide clear data tables and verifiable claims that LLMs can extract easily."
        ]
      },
      statusNote
    };
  }
  const features = [];
  if (aiOverview.present) {
    features.push({
      type: "AI Overview",
      present: true,
      position: aiOverview.position || 1,
      details: `Generative AI response detected with ${aiOverview.citations.length} cited sources.`,
      opportunity: "Target citation placement with structured answer summaries."
    });
  }
  if (data.related_questions && Array.isArray(data.related_questions) && data.related_questions.length > 0) {
    features.push({
      type: "People Also Ask (PAA)",
      present: true,
      position: 2,
      details: `${data.related_questions.length} expandable question boxes found.`,
      opportunity: "Incorporate exact PAA questions as H2/H3 subheadings with 40-word concise answers."
    });
  }
  if (data.knowledge_graph) {
    features.push({
      type: "Knowledge Graph",
      present: true,
      position: 1,
      details: data.knowledge_graph.title ? `Entity card for ${data.knowledge_graph.title}` : "Knowledge Graph box present.",
      opportunity: "Enhance brand entity authority via Wikidata and Schema.org Organization markup."
    });
  }
  if (data.top_stories && data.top_stories.length > 0) {
    features.push({
      type: "Top Stories / News",
      present: true,
      position: 3,
      details: `${data.top_stories.length} news items displayed.`,
      opportunity: "Publish fresh press releases and news articles with NewsArticle schema."
    });
  }
  if (data.inline_images || data.images_results && data.images_results.length > 0) {
    features.push({
      type: "Image Pack",
      present: true,
      position: 4,
      details: "Visual image grid detected in organic flow.",
      opportunity: "Optimize target product and header images with descriptive ALT tags and image sitemaps."
    });
  }
  if (data.inline_videos || data.videos_results && data.videos_results.length > 0) {
    features.push({
      type: "Video Carousel",
      present: true,
      position: 4,
      details: "Video search results or YouTube snippets present.",
      opportunity: "Create video walkthroughs with YouTube video chapters and VideoObject schema."
    });
  }
  if (data.ads && Array.isArray(data.ads) && data.ads.length > 0) {
    features.push({
      type: "Sponsored Ads",
      present: true,
      position: 0,
      details: `${data.ads.length} paid ad placements above organic results.`,
      opportunity: "High commercial intent keyword; test PPC campaigns or optimize organic landing pages."
    });
  }
  if (data.related_searches && Array.isArray(data.related_searches) && data.related_searches.length > 0) {
    features.push({
      type: "Related Searches",
      present: true,
      position: 10,
      details: `${data.related_searches.length} secondary search query suggestions.`,
      opportunity: "Use related query phrases for semantic body copy and supporting content ideas."
    });
  }
  return {
    keyword: params.keyword.trim(),
    location: params.location || "United States",
    language: params.language || "English",
    device: params.device || "desktop",
    searchEngine: params.searchEngine || "Google",
    capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
    organicResults,
    aiOverview,
    features,
    source: "live-api"
  };
}

// api-source/serp.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const { keyword, location, language, device, searchEngine, requestId } = req.body || {};
  if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
    return res.status(400).json({ error: "Keyword is required and cannot be empty." });
  }
  try {
    const snapshot = await fetchLiveSerp({
      keyword: keyword.trim(),
      location: location || "United States",
      language: language || "English",
      device: device === "mobile" ? "mobile" : "desktop",
      searchEngine: searchEngine || "Google"
    });
    return res.status(200).json({ requestId, snapshot });
  } catch (error) {
    console.error("API /api/serp error:", error);
    const statusCode = error.status || (error.code === "NO_API_KEY" ? 503 : 500);
    return res.status(statusCode).json({
      error: error.message || "Failed to fetch SERP data from provider.",
      code: error.code || "SERP_FETCH_FAILED"
    });
  }
}
