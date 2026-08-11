import { OrganicResult } from '../types';

export type PageTypeCategory =
  | 'Commercial / Product'
  | 'Blog / Informational'
  | 'Review / Comparison'
  | 'E-commerce Category'
  | 'SaaS / Web Tool'
  | 'Directory / Marketplace'
  | 'Guide / Documentation'
  | 'Official / Institutional';

/**
 * Classifies a SERP organic result into a page type category
 */
export function classifyPageType(
  url: string = '',
  title: string = '',
  snippet: string = '',
  resultType: string = ''
): PageTypeCategory {
  const lowerUrl = (url || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();
  const lowerSnippet = (snippet || '').toLowerCase();
  const lowerResult = (resultType || '').toLowerCase();

  // 1. Review / Comparison / Listicle
  if (
    lowerTitle.includes('best ') ||
    lowerTitle.includes('top 10') ||
    lowerTitle.includes('top 5') ||
    lowerTitle.includes('top 15') ||
    lowerTitle.includes(' review') ||
    lowerTitle.includes(' vs ') ||
    lowerTitle.includes('versus') ||
    lowerTitle.includes('comparison') ||
    lowerTitle.includes('alternative') ||
    lowerResult.includes('listicle') ||
    lowerResult.includes('review')
  ) {
    return 'Review / Comparison';
  }

  // 2. Blog / Informational Article
  if (
    lowerUrl.includes('/blog/') ||
    lowerUrl.includes('/article/') ||
    lowerUrl.includes('/news/') ||
    lowerUrl.includes('/post/') ||
    lowerUrl.includes('/insights/') ||
    lowerTitle.startsWith('how to') ||
    lowerTitle.includes('what is') ||
    lowerTitle.includes('guide to') ||
    lowerTitle.includes('tips for') ||
    lowerTitle.includes('definition') ||
    lowerResult.includes('informational')
  ) {
    return 'Blog / Informational';
  }

  // 3. E-commerce Category / Shop
  if (
    lowerUrl.includes('/category/') ||
    lowerUrl.includes('/categories/') ||
    lowerUrl.includes('/collections/') ||
    lowerUrl.includes('/shop/') ||
    lowerUrl.includes('/store/') ||
    lowerTitle.includes('shop all') ||
    lowerTitle.includes('buy online') ||
    lowerTitle.includes('store') ||
    lowerResult.includes('category')
  ) {
    return 'E-commerce Category';
  }

  // 4. SaaS / Interactive Web Tool
  if (
    lowerUrl.includes('/tool/') ||
    lowerUrl.includes('/calculator/') ||
    lowerUrl.includes('/app/') ||
    lowerUrl.includes('/generator/') ||
    lowerTitle.includes('free online') ||
    lowerTitle.includes('calculator') ||
    lowerTitle.includes('generator') ||
    lowerTitle.includes('converter')
  ) {
    return 'SaaS / Web Tool';
  }

  // 5. Directory / Marketplace
  if (
    lowerUrl.includes('wikipedia.org') ||
    lowerUrl.includes('yelp.com') ||
    lowerUrl.includes('tripadvisor.com') ||
    lowerUrl.includes('g2.com') ||
    lowerUrl.includes('capterra.com') ||
    lowerUrl.includes('trustpilot.com') ||
    lowerUrl.includes('linkedin.com') ||
    lowerUrl.includes('/directory/') ||
    lowerUrl.includes('/listings/')
  ) {
    return 'Directory / Marketplace';
  }

  // 6. Guide / Documentation
  if (
    lowerUrl.includes('/docs/') ||
    lowerUrl.includes('/documentation/') ||
    lowerUrl.includes('/help/') ||
    lowerUrl.includes('/kb/') ||
    lowerUrl.includes('/guide/') ||
    lowerUrl.includes('/learn/')
  ) {
    return 'Guide / Documentation';
  }

  // 7. Official / Institutional
  if (
    lowerUrl.endsWith('.gov') ||
    lowerUrl.includes('.gov/') ||
    lowerUrl.endsWith('.edu') ||
    lowerUrl.includes('.edu/') ||
    lowerUrl.includes('/about') ||
    lowerUrl.includes('/contact')
  ) {
    return 'Official / Institutional';
  }

  // 8. Commercial / Product Page
  if (
    lowerUrl.includes('/pricing') ||
    lowerUrl.includes('/features') ||
    lowerUrl.includes('/product') ||
    lowerUrl.includes('/solutions') ||
    lowerResult.includes('landing') ||
    lowerResult.includes('product') ||
    lowerSnippet.includes('free trial') ||
    lowerSnippet.includes('sign up')
  ) {
    return 'Commercial / Product';
  }

  return 'Commercial / Product';
}

/**
 * Ensures an OrganicResult object has a populated pageType property
 */
export function ensurePageType(result: OrganicResult): string {
  if (result.pageType && result.pageType.trim()) {
    return result.pageType;
  }
  return classifyPageType(result.url, result.title, result.snippet, result.resultType);
}

/**
 * Returns tailwind badge styling classes for page types
 */
export function getPageTypeBadgeStyle(pageType?: string): string {
  const type = (pageType || '').toLowerCase();
  if (type.includes('blog') || type.includes('informational')) {
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  }
  if (type.includes('review') || type.includes('comparison')) {
    return 'bg-amber-950/80 text-amber-300 border-amber-800';
  }
  if (type.includes('e-commerce') || type.includes('category')) {
    return 'bg-purple-950/80 text-purple-300 border-purple-800';
  }
  if (type.includes('saas') || type.includes('tool')) {
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  }
  if (type.includes('directory') || type.includes('marketplace')) {
    return 'bg-blue-950/80 text-blue-300 border-blue-800';
  }
  if (type.includes('guide') || type.includes('documentation')) {
    return 'bg-teal-950/80 text-teal-300 border-teal-800';
  }
  if (type.includes('official') || type.includes('institutional')) {
    return 'bg-slate-800 text-slate-300 border-slate-700';
  }
  // Default Commercial / Product
  return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
}

/**
 * Calculates page type distribution for a set of organic results
 */
export function getPageTypeDistribution(results: OrganicResult[]): Array<{ pageType: string; count: number; percentage: number }> {
  if (!results || results.length === 0) return [];

  const counts: Record<string, number> = {};
  results.forEach(res => {
    const pt = ensurePageType(res);
    counts[pt] = (counts[pt] || 0) + 1;
  });

  const total = results.length;
  return Object.entries(counts)
    .map(([pageType, count]) => ({
      pageType,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}
