# Subscription Guardian - Demo Files

This directory contains demo pages for testing and demonstrating the Subscription Guardian extension.

## Files

### subscription-page.html
A realistic subscription page with:
- Multiple pricing tiers
- Free trial offers (7, 14, and 30 days)
- Dark patterns (countdown timer, pre-checked boxes, limited time offers)
- Auto-renewal clauses
- Hidden cancellation policies

## How to Use

1. **Load the extension** in Chrome (see main README)

2. **Open the demo page**:
   - Right-click `subscription-page.html` and open with Chrome
   - Or drag the file into your browser

3. **Watch the detection**:
   - Extension should automatically detect the subscription page
   - You'll see an alert in the top-right corner
   - Badge appears on the extension icon

4. **Test tracking**:
   - Click "Track This Subscription" in the alert
   - Fill out the form (pre-filled with detected data)
   - Click "Add to Guardian"

5. **View dashboard**:
   - Click the extension icon in Chrome toolbar
   - See your tracked subscription
   - Check risk score and details

## Creating Your Own Test Pages

The extension will detect pages containing:
- Keywords: "free trial", "subscription", "auto-renew", "monthly plan"
- Pricing information ($X.XX format)
- Billing cycle indicators (monthly, yearly)
- Call-to-action buttons

Example minimal HTML:
```html
<h1>Premium Subscription</h1>
<p>Start your 7-day free trial today!</p>
<p>Only $9.99/month after trial</p>
<button>Start Free Trial</button>
<p>Auto-renews monthly. Cancel anytime.</p>
```

## Dark Patterns Demonstrated

1. **Countdown Timer** - Creates false urgency
2. **Pre-checked Upsells** - Auto-selected additional subscriptions
3. **Hidden Cancellation** - Tiny text, hard to find
4. **Confusing Language** - "Cancel anytime*" with restrictions
5. **Limited Time Offer** - Pressures quick decision

The extension will flag these patterns and increase the risk score accordingly.
