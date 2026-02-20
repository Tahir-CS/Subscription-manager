import { extractPlanDetails, extractServiceName } from '../utils/detector';

console.log('🛡️ Subscription Guardian loaded (click-to-track mode)');

// ============================================================
// BUTTON DETECTION — keywords that indicate subscription actions
// ============================================================
const TRIGGER_WORDS = [
  // Trials
  'trial', 'try free', 'try it', 'try now', 'try for',
  'try premium', 'try pro', 'try plus', 'try basic',
  // Subscribe / buy
  'subscribe', 'buy now', 'buy plan', 'purchase',
  'complete purchase', 'confirm purchase',
  'order now', 'checkout', 'check out',
  // Plan selection
  'choose plan', 'select plan', 'choose this', 'select this',
  'get plan', 'get this plan', 'current plan',
  // Start / get
  'get started', 'get premium', 'get pro', 'get plus',
  'get basic', 'get business', 'get enterprise',
  'go premium', 'go pro',
  'start plan', 'start now', 'start free',
  // Upgrade / join
  'upgrade', 'join now', 'join free', 'join premium',
  'enroll', 'sign up', 'signup',
  // Payment / confirm
  'proceed to payment', 'continue to payment', 'pay now',
  'add to cart', 'confirm plan', 'place order',
  'complete order', 'submit order', 'confirm and pay',
  'start my', 'activate',
  // Generic pricing triggers
  '/mo', '/yr', '/year', '/month', '/week',
  'per month', 'per year',
  'billed monthly', 'billed annually', 'billed yearly',
];

// Track which elements already have listeners
const trackedElements = new WeakSet<Element>();
// Track URLs that have already been saved (prevent duplicate popups)
const savedUrls = new Set<string>();

// ============================================================
// CORE: Scan page and attach click listeners
// ============================================================
function scanAndAttach() {
  const allClickables = document.querySelectorAll(
    'button, a, [role="button"], input[type="submit"], input[type="button"], ' +
    '[class*="btn"], [class*="button"], [class*="cta"], [class*="pricing"] button, ' +
    '[class*="pricing"] a, [class*="plan"] button, [class*="plan"] a, ' +
    '[class*="checkout"] button, [class*="payment"] button, [class*="purchase"] button'
  );

  let count = 0;

  allClickables.forEach(el => {
    if (trackedElements.has(el)) return;

    const text = (el.textContent || (el as HTMLInputElement).value || '').trim().toLowerCase();
    if (!text || text.length > 80) return;

    if (isSubscriptionButton(text, el as HTMLElement)) {
      trackedElements.add(el);
      count++;
      el.addEventListener('click', () => {
        setTimeout(() => onSubscriptionButtonClicked(el as HTMLElement), 300);
      });
    }
  });

  if (count > 0) {
    console.log(`🎯 Guardian monitoring ${count} subscription button(s)`);
  }
}

/**
 * Check if a clickable element is a subscription button.
 */
function isSubscriptionButton(text: string, el: HTMLElement): boolean {
  // 1. Direct text match
  if (TRIGGER_WORDS.some(trigger => text.includes(trigger))) return true;

  // 2. aria-label / title
  const aria = (el.getAttribute('aria-label') || '').toLowerCase();
  const title = (el.getAttribute('title') || '').toLowerCase();
  if (TRIGGER_WORDS.some(t => aria.includes(t) || title.includes(t))) return true;

  // 3. Link to checkout/subscribe/pricing pages
  const href = (el.getAttribute('href') || '').toLowerCase();
  if (href && /subscribe|checkout|purchase|pricing|plan|trial|upgrade|signup|sign-up|billing|payment/.test(href)) {
    return true;
  }

  // 4. URL-based: if we're on a checkout/payment/pricing page, match broader actions
  const pageUrl = window.location.href.toLowerCase();
  if (/checkout|payment|billing|subscribe|pricing|upgrade|plan/.test(pageUrl)) {
    const paymentActions = ['continue', 'confirm', 'complete', 'submit', 'place order', 'pay', 'finish', 'done'];
    if (paymentActions.some(a => text.includes(a))) return true;
  }

  // 5. Inside a pricing card with short action text
  if (text.length < 30) {
    const parent = el.closest('[class*="pricing"], [class*="plan"], [class*="card"], [class*="tier"], [class*="package"], [class*="checkout"], [class*="payment"]');
    if (parent) {
      const shortActions = ['continue', 'select', 'choose', 'start', 'begin', 'get', 'join', 'enroll', 'activate', 'confirm'];
      if (shortActions.some(a => text.includes(a))) return true;
      if (/\$|€|£/.test(text)) return true;
    }
  }

  return false;
}

