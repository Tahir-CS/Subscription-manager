import { DetectionResult } from '../types';

/**
 * Extract subscription details from the SPECIFIC pricing card/section
 * around a clicked button (not the entire page).
 * Works like a password manager — only activates on user click.
 */
export function extractPlanDetails(clickedButton: HTMLElement): DetectionResult {
  const result: DetectionResult = {
    isSubscriptionPage: true,
    trialDetected: false,
    riskScore: 20,
    darkPatterns: [],
    keywords: [],
  };

  // Walk UP the DOM to find the pricing card container
  const card = findPricingCard(clickedButton);
  const cardText = card ? card.innerText : '';
  const lowerText = cardText.toLowerCase();

  // --- Extract plan name ---
  if (card) {
    const heading = card.querySelector('h1, h2, h3, h4, .plan-name, [class*="plan"], [class*="title"]');
    if (heading) {
      result.serviceName = heading.textContent?.trim() || undefined;
    }
  }

  // --- Extract price ---
  // Search the card first, then broader page if not found
  const pricePatterns = [
    /[\$€£]\s*(\d{1,6}(?:[.,]\d{1,2})?)/,
    /(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:USD|EUR|GBP)/i,
    /(\d{1,6}(?:[.,]\d{1,2})?)\s*\/\s*(?:mo|month|yr|year|week)/i,
  ];

  // 1) Try card text
  for (const pattern of pricePatterns) {
    const match = cardText.match(pattern);
    if (match) {
      result.price = parseFloat(match[1].replace(',', '.'));
      result.currency = cardText.match(/€/) ? 'EUR' : cardText.match(/£/) ? 'GBP' : 'USD';
      break;
    }
  }

  // 2) If no price found in card, search the visible page
  if (!result.price) {
    const pageText = document.body.innerText || '';
    for (const pattern of pricePatterns) {
      const match = pageText.match(pattern);
      if (match) {
        result.price = parseFloat(match[1].replace(',', '.'));
        result.currency = pageText.match(/€/) ? 'EUR' : pageText.match(/£/) ? 'GBP' : 'USD';
        break;
      }
    }
  }

  // 3) Also try nearby elements around the clicked button (siblings, parent text)
  if (!result.price) {
    const parent = clickedButton.parentElement;
    if (parent) {
      const nearby = parent.innerText || '';
      for (const pattern of pricePatterns) {
        const match = nearby.match(pattern);
        if (match) {
          result.price = parseFloat(match[1].replace(',', '.'));
          break;
        }
      }
    }
  }

  // --- Detect billing cycle (card first, then full page) ---
  const cycleText = lowerText || document.body.innerText.toLowerCase();
  if (cycleText.match(/\/\s*year|per\s*year|billed\s*annual|\/yr|annually/)) {
    result.billingCycle = 'yearly';
  } else if (cycleText.match(/\/\s*week|per\s*week|weekly/)) {
    result.billingCycle = 'weekly';
  } else {
    result.billingCycle = 'monthly';
  }

  // --- Detect trial ---
  const trialPatterns: { pattern: RegExp; unit?: string }[] = [
    { pattern: /(\d+)\s*[-–]?\s*days?\s+(?:free\s+)?trial/i, unit: 'day' },
    { pattern: /(\d+)\s*[-–]?\s*weeks?\s+(?:free\s+)?trial/i, unit: 'week' },
    { pattern: /(\d+)\s*[-–]?\s*months?\s+(?:free\s+)?trial/i, unit: 'month' },
    { pattern: /free\s+trial/i },
    { pattern: /try\s+(?:it\s+)?free/i },
    { pattern: /start\s+(?:your\s+)?(?:free\s+)?trial/i },
  ];

  for (const { pattern, unit } of trialPatterns) {
    const match = cardText.match(pattern);
    if (match) {
      result.trialDetected = true;
      result.keywords.push('free trial');
      if (match[1] && unit) {
        const num = parseInt(match[1]);
        result.trialLength = unit === 'week' ? num * 7 : unit === 'month' ? num * 30 : num;
      }
      break;
    }
  }

  // Also check the button text itself
  const btnText = clickedButton.textContent?.toLowerCase() || '';
  if (!result.trialDetected && (btnText.includes('trial') || btnText.includes('try free'))) {
    result.trialDetected = true;
    result.keywords.push('free trial');
  }

  // --- Dark pattern detection (check card + broader page) ---
  const darkPatternChecks: [string, RegExp][] = [
    ['auto-renew pre-checked', /auto[\s-]?renew/i],
    ['limited time pressure', /limited\s+time|offer\s+ends|only\s+today|act\s+now/i],
    ['hidden extras', /additional\s+\$|extra\s+\$/i],
    ['confusing cancellation', /cancel.*(?:48|24)\s*hours?\s*before/i],
    ['no refund policy', /no\s+refunds?/i],
  ];

  const fullPageText = document.body.innerText.toLowerCase();
  for (const [label, pattern] of darkPatternChecks) {
    if (pattern.test(lowerText) || pattern.test(fullPageText)) {
      result.darkPatterns.push(label);
      result.riskScore += 10;
    }
  }

  // --- Risk scoring ---
  if (result.trialDetected) {
    result.riskScore += 15;
    if (result.trialLength && result.trialLength < 7) {
      result.riskScore += 20;
    }
  }

  result.riskScore = Math.min(100, result.riskScore);

  console.log('🔍 Extracted plan details:', {
    price: result.price,
    cycle: result.billingCycle,
    trial: result.trialDetected,
    trialLength: result.trialLength,
    darkPatterns: result.darkPatterns,
    riskScore: result.riskScore,
  });

  return result;
}

/**
 * Walk up the DOM from clicked button to find the pricing card container.
 */
function findPricingCard(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el.parentElement;
  let depth = 0;

  while (current && depth < 8) {
    const cls = current.className?.toLowerCase() || '';
    const id = current.id?.toLowerCase() || '';
    const tag = current.tagName.toLowerCase();

    if (
      cls.includes('pricing') || cls.includes('plan') ||
      cls.includes('card') || cls.includes('tier') ||
      cls.includes('package') || cls.includes('checkout') ||
      cls.includes('payment') || cls.includes('summary') ||
      cls.includes('order') || id.includes('pricing') ||
      id.includes('plan') || id.includes('checkout') ||
      id.includes('payment') || tag === 'article' || tag === 'section'
    ) {
      return current;
    }

    current = current.parentElement;
    depth++;
  }

  // Fallback: 3 levels up from button
  current = el.parentElement;
  for (let i = 0; i < 3 && current?.parentElement; i++) {
    current = current.parentElement;
  }
  return current;
}

/**
 * Extract service name from URL
 */
export function extractServiceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    return parts.length > 1
      ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
      : hostname;
  } catch {
    return 'Unknown Service';
  }
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/**
 * Calculate days until renewal
 */
export function daysUntilRenewal(renewalDate: string): number {
  return Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * Get risk level label
 */
export function getRiskLevel(score: number): 'Low' | 'Moderate' | 'High' {
  if (score < 30) return 'Low';
  if (score < 70) return 'Moderate';
  return 'High';
}
