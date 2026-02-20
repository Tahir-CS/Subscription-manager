# Privacy Policy — Subscription Guardian

**Last Updated:** February 21, 2026

---

## Overview

Subscription Guardian is designed with **privacy-first** principles. We do not collect, store, or transmit any personal data. All data remains on your device.

---

## What Data We Store

### Local Browser Storage Only
- **Subscriptions you manually track:** Service name, price, renewal date, billing cycle
- **User preferences:** Tab selections, UI state
- **Notification settings:** Alarm times for renewal reminders

All data is stored exclusively in your browser's `chrome.storage.local` and **never leaves your computer**.

### What We DON'T Collect
- ❌ Personal identification (name, email, phone)
- ❌ Payment details or bank information
- ❌ Passwords or credentials
- ❌ Location data
- ❌ Browsing history (we only analyze pages when you click)
- ❌ Behavioral tracking
- ❌ Analytics or telemetry

---

## Permissions Explained

Subscription Guardian requests the following Chrome permissions:

| Permission | Why We Need It | Data Shared? |
|---|---|---|
| `storage` | Save subscriptions locally to persist your data | ✅ Local only |
| `alarms` | Schedule renewal reminders (24h before charge) | ✅ Local only |
| `notifications` | Send you desktop alerts before renewal | ✅ Local only |
| `activeTab` | Detect subscription pages you visit (on-click only) | ❌ Not stored |
| `scripting` | Inject our detection script into pages | ❌ Not stored |
| `<all_urls>` | Work on any website with subscriptions | ❌ Not stored |

---

## How We Analyze Pages

1. **User clicks a subscription button** on a webpage
2. Extension scans the local page content (DOM) to extract:
   - Plan name (e.g., "Premium")
   - Price
   - Billing cycle
   - Trial information
   - Dark pattern warnings
3. **Analysis happens entirely in your browser** — nothing is sent anywhere
4. We show a popup with extracted details
5. You confirm before we save anything

---

## No Third-Party Services

- ❌ No tracking pixels
- ❌ No advertising networks
- ❌ No analytics services (Google Analytics, Mixpanel, etc.)
- ❌ No CDNs that analyze you
- ❌ No external APIs for subscription data
- ❌ No cloud synchronization

---

## Data Deletion

You have complete control:

1. **Delete individual subscriptions** — Click "Delete" on any subscription in the dashboard
2. **Delete all data** — Uninstall the extension or use Chrome's storage clearing:
   - Settings → Privacy and security → Clear browsing data → "Cookies and other site data"

---

## Open Source Transparency

The entire extension is **open source** on [GitHub](https://github.com/Tahir-CS/Subscription-manager):

- Read the source code anytime
- Audit what permissions we use
- Verify no hidden data collection
- Contribute improvements

---

## Security

- **No external network calls** from the extension
- **No server backend** — everything is client-side
- **HTTPS only** for any links to external sites
- **Code minification** in production (standard practice)

---

## Compliance

This extension complies with:

- ✅ Chrome Web Store Developer Program Policies
- ✅ Microsoft Edge Add-ons Policies
- ✅ GDPR (no data collection = no GDPR obligations)
- ✅ CCPA (no personal information collected)

---

## Changes to This Policy

If we update this policy, we will:
1. Update the "Last Updated" date at the top
2. Post changes on [GitHub](https://github.com/Tahir-CS/Subscription-manager)
3. Notify users in a future extension update

---

## Contact Us

**Questions about privacy?**

- **GitHub Issues:** [Create an issue](https://github.com/Tahir-CS/Subscription-manager/issues)
- **Email:** (Add your contact email here)
- **Twitter/X:** (Add your handle here)

---

## What This Means For You

✅ **Your data is yours alone**
- No selling to advertisers
- No sharing with third parties
- No government requests (we have nothing to give)
- No backdoors or surveillance

✅ **Works offline**
- Once installed, the extension works even without internet
- Only local storage is used

✅ **Total transparency**
- We want you to audit us
- Open source = nothing to hide

---

**Subscription Guardian — Protecting your wallet, respecting your privacy.**

---

*If you believe this extension violates your privacy, please report it to [Google Chrome Web Store](https://support.google.com/chrome_webstore/) or [Microsoft Edge Add-ons](https://support.microsoft.com/en-us/topic/ca4e46c3-61e6-4191-96e5-6152412c9294).*
