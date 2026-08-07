import { SERPSnapshot, AnalysisReport } from '../types';

export const DEMO_SNAPSHOT: SERPSnapshot = {
  keyword: "project management software",
  location: "United States",
  language: "English",
  device: "desktop",
  searchEngine: "Google",
  capturedAt: "2026-08-05T14:30:00.000Z",
  source: "demo",
  organicResults: [
    {
      position: 1,
      title: "Best Project Management Software of 2026 | Forbes Advisor",
      url: "https://www.forbes.com/advisor/business/software/best-project-management-software/",
      domain: "forbes.com",
      snippet: "Compare top project management tools for team collaboration, task tracking, pricing, and key features in 2026.",
      resultType: "Listicle / Round-up"
    },
    {
      position: 2,
      title: "Monday.com: Flexible Work Management & Team Productivity",
      url: "https://monday.com/work-management",
      domain: "monday.com",
      snippet: "Manage teams, projects, and workflows easily with monday.com. Start your free trial today.",
      resultType: "Product Landing Page"
    },
    {
      position: 3,
      title: "Asana: Manage Your Team's Work, Projects, & Tasks Online",
      url: "https://asana.com",
      domain: "asana.com",
      snippet: "Work on big ideas, together. Asana helps teams orchestrate tasks, workflows, and strategic goals.",
      resultType: "Product Landing Page"
    },
    {
      position: 4,
      title: "ClickUp™ | One App To Replace Them All",
      url: "https://clickup.com",
      domain: "clickup.com",
      snippet: "All-in-one project management tool with tasks, docs, chat, goals, and whiteboards.",
      resultType: "Product Landing Page"
    },
    {
      position: 5,
      title: "15 Best Project Management Tools for Teams (2026 Review)",
      url: "https://www.pcmag.com/picks/the-best-project-management-software",
      domain: "pcmag.com",
      snippet: "In-depth reviews and comparison chart for the leading project management platforms.",
      resultType: "Review / Buyer's Guide"
    },
    {
      position: 6,
      title: "Jira | Issue & Project Tracking Software | Atlassian",
      url: "https://www.atlassian.com/software/jira",
      domain: "atlassian.com",
      snippet: "Designed for agile teams to plan, track, and release world-class software.",
      resultType: "Product Landing Page"
    },
    {
      position: 7,
      title: "Smartsheet: Work Management & Automation Platform",
      url: "https://www.smartsheet.com",
      domain: "smartsheet.com",
      snippet: "Enterprise-grade spreadsheet-based project management and workflow automation.",
      resultType: "Product Landing Page"
    },
    {
      position: 8,
      title: "Trello: Manage Team Projects From Anywhere",
      url: "https://trello.com",
      domain: "trello.com",
      snippet: "Infinitely flexible kanban boards, cards, and lists for organizing projects.",
      resultType: "Product Landing Page"
    },
    {
      position: 9,
      title: "What is Project Management Software? Definition & Guide",
      url: "https://www.cio.com/article/230890/what-is-project-management-software.html",
      domain: "cio.com",
      snippet: "Learn how project management software improves resource allocation, scheduling, and risk tracking.",
      resultType: "Informational Guide"
    },
    {
      position: 10,
      title: "Wrike | Versatile Work Management Software",
      url: "https://www.wrike.com",
      domain: "wrike.com",
      snippet: "Streamline cross-functional work with customizable Gantt charts, dashboards, and time tracking.",
      resultType: "Product Landing Page"
    }
  ],
  aiOverview: {
    present: true,
    position: 1,
    answerText: "Project management software helps individuals and teams plan, coordinate, and execute complex workflows. Key capabilities include task scheduling (Gantt & Kanban), resource allocation, time tracking, file sharing, and real-time collaboration. Popular solutions cater to different team sizes, ranging from visual tools like Trello and Monday.com to software-centric platforms like Jira.",
    answerBullets: [
      "Core features: Task management, Gantt charts, resource scheduling, reporting, and integrations.",
      "Top choices for general business: Monday.com, ClickUp, Asana, and Smartsheet.",
      "Best for software development: Jira by Atlassian.",
      "Best for lightweight visual organization: Trello."
    ],
    citations: [
      {
        title: "Best Project Management Software of 2026 | Forbes Advisor",
        domain: "forbes.com",
        url: "https://www.forbes.com/advisor/business/software/best-project-management-software/",
        supportedClaim: "Evaluates pricing tiers, Gantt chart support, and user ratings for Monday.com, Asana, and ClickUp.",
        alsoInOrganicTop10: true,
        organicPosition: 1
      },
      {
        title: "Project Management Software Comparison - PCMag",
        domain: "pcmag.com",
        url: "https://www.pcmag.com/picks/the-best-project-management-software",
        supportedClaim: "Summarizes feature matrices, security compliance, and enterprise deployment options.",
        alsoInOrganicTop10: true,
        organicPosition: 5
      },
      {
        title: "Project Management Basics & Tool Taxonomy | PMI.org",
        domain: "pmi.org",
        url: "https://www.pmi.org/learning/featured-topics/software-selection",
        supportedClaim: "Defines methodology frameworks (Agile, Waterfall, Hybrid) and resource allocation standards.",
        alsoInOrganicTop10: false,
        organicPosition: null
      }
    ],
    mentionedEntities: [
      {
        name: "Monday.com",
        type: "Software Platform",
        context: "Highlighted as a top choice for general work management and customizable visual boards.",
        citedSourceAvailable: true
      },
      {
        name: "ClickUp",
        type: "Software Platform",
        context: "Referenced as an all-in-one productivity suite with native docs and whiteboards.",
        citedSourceAvailable: true
      },
      {
        name: "Jira",
        type: "Software Platform",
        context: "Identified as the industry standard for agile software development teams.",
        citedSourceAvailable: false
      },
      {
        name: "Trello",
        type: "Software Platform",
        context: "Noted for lightweight Kanban board workflows.",
        citedSourceAvailable: false
      },
      {
        name: "Project Management Institute (PMI)",
        type: "Professional Body",
        context: "Provided structural standards for PM governance and maturity models.",
        citedSourceAvailable: true
      }
    ],
    competitiveAnalysis: {
      totalCitedSites: 3,
      citedInOrganicTop10Count: 2,
      citedOutsideOrganicTop10Count: 1,
      opportunitiesToBecomeCitable: [
        "Include structured comparison tables with explicit pricing per user/month and security standards (SOC2, GDPR).",
        "Add original methodology benchmarking or user survey data regarding adoption rates.",
        "Provide direct schema markup (SoftwareApplication) with clear feature lists."
      ]
    }
  },
  features: [
    {
      type: "AI Overview",
      present: true,
      position: 1,
      details: "Top-of-page AI generated answer with 3 cited domains and 5 mentioned software brands.",
      opportunity: "Optimize for concise definitional content and structured feature matrices."
    },
    {
      type: "People Also Ask (PAA)",
      present: true,
      position: 2,
      details: "4 expandable questions covering free PM tools, essential features, and Jira vs Monday comparisons.",
      opportunity: "Create direct Q&A accordions answering 'What are the 5 main features of PM software?'"
    },
    {
      type: "Sponsored Ads",
      present: true,
      position: 0,
      details: "4 top ads (Smartsheet, Monday, ClickUp, Notion).",
      opportunity: "High commercial intent keyword; competitor bidding is aggressive."
    },
    {
      type: "Related Searches",
      present: true,
      position: 11,
      details: "Searches related to 'open source project management software', 'free project management software', 'PM software for construction'.",
      opportunity: "Build specialized sub-pages for open-source and vertical-specific PM tools."
    }
  ]
};