// ============================================================
// When user clicks a subscription button
// ============================================================
function onSubscriptionButtonClicked(button: HTMLElement) {
  // Prevent duplicate popups
  if (document.getElementById('sg-popup')) return;

  // Skip if already saved for this page
  const pageKey = window.location.hostname + window.location.pathname;
  if (savedUrls.has(pageKey)) {
    console.log('🛡️ Already tracked this page, skipping popup');
    return;
  }

  console.log('🎯 Subscription button clicked:', button.textContent?.trim());

  // Extract plan details from the card around this button
  const planDetails = extractPlanDetails(button);

  // Service name = always use the website name (not card heading like "Payment Summary")
  const siteName = extractServiceName(window.location.href);
  // Plan name only if it looks like a real plan name (short, not a page heading)
  const planName = planDetails.serviceName;
  const displayName = (planName && planName.length < 30 && !/summary|payment|checkout|billing|order/i.test(planName))
    ? `${siteName} — ${planName}`
    : siteName;

  const renewalDate = calculateRenewalDate(planDetails);

  // Show non-blocking corner popup
  showTrackingPopup(displayName, planDetails, renewalDate, pageKey);

  chrome.runtime.sendMessage({
    type: 'SUBSCRIPTION_DETECTED',
    data: { ...planDetails, url: window.location.href, serviceName: displayName },
  });
}

// ============================================================
// Calculate renewal date
// ============================================================
function calculateRenewalDate(plan: any): string {
  const now = Date.now();
  let ms: number;
  if (plan.trialLength) ms = plan.trialLength * 24 * 60 * 60 * 1000;
  else if (plan.billingCycle === 'yearly') ms = 365 * 24 * 60 * 60 * 1000;
  else if (plan.billingCycle === 'weekly') ms = 7 * 24 * 60 * 60 * 1000;
  else ms = 30 * 24 * 60 * 60 * 1000;
  return new Date(now + ms).toISOString().split('T')[0];
}

