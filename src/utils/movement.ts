import { SERPSnapshot, MovementAnalysis, MovementItem } from '../types';

/**
 * Compares a previous SERPSnapshot against a current SERPSnapshot
 */
export function calculateMovement(previous: SERPSnapshot, current: SERPSnapshot): MovementAnalysis {
  const prevMap = new Map<string, { pos: number; title: string; url: string }>();
  previous.organicResults.forEach(item => {
    prevMap.set(item.domain.toLowerCase(), { pos: item.position, title: item.title, url: item.url });
  });

  const currMap = new Map<string, { pos: number; title: string; url: string }>();
  current.organicResults.forEach(item => {
    currMap.set(item.domain.toLowerCase(), { pos: item.position, title: item.title, url: item.url });
  });

  const items: MovementItem[] = [];
  let moversCount = 0;
  let newEntrantsCount = 0;
  let dropOffsCount = 0;

  // Process current results
  current.organicResults.forEach(curr => {
    const domainKey = curr.domain.toLowerCase();
    const prev = prevMap.get(domainKey);

    if (prev) {
      const change = prev.pos - curr.position; // e.g., 5 -> 2 = +3 positions gained
      let status: MovementItem['status'] = 'unchanged';

      if (change > 0) {
        status = 'moved_up';
        if (Math.abs(change) >= 3) moversCount++;
      } else if (change < 0) {
        status = 'moved_down';
        if (Math.abs(change) >= 3) moversCount++;
      }

      if (prev.url !== curr.url) {
        status = 'url_replaced';
      }

      items.push({
        domainOrUrl: curr.domain,
        title: curr.title,
        previousPosition: prev.pos,
        currentPosition: curr.position,
        change,
        status
      });
    } else {
      // New entrant
      newEntrantsCount++;
      items.push({
        domainOrUrl: curr.domain,
        title: curr.title,
        previousPosition: null,
        currentPosition: curr.position,
        change: 0,
        status: 'new_entry'
      });
    }
  });

  // Check for drop-offs from previous results
  previous.organicResults.forEach(prev => {
    const domainKey = prev.domain.toLowerCase();
    if (!currMap.has(domainKey)) {
      dropOffsCount++;
      items.push({
        domainOrUrl: prev.domain,
        title: prev.title,
        previousPosition: prev.position,
        currentPosition: null,
        change: 0,
        status: 'dropped_off'
      });
    }
  });

  // AI Overview comparison
  let aiOverviewChanges = 'No change in AI Overview presence.';
  if (!previous.aiOverview.present && current.aiOverview.present) {
    aiOverviewChanges = 'AI Overview newly appeared for this query!';
  } else if (previous.aiOverview.present && !current.aiOverview.present) {
    aiOverviewChanges = 'AI Overview disappeared from the SERP.';
  } else if (previous.aiOverview.present && current.aiOverview.present) {
    const prevCites = previous.aiOverview.citations.length;
    const currCites = current.aiOverview.citations.length;
    aiOverviewChanges = `AI Overview remains active. Cited sources changed from ${prevCites} to ${currCites}.`;
  }

  // Feature changes
  const prevFeatureTypes = new Set(previous.features.map(f => f.type));
  const currFeatureTypes = new Set(current.features.map(f => f.type));
  const newFeatures = Array.from(currFeatureTypes).filter(x => !prevFeatureTypes.has(x));
  const lostFeatures = Array.from(prevFeatureTypes).filter(x => !currFeatureTypes.has(x));

  let featureChanges = 'SERP feature footprint remains stable.';
  if (newFeatures.length > 0 || lostFeatures.length > 0) {
    const parts = [];
    if (newFeatures.length > 0) parts.push(`Added features: ${newFeatures.join(', ')}`);
    if (lostFeatures.length > 0) parts.push(`Lost features: ${lostFeatures.join(', ')}`);
    featureChanges = parts.join('. ');
  }

  const strategicImplications: string[] = [];
  if (newEntrantsCount > 0) {
    strategicImplications.push(`${newEntrantsCount} new domain(s) broke into top 10. Audit their content depth and backlink profiles.`);
  }
  if (moversCount > 0) {
    strategicImplications.push(`${moversCount} domain(s) moved by 3+ positions, indicating search algorithm turbulence or intent shifts.`);
  }
  if (current.aiOverview.present && !previous.aiOverview.present) {
    strategicImplications.push('Google introduced an AI Overview. Priority shifts to gaining citations inside the generative answer.');
  }
  if (strategicImplications.length === 0) {
    strategicImplications.push('The SERP layout is relatively stable. Maintain current technical SEO and focus on depth improvements.');
  }

  return {
    items,
    summary: {
      moversCount,
      newEntrantsCount,
      dropOffsCount,
      aiOverviewChanges,
      serpFeatureChanges: featureChanges,
      strategicImplications
    }
  };
}