export const DEMO_PREVIOUS_SNAPSHOT: SERPSnapshot = {
  keyword: "project management software",
  location: "United States",
  language: "English",
  device: "desktop",
  searchEngine: "Google",
  capturedAt: "2026-07-01T10:00:00.000Z",
  source: "demo",
  organicResults: [
    {
      position: 1,
      title: "15 Best Project Management Tools for Teams | PCMag",
      url: "https://www.pcmag.com/picks/the-best-project-management-software",
      domain: "pcmag.com",
      snippet: "In-depth reviews and comparison chart.",
      resultType: "Review"
    },
    {
      position: 2,
      title: "Monday.com: Flexible Work Management",
      url: "https://monday.com/work-management",
      domain: "monday.com",
      snippet: "Manage teams and projects easily.",
      resultType: "Product Landing Page"
    },
    {
      position: 3,
      title: "Asana: Manage Your Team's Work",
      url: "https://asana.com",
      domain: "asana.com",
      snippet: "Orchestrate tasks and goals.",
      resultType: "Product Landing Page"
    },
    {
      position: 4,
      title: "Best Project Management Software | Forbes Advisor",
      url: "https://www.forbes.com/advisor/business/software/best-project-management-software/",
      domain: "forbes.com",
      snippet: "Compare top project tools.",
      resultType: "Listicle"
    },
    {
      position: 5,
      title: "Trello: Manage Team Projects",
      url: "https://trello.com",
      domain: "trello.com",
      snippet: "Flexible kanban boards.",
      resultType: "Product Landing Page"
    },
    {
      position: 6,
      title: "Jira | Atlassian",
      url: "https://www.atlassian.com/software/jira",
      domain: "atlassian.com",
      snippet: "Issue tracking.",
      resultType: "Product Landing Page"
    },
    {
      position: 7,
      title: "ClickUp | One App To Replace Them All",
      url: "https://clickup.com",
      domain: "clickup.com",
      snippet: "All in one app.",
      resultType: "Product Landing Page"
    },
    {
      position: 8,
      title: "Smartsheet",
      url: "https://www.smartsheet.com",
      domain: "smartsheet.com",
      snippet: "Work execution.",
      resultType: "Product Landing Page"
    },
    {
      position: 9,
      title: "Basecamp: Project Management & Team Communication",
      url: "https://basecamp.com",
      domain: "basecamp.com",
      snippet: "Simple project organization.",
      resultType: "Product Landing Page"
    },
    {
      position: 10,
      title: "Wrike Work Management",
      url: "https://www.wrike.com",
      domain: "wrike.com",
      snippet: "Customizable Gantt charts.",
      resultType: "Product Landing Page"
    }
  ],
  aiOverview: {
    present: false,
    citations: [],
    mentionedEntities: []
  },
  features: [
    { type: "People Also Ask", present: true, position: 2 }
  ]
};