// ============================================================
// NON-BLOCKING CORNER POPUP (like password manager)
// ============================================================
function showTrackingPopup(displayName: string, plan: any, renewalDate: string, pageKey: string) {
  // Inject styles once
  if (!document.getElementById('sg-styles')) {
    const style = document.createElement('style');
    style.id = 'sg-styles';
    style.textContent = `
      @keyframes sgSlideIn {
        from { transform: translateX(420px); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
      }
      @keyframes sgSlideOut {
        from { transform: translateX(0);     opacity: 1; }
        to   { transform: translateX(420px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const popup = document.createElement('div');
  popup.id = 'sg-popup';
  popup.style.cssText = `
    position: fixed; top: 16px; right: 16px;
    background: white; padding: 20px; border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
    z-index: 2147483647; width: 360px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: sgSlideIn 0.3s ease-out;
  `;

  const riskColor = plan.riskScore < 30 ? '#10b981' : plan.riskScore < 70 ? '#f59e0b' : '#ef4444';
  const riskLabel = plan.riskScore < 30 ? 'Low' : plan.riskScore < 70 ? 'Moderate' : 'High';

  popup.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:22px;">🛡️</span>
        <span style="font-weight:700; font-size:14px; color:#1f2937;">Track Subscription?</span>
      </div>
      <button id="sg-close" style="background:none; border:none; font-size:18px; cursor:pointer; color:#9ca3af; padding:0 2px;">✕</button>
    </div>

    ${plan.darkPatterns.length > 0 ? `
      <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:8px 10px; margin-bottom:12px; font-size:11px; color:#991b1b;">
        ⚠️ ${plan.darkPatterns.join(', ')}
      </div>
    ` : ''}

    <form id="sg-form" style="margin:0;">
      <input id="sg-name" type="text" value="${displayName}" placeholder="Service name" required style="
        width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:7px;
        font-size:13px; box-sizing:border-box; margin-bottom:10px; outline:none;
      ">

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
        <input id="sg-price" type="number" value="${plan.price || ''}" step="0.01" placeholder="Price" required style="
          width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:7px;
          font-size:13px; box-sizing:border-box; outline:none;
        ">
        <select id="sg-cycle" required style="
          width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:7px;
          font-size:13px; box-sizing:border-box; outline:none; background:white;
        ">
          <option value="weekly"  ${plan.billingCycle === 'weekly'  ? 'selected' : ''}>Weekly</option>
          <option value="monthly" ${plan.billingCycle === 'monthly' ? 'selected' : ''}>Monthly</option>
          <option value="yearly"  ${plan.billingCycle === 'yearly'  ? 'selected' : ''}>Yearly</option>
        </select>
      </div>

      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="font-size:11px; color:#6b7280; white-space:nowrap;">
          ${plan.trialDetected ? '⚡ Trial ends:' : 'Renews:'}
        </span>
        <input id="sg-date" type="date" value="${renewalDate}" required style="
          flex:1; padding:7px 10px; border:1px solid #e5e7eb; border-radius:7px;
          font-size:13px; box-sizing:border-box; outline:none;
        ">
        <span style="background:${riskColor}; color:white; font-size:10px; font-weight:700; padding:3px 7px; border-radius:4px; white-space:nowrap;">${riskLabel} Risk</span>
      </div>

      <div style="display:flex; gap:8px;">
        <button type="submit" style="
          flex:1; padding:9px; background:linear-gradient(135deg,#667eea,#764ba2);
          color:white; border:none; border-radius:7px; font-weight:700;
          font-size:13px; cursor:pointer;
        ">🛡️ Track</button>
        <button type="button" id="sg-dismiss" style="
          padding:9px 14px; background:#f3f4f6; color:#6b7280; border:none;
          border-radius:7px; font-weight:600; font-size:13px; cursor:pointer;
        ">Dismiss</button>
      </div>
    </form>
  `;

  document.body.appendChild(popup);

  // --- Close / Dismiss ---
  const closePopup = () => {
    popup.style.animation = 'sgSlideOut 0.2s ease-in forwards';
    setTimeout(() => popup.remove(), 200);
  };

  document.getElementById('sg-close')!.addEventListener('click', closePopup);
  document.getElementById('sg-dismiss')!.addEventListener('click', closePopup);

  // --- Submit ---
  document.getElementById('sg-form')!.addEventListener('submit', (e) => {
    e.preventDefault();

    const subscription = {
      id: 'sub_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      userId: 'default',
      serviceName: (document.getElementById('sg-name') as HTMLInputElement).value,
      url: window.location.href,
      trialLength: plan.trialLength,
      startDate: new Date().toISOString(),
      renewalDate: new Date((document.getElementById('sg-date') as HTMLInputElement).value).toISOString(),
      price: parseFloat((document.getElementById('sg-price') as HTMLInputElement).value),
      currency: plan.currency || 'USD',
      billingCycle: (document.getElementById('sg-cycle') as HTMLSelectElement).value,
      riskScore: plan.riskScore,
      status: plan.trialDetected ? 'trial' : 'active',
      darkPatterns: plan.darkPatterns || [],
      createdAt: new Date().toISOString(),
    };

    chrome.runtime.sendMessage({ type: 'ADD_SUBSCRIPTION', data: subscription });

    // Mark as saved so clicking again won't re-show
    savedUrls.add(pageKey);

    closePopup();
    showConfirmationToast(subscription.serviceName);
  });

  // Auto-dismiss after 30 seconds if ignored
  setTimeout(() => {
    if (document.getElementById('sg-popup')) closePopup();
  }, 30000);
}

// ============================================================
// Confirmation toast
// ============================================================
function showConfirmationToast(name: string) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white; padding: 12px 18px; border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2); z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; font-weight: 600;
  `;
  toast.textContent = `✅ Now tracking "${name}"`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// INIT: scan + watch for new buttons (SPA support)
// ============================================================
function init() {
  scanAndAttach();
  const observer = new MutationObserver(() => scanAndAttach());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
