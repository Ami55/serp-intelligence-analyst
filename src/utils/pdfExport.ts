import type { AnalysisReport, SERPSnapshot } from '../types';

const INDIGO: [number, number, number] = [79, 70, 229];
const SLATE: [number, number, number] = [30, 41, 59];
const CONTENT_WIDTH = 511;

function safeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'serp-report';
}

function cleanText(value: unknown, maxLength = 260) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (/^(CAES|data:|[A-Za-z0-9_=-]{120,})/.test(text)) return 'Provider identifier omitted';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function cleanCitationTitle(title: string | undefined, domain: string, url: string) {
  const cleaned = cleanText(title, 150);
  if (cleaned && cleaned !== 'Provider identifier omitted') return cleaned;
  if (domain) return `Source from ${cleanText(domain, 60)}`;
  try { return `Source from ${new URL(url).hostname.replace(/^www\./, '')}`; } catch { return 'AI Overview source'; }
}

export async function downloadSerpPdf(snapshot: SERPSnapshot, report: AnalysisReport | null) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 42;
  const tableDefaults = {
    margin: { left: margin, right: margin },
    tableWidth: CONTENT_WIDTH,
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' as const },
    headStyles: { fillColor: INDIGO, textColor: 255, fontStyle: 'bold' as const },
    alternateRowStyles: { fillColor: [245, 247, 250] as [number, number, number] },
  };

  const lastY = () => ((doc as any).lastAutoTable?.finalY || 0) + 24;
  const sectionTitle = (title: string, y: number) => {
    if (y > 760) { doc.addPage(); y = margin; }
    doc.setTextColor(...SLATE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, y);
    return y + 10;
  };

  doc.setFillColor(...SLATE);
  doc.rect(0, 0, 595, 112, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SERP Intelligence Report', margin, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(snapshot.keyword, margin, 71);
  doc.setFontSize(8);
  doc.text(`${snapshot.location} | ${snapshot.language} | ${snapshot.device} | ${snapshot.searchEngine}`, margin, 91);

  autoTable(doc, {
    ...tableDefaults,
    startY: 132,
    head: [['Report detail', 'Value']],
    body: [
      ['Captured', new Date(snapshot.capturedAt).toLocaleString()],
      ['Source', snapshot.source],
      ['Organic results', String(snapshot.organicResults.length)],
      ['AI Overview', snapshot.aiOverview.present ? 'Present' : 'Not detected'],
    ],
    columnStyles: { 0: { cellWidth: 120, fontStyle: 'bold' }, 1: { cellWidth: 391 } },
  });

  if (report) {
    const y = sectionTitle('Executive Summary', lastY());
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Finding', 'Insight']],
      body: [
        ['Dominant intent', report.topSummary.dominantIntent],
        ['Competitor pattern', report.topSummary.competitorPattern],
        ['AI Overview opportunity', report.topSummary.aiOverviewOpportunity],
        ['Recommended action', report.topSummary.recommendedAction],
      ],
      columnStyles: { 0: { cellWidth: 130, fontStyle: 'bold' }, 1: { cellWidth: 381 } },
    });
  }

  let y = sectionTitle('Organic Search Results', lastY());
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['#', 'Title', 'Domain', 'Page type']],
    body: snapshot.organicResults.slice(0, 20).map((item) => [
      String(item.position), cleanText(item.title, 180), cleanText(item.domain, 60), cleanText(item.pageType || item.resultType || 'Organic', 50),
    ]),
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 245 }, 2: { cellWidth: 135 }, 3: { cellWidth: 105 } },
  });

  y = sectionTitle('AI Overview', lastY());
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Status', 'Summary']],
    body: [[
      snapshot.aiOverview.present ? 'Present' : 'Not detected',
      cleanText(snapshot.aiOverview.answerText || snapshot.aiOverview.statusNote || 'No AI Overview content was returned.', 1800),
    ]],
    columnStyles: { 0: { cellWidth: 90, fontStyle: 'bold' }, 1: { cellWidth: 421 } },
  });

  if (snapshot.aiOverview.citations.length) {
    autoTable(doc, {
      ...tableDefaults,
      startY: lastY(),
      head: [['AI Overview citation', 'Domain', 'Organic position']],
      body: snapshot.aiOverview.citations.slice(0, 20).map((item) => [
        cleanCitationTitle(item.title, item.domain, item.url),
        cleanText(item.domain, 60),
        item.organicPosition == null ? 'Outside top 10' : String(item.organicPosition),
      ]),
      columnStyles: { 0: { cellWidth: 280 }, 1: { cellWidth: 155 }, 2: { cellWidth: 76 } },
    });
  }

  y = sectionTitle('SERP Features', lastY());
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Feature', 'Present', 'Details / opportunity']],
    body: snapshot.features.map((feature) => [
      cleanText(feature.type, 60), feature.present ? 'Yes' : 'No', cleanText(feature.details || feature.opportunity || '', 300),
    ]),
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 55 }, 2: { cellWidth: 336 } },
  });

  if (report) {
    y = sectionTitle('Search Intent', lastY());
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Dimension', 'Analysis']],
      body: [
        ['Primary intent', report.searchIntent.primaryIntent],
        ['Secondary intent', report.searchIntent.secondaryIntent],
        ['Dominant format', report.searchIntent.dominantFormat],
        ['User expectations', report.searchIntent.userExpectations],
        ['Evidence', report.searchIntent.evidence.join('\n• ')],
      ],
      columnStyles: { 0: { cellWidth: 120, fontStyle: 'bold' }, 1: { cellWidth: 391 } },
    });

    y = sectionTitle('Content Recommendations', lastY());
    const recommendations = report.contentRecommendations;
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Area', 'Recommendations']],
      body: [
        ['Recommended page type', recommendations.recommendedPageType],
        ['Required sections', recommendations.requiredSections.join('\n• ')],
        ['Topics to cover', recommendations.topicsToCover.join('\n• ')],
        ['Feature opportunities', recommendations.featureOpportunities.join('\n• ')],
        ['Competitive differentiators', recommendations.competitiveDifferentiators.join('\n• ')],
        ['E-E-A-T requirements', recommendations.eeatRequirements.join('\n• ')],
        ['Top actions', recommendations.topActions.join('\n• ')],
      ],
      columnStyles: { 0: { cellWidth: 135, fontStyle: 'bold' }, 1: { cellWidth: 376 } },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`SERP Intelligence Analyst  |  Page ${page} of ${pageCount}`, margin, 815);
  }

  doc.save(`${safeFileName(snapshot.keyword)}-serp-intelligence.pdf`);
}