export const DEMO_ANALYSIS: AnalysisReport = {
  generatedAt: "2026-08-05T14:31:00.000Z",
  topSummary: {
    dominantIntent: "Commercial Investigation & High-Intent Comparison",
    competitorPattern: "Independent comparison round-ups (Forbes, PCMag) dominate top positions alongside direct SaaS landing pages.",
    aiOverviewOpportunity: "Provide structured pricing matrices and methodology definitions to capture AI Overview citations.",
    recommendedAction: "Publish a comprehensive 2026 comparison guide featuring verifiable feature matrices, pricing breakdowns, and schema markup."
  },
  searchIntent: {
    primaryIntent: "Commercial / Investigative",
    secondaryIntent: "Transactional (Free Trial / Signup)",
    evidence: [
      "Top organic position is held by an independent buyer's guide round-up (Forbes Advisor).",
      "Positions 2-4 belong to direct vendor homepages offering free trials (Monday, Asana, ClickUp).",
      "Heavy presence of top sponsored ads indicates lucrative commercial intent."
    ],
    dominantFormat: "Comparison Round-ups & Vendor Product Overview Landing Pages",
    userExpectations: "Users expect a quick overview of top tools, feature comparisons (Gantt, Kanban, time tracking), pricing per user/month, and direct trial links."
  },
  contentRecommendations: {
    recommendedPageType: "In-Depth Comparison Round-up / Buyer's Guide with Interactive Filter Table",
    requiredSections: [
      "Quick Recommendation Matrix (Best overall, best for small teams, best for agile)",
      "Detailed Vendor Reviews (Pricing, Pros/Cons, Key Features, Integration limits)",
      "Feature Comparison Table (Gantt charts, workload views, guest access, API)",
      "How to Choose Project Management Software (Methodology, budget factors)",
      "Frequently Asked Questions (Answering PAA queries directly)"
    ],
    topicsToCover: [
      "Security & Compliance (SOC2, GDPR, Single Sign-On)",
      "Free Plan Limits vs Paid Tier Upgrades",
      "Agile vs Waterfall vs Hybrid PM Methodologies",
      "Third-party integrations (Slack, Google Workspace, GitHub)"
    ],
    featureOpportunities: [
      "Target AI Overview citations by placing key feature summaries in structured bullet lists near H2 headings.",
      "Target PAA boxes by adding FAQ schema and concise 40-word answers.",
      "Use SoftwareApplication structured data schema for rich snippets."
    ],
    competitiveDifferentiators: [
      "Provide real screenshot comparisons of user interface responsiveness.",
      "Include transparent pricing calculators based on team size."
    ],
    eeatRequirements: [
      "Clear author bio with hands-on project management credentials (e.g. PMP certification).",
      "Explicit testing methodology detailing how software was evaluated.",
      "Last updated date clearly visible with 2026 data freshness."
    ],
    topActions: [
      "Create or refresh a 'Best Project Management Software 2026' comparison guide.",
      "Implement SoftwareApplication schema with pricing and review ratings.",
      "Structure key feature tables so Google AI Overview can easily parse and cite your domain."
    ]
  }
};
