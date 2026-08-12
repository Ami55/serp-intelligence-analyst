import { OrganicResult } from '../types';

export type PageTypeCategory =
  | 'Commercial / Product'
  | 'Blog / Informational'
  | 'Review / Comparison'
  | 'E-commerce Category'
  | 'SaaS / Web Tool'
  | 'Directory / Marketplace'
  | 'Forum / Community'
  | 'Guide / Documentation'
  | 'Official / Institutional';

const includesAny = (value: string, patterns: string[]) => patterns.some((pattern) => value.includes(pattern));

/**
 * Classifies the page itself—not merely the company behind it. An editorial
 * article on a commercial travel site remains informational, while a tour,
 * booking, product, or marketplace listing remains commercial/marketplace.
 */
export function classifyPageType(
  url: string = '',
  title: string = '',
  snippet: string = '',
  resultType: string = ''
): PageTypeCategory {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  const lowerResult = resultType.toLowerCase();
  let hostname = '';
  let pathname = lowerUrl;
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch { /* Keep raw URL signals */ }

  const communityDomain = includesAny(hostname, ['reddit.com', 'quora.com', 'stackexchange.com', 'tripadvisor.com/showtopic']);
  if (communityDomain || includesAny(pathname, ['/forum/', '/forums/', '/community/', '/discussion/', '/showtopic'])) {
    return 'Forum / Community';
  }

  if (/\.gov($|\.)|\.edu($|\.)/.test(hostname) || includesAny(pathname, ['/government/', '/university/'])) {
    return 'Official / Institutional';
  }

  const marketplaceDomain = includesAny(hostname, [
    'tripadvisor.', 'viator.', 'getyourguide.', 'toursbylocals.', 'expedia.',
    'booking.com', 'airbnb.', 'klook.', 'g2.com', 'capterra.com', 'yelp.com',
  ]);
  const marketplacePage = includesAny(pathname, [
    '/tours/', '/tour/', '/experiences/', '/experience/', '/activities/', '/activity/',
    '/attractions/', '/attraction/', '/things-to-do/', '/marketplace/', '/listings/', '/directory/',
  ]) || includesAny(lowerTitle, ['book a tour', 'book tours', 'guided tour', 'tickets & tours', 'things to do: book']);
  if (marketplaceDomain && (marketplacePage || hostname.includes('tripadvisor.'))) {
    return 'Directory / Marketplace';
  }

  const editorialPath = includesAny(pathname, [
    '/blog/', '/blogs/', '/article/', '/articles/', '/news/', '/post/', '/insights/',
    '/stories/', '/travel-guide/', '/travel-guides/', '/destinations/', '/tips/',
  ]);
  const editorialTitle = /(^|\b)(how to|what to|what is|why |tips? for|things? to know|before (you )?(go|travel|visit)|travel guide|city guide|complete guide|one day guide|first-timers?|itinerary|things? to do|places? to (visit|see)|where to (stay|eat)|when to visit)(\b|$)/i.test(title);
  const editorialSnippet = includesAny(lowerSnippet, [
    'travel tips', 'plan your trip', 'best time to visit', 'things to know',
    'public transportation', 'neighborhoods', 'neighbourhoods', 'travel guide',
  ]);
  if (editorialPath || editorialTitle || editorialSnippet || lowerResult.includes('informational')) {
    return 'Blog / Informational';
  }

  if (includesAny(pathname, ['/docs/', '/documentation/', '/help/', '/kb/', '/learn/'])) {
    return 'Guide / Documentation';
  }

  if (
    includesAny(pathname, ['/category/', '/categories/', '/collections/', '/shop/', '/store/']) ||
    includesAny(lowerTitle, ['shop all', 'buy online']) || lowerResult.includes('category')
  ) {
    return 'E-commerce Category';
  }

  if (
    includesAny(pathname, ['/tool/', '/calculator/', '/app/', '/generator/']) ||
    includesAny(lowerTitle, ['free online', 'calculator', 'generator', 'converter'])
  ) {
    return 'SaaS / Web Tool';
  }

  const comparisonIntent = /\b(review|reviews| vs |versus|comparison|alternatives?)\b/i.test(` ${title} `) ||
    lowerResult.includes('review');
  if (comparisonIntent) return 'Review / Comparison';

  const transactionalPage = includesAny(pathname, [
    '/pricing', '/features', '/product', '/products/', '/solutions', '/buy/', '/checkout/',
    '/book/', '/booking/', '/reserve/', '/tickets/', '/plans/', '/signup/',
  ]) || includesAny(lowerTitle, ['buy ', 'book ', 'pricing', 'plans & pricing', 'reserve ']) ||
    includesAny(lowerSnippet, ['free trial', 'sign up', 'book now', 'reserve now', 'check availability']) ||
    lowerResult.includes('landing') || lowerResult.includes('product');
  if (transactionalPage) return marketplaceDomain ? 'Directory / Marketplace' : 'Commercial / Product';

  // A normal ranked page with explanatory title/snippet is more likely an
  // editorial page than a product page. Commercial is never the blind default.
  if (title || snippet) return 'Blog / Informational';
  return 'Commercial / Product';
}

export function ensurePageType(result: OrganicResult): string {
  if (result.url || result.title || result.snippet) {
    return classifyPageType(result.url, result.title, result.snippet, result.resultType);
  }
  return result.pageType?.trim() || 'Commercial / Product';
}

export function getPageTypeBadgeStyle(pageType?: string): string {
  const type = (pageType || '').toLowerCase();
  if (type.includes('blog') || type.includes('informational')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  if (type.includes('review') || type.includes('comparison')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
  if (type.includes('e-commerce') || type.includes('category')) return 'bg-purple-950/80 text-purple-300 border-purple-800';
  if (type.includes('saas') || type.includes('tool')) return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  if (type.includes('directory') || type.includes('marketplace')) return 'bg-blue-950/80 text-blue-300 border-blue-800';
  if (type.includes('forum') || type.includes('community')) return 'bg-orange-950/80 text-orange-300 border-orange-800';
  if (type.includes('guide') || type.includes('documentation')) return 'bg-teal-950/80 text-teal-300 border-teal-800';
  if (type.includes('official') || type.includes('institutional')) return 'bg-slate-800 text-slate-300 border-slate-700';
  return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
}

export function getPageTypeDistribution(results: OrganicResult[]): Array<{ pageType: string; count: number; percentage: number }> {
  if (!results?.length) return [];
  const counts: Record<string, number> = {};
  results.forEach((result) => {
    const pageType = ensurePageType(result);
    counts[pageType] = (counts[pageType] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([pageType, count]) => ({ pageType, count, percentage: Math.round((count / results.length) * 100) }))
    .sort((a, b) => b.count - a.count);
}
