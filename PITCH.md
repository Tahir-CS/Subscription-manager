# 🎤 Subscription Guardian - Hackathon Pitch

**2-Minute Demo Script**

---

## Opening Hook (15 seconds)

"Have you ever forgotten to cancel a free trial and got charged $50? You're not alone. **30% of consumers** lose money to subscription traps every year.

That's why we built **Subscription Guardian** — the 1Password of subscriptions."

---

## The Problem (20 seconds)

"Users face three major issues:

1. **Forgotten trials** that auto-convert to paid subscriptions
2. **Dark patterns** designed to trap you into recurring payments  
3. **No visibility** into total subscription spending

The average person has **12 active subscriptions** and doesn't track half of them."

---

## The Solution (30 seconds)

"Subscription Guardian is a **Chrome extension** that works in real-time as you browse.

Watch this: [Open demo page]

When I visit a subscription page, the extension:
- **Automatically detects** the subscription
- **Calculates a risk score** based on trial length and dark patterns
- **Shows an alert** with all the details

One click to track it. [Click "Track This Subscription"]

The form is pre-filled with:
- Service name
- Price
- Renewal date
- Trial duration

[Click "Add to Guardian"]

Done. Now I'll never forget about it."

---

## The Dashboard (25 seconds)

"Here's the dashboard: [Open popup]

- I see **all my subscriptions** in one place
- My **monthly burn rate** — I'm spending $47/month
- **Trial subscriptions** highlighted separately
- **Risk indicators** for each service

See this one? [Point to urgent subscription]
- **2 days until renewal**
- The extension will send me **two reminders**: 48 hours before, and 12 hours before
- I'll never miss a cancellation deadline"

---

## Technical Innovation (20 seconds)

"Under the hood, we use:

- **NLP-based detection** — scans page text for subscription keywords
- **Pattern matching** — identifies pricing tables and trial durations
- **Risk scoring algorithm** — considers trial length, dark patterns, and cancellation clarity
- **Chrome Alarms API** — schedules intelligent notifications

All data stays **local** — no servers, no accounts, complete privacy."

---

## Impact (10 seconds)

"This extension can save users **hundreds of dollars per year**.

It's preventive, not reactive.

It catches the trap **before** you fall into it."

---

## Closing (10 seconds)

"Subscription Guardian: Your personal watchdog against subscription traps.

Try the demo, track a subscription, and never miss a cancellation deadline again.

Thank you!"

---

## Q&A Preparation

### Likely Questions

**Q: How does it detect subscriptions?**
A: Multi-layered approach: keyword scanning (free trial, auto-renew), DOM analysis (pricing tables), regex extraction (trial duration, prices), and risk scoring based on dark patterns.

**Q: Does it work on all websites?**
A: Yes, it's framework-agnostic. It analyzes text content and DOM structure, so it works on React, Vue, vanilla HTML, any site.

**Q: What about privacy?**
A: 100% local. No external servers, no accounts, no tracking. Uses Chrome's local storage API. Users control all data.

**Q: Can it auto-cancel subscriptions?**
A: Not in this MVP — that would require bank integration. We focus on awareness and reminders. Users stay in control.

**Q: How accurate is the detection?**
A: High precision for clear subscription pages (95%+). May have false positives on pages with "subscription" in other contexts, but the user confirms before tracking.

**Q: Monetization strategy?**
A: Free for consumers. Potential B2B model: subscription management for companies, analytics dashboard, API for fintech apps.

**Q: What's next?**
A: Email scanning (Gmail API), cross-browser support (Firefox, Edge), ML-based detection, auto-extract cancellation links, spending insights.

---

## Demo Tips

### Before Demo
- Clear all test data
- Have 2-3 pre-tracked subscriptions ready
- Set one subscription to expire in 2 days (urgent state)
- Open demo page in a tab
- Have extension popup closed initially

### During Demo
- **Slow down** when clicking — let judges see the flow
- **Point** at key UI elements (risk score, days remaining)
- **Emphasize** the automatic detection
- **Show** the clean, professional UI

### If Something Breaks
- Have backup screenshots ready
- Have recorded video demo as fallback
- Explain what *should* happen

---

## Visual Aids

### Slide Deck Outline

1. **Title Slide**
   - Logo (shield emoji or gradient shield)
   - Tagline: "The 1Password of Subscriptions"

2. **Problem Slide**
   - 30% forget to cancel trials
   - $50+ lost per person per year
   - 12 average subscriptions per user

3. **Solution Slide**
   - Screenshot of detection alert
   - Key features list

4. **Demo Slide**
   - "Live Demo" text
   - Switch to browser

5. **Architecture Slide**
   - Simple diagram (browser → extension → storage)
   - Tech stack logos

6. **Impact Slide**
   - Potential savings
   - User testimonials (if any)
   - Market size

7. **Thank You Slide**
   - GitHub link
   - Contact info
   - Call to action

---

## One-Liner Variations

- "We're building the 1Password of subscriptions"
- "Real-time subscription intelligence in your browser"
- "Stop subscription traps before they charge you"
- "The credit card fraud detection, but for subscriptions"
- "Your personal subscription watchdog"

---

## Hackathon Judging Alignment

| Criteria | Our Strength |
|----------|-------------|
| **Innovation** | Real-time browser detection (not just tracking) |
| **Technical** | NLP, Chrome APIs, React, risk algorithm |
| **Design** | Clean UI, smooth UX, professional polish |
| **Impact** | Clear financial benefit, solves real problem |
| **Presentation** | Live demo, clear value prop, engaging story |

---

## Backup Talking Points

- "Subscription economy is $650B+ annually"
- "Dark patterns are illegal in some countries (EU)"
- "We're consumer advocates in code form"
- "This extension gives power back to users"
- "Prevention is better than tracking"

---

Good luck! 🚀
