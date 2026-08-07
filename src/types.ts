/**
 * Types for SERP Intelligence Analyst
 */

export interface OrganicResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  resultType?: string;
}

export interface AIOverviewCitation {
  title?: string;
  domain: string;
  url: string;
  supportedClaim?: string;
  alsoInOrganicTop10?: boolean;
  organicPosition?: number | null;
}

export interface AIOverviewMentionedEntity {
  name: string;
  type?: string;
  context?: string;
  citedSourceAvailable: boolean;
}

export interface AIOverviewCompetitiveAnalysis {
  totalCitedSites: number;
  citedInOrganicTop10Count: number;
  citedOutsideOrganicTop10Count: number;
  opportunitiesToBecomeCitable: string[];
}

export interface AIOverview {
  present: boolean;
  position?: number;
  answerText?: string;
  answerBullets?: string[];
  citations: AIOverviewCitation[];
  mentionedEntities: AIOverviewMentionedEntity[];
  competitiveAnalysis?: AIOverviewCompetitiveAnalysis;
  statusNote?: string;
}

export interface SERPFeature {
  type: string;
  present: boolean;
  position?: number;
  details?: string;
  opportunity?: string;
}

export type SERPSource = 'live-api' | 'imported' | 'demo';

export interface SERPSnapshot {
  keyword: string;
  location: string;
  language: string;
  device: 'desktop' | 'mobile';
  searchEngine: string;
  capturedAt: string;
  organicResults: OrganicResult[];
  aiOverview: AIOverview;
  features: SERPFeature[];
  source: SERPSource;
}

export interface TopReportSummary {
  dominantIntent: string;
  competitorPattern: string;
  aiOverviewOpportunity: string;
  recommendedAction: string;
}

export interface SearchIntentAnalysis {
  primaryIntent: string;
  secondaryIntent: string;
  evidence: string[];
  dominantFormat: string;
  userExpectations: string;
}

export interface ContentRecommendations {
  recommendedPageType: string;
  requiredSections: string[];
  topicsToCover: string[];
  featureOpportunities: string[];
  competitiveDifferentiators: string[];
  eeatRequirements: string[];
  topActions: string[];
}

export interface AnalysisReport {
  topSummary: TopReportSummary;
  searchIntent: SearchIntentAnalysis;
  contentRecommendations: ContentRecommendations;
  generatedAt: string;
}

export interface MovementItem {
  domainOrUrl: string;
  title?: string;
  previousPosition: number | null; // null if new entrant
  currentPosition: number | null;  // null if dropped off
  change: number;                  // positive or negative
  status: 'moved_up' | 'moved_down' | 'new_entry' | 'dropped_off' | 'unchanged' | 'url_replaced';
}

export interface MovementAnalysis {
  items: MovementItem[];
  summary: {
    moversCount: number;
    newEntrantsCount: number;
    dropOffsCount: number;
    aiOverviewChanges: string;
    serpFeatureChanges: string;
    strategicImplications: string[];
  };
}

export interface SerpQueryParams {
  keyword: string;
  location: string;
  language: string;
  device: 'desktop' | 'mobile';
  searchEngine: string;
}
