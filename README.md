# 🛡️ Subscription Guardian

> **The 1Password of subscriptions** — AI-powered browser extension that detects and prevents subscription traps

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)

## 🎯 Problem

**30-40% of consumers forget to cancel free trials**, resulting in unexpected charges and financial leakage. Subscription services use dark patterns to trap users into recurring payments, and there's no real-time intelligence layer to help.

**Subscription Guardian solves this.**

---

## ✨ Features

### 🔍 Real-Time Detection
- Automatically detects subscription pages as you browse
- Identifies free trials, pricing, and renewal terms
- Works on ANY website with subscription offers

### ⚠️ Risk Assessment Engine
- Calculates risk score (0-100) for each subscription
- Factors: trial length, dark patterns, cancellation clarity
- Visual risk indicators: Low (green), Moderate (yellow), High (red)

### 🧠 Dark Pattern Detection
- Identifies deceptive UI tactics
- Detects hidden cancellation links
- Flags confusing pricing and auto-checked boxes

### ⏰ Smart Reminders
- Notifications 48 hours before renewal
- Second alert 12 hours before charge
- Never miss a cancellation deadline again

### 📊 Subscription Dashboard
- Clean overview of all subscriptions
- Monthly and annual burn rate calculation
- Filter by: All, Trials, Active subscriptions
- One-click tracking and management

### 🎨 Beautiful In-Page Alerts
- Non-intrusive popup when subscription is detected
- One-click tracking with pre-filled information
- Dismissible and customizable

---

## 🚀 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/subscription-guardian.git
   cd subscription-guardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

### From Chrome Web Store
*Coming soon!*

---

## 🎬 Demo

### Test Pages
We've included a demo subscription page for testing:

```bash
npm run dev
# Then open demo/subscription-page.html in your browser
```

### Demo Flow

1. Visit a subscription page (e.g., Netflix, Spotify signup)
2. **Detection**: Extension automatically identifies subscription
3. **Alert**: In-page notification appears with risk score
4. **Track**: Click "Track This Subscription" button
5. **Form**: Review auto-filled details, adjust if needed
6. **Dashboard**: View in extension popup (click extension icon)
7. **Reminder**: Get notifications before renewal

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Browser Tab    │
│  (Content Script)│
└────────┬────────┘
         │
         │ Detects subscription
         │ Analyzes page content
         │
         ▼
┌─────────────────┐
│ Background      │
│ Service Worker  │
└────────┬────────┘
         │
         │ Manages storage
         │ Schedules reminders
         │
         ▼
┌─────────────────┐
│ Chrome Storage  │
│ (Local)         │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│ React Popup UI  │
│ (Dashboard)     │
└─────────────────┘
```

### Tech Stack

- **Extension Framework**: Chrome Manifest V3
- **Language**: TypeScript
- **UI**: React 18
- **Build**: Webpack 5
- **Storage**: Chrome Storage API
- **Notifications**: Chrome Alarms API

---

## 📁 Project Structure

```
subscription-guardian/
├── src/
│   ├── background/
│   │   └── background.ts        # Service worker
│   ├── content/
│   │   └── content.ts            # Page detection logic
│   ├── popup/
│   │   ├── App.tsx               # Main dashboard UI
│   │   └── index.tsx             # React entry point
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       ├── detector.ts           # Detection algorithms
│       └── storage.ts            # Storage utilities
├── public/
│   ├── popup.html                # Popup HTML
│   └── icons/                    # Extension icons
├── manifest.json                 # Extension manifest
├── webpack.config.js             # Build configuration
└── package.json
```

---

## 🔬 Detection Algorithm

### Keyword NLP Scanning
```typescript
const KEYWORDS = [
  'free trial', 'subscription', 'auto-renew',
  'monthly plan', 'billing cycle', 'recurring'
];
```

### Pattern Recognition
- Pricing tables detection
- Payment form identification
- Trial duration extraction using regex
- Price extraction with currency support

### Risk Scoring Formula
```
Risk Score = 
  + Trial Length Risk (0-35 points)
  + Dark Patterns (10 pts each)
  + Auto-Renew Detection (15 pts)
  + Billing Cycle Factor (10 pts)
```

---

## 🎨 Screenshots

*Add screenshots of:*
1. In-page detection alert
2. Tracking form
3. Dashboard overview
4. Risk indicators
5. Renewal notifications

---

## 🔒 Privacy & Security

**We take privacy seriously:**

- ✅ **No account required** — works locally
- ✅ **No server communication** — all data stays in browser
- ✅ **No password collection** — only analyzes page text
- ✅ **No bank integration** — user-controlled tracking
- ✅ **Open source** — audit the code yourself

**Required Permissions:**
- `storage` — Save subscriptions locally
- `alarms` — Schedule renewal reminders
- `notifications` — Send renewal alerts
- `activeTab` — Analyze current page content
- `scripting` — Inject detection logic

---

## 🛠️ Development

### Build Commands

```bash
# Development mode (watch)
npm run dev

# Production build
npm run build

# Type checking
npm run type-check
```

### Testing

1. Load extension in Chrome
2. Visit `demo/subscription-page.html`
3. Verify detection alert appears
4. Track subscription and check dashboard
5. Test notification system (manually trigger alarm)

### Adding Features

1. **New detection patterns**: Edit `src/utils/detector.ts`
2. **UI changes**: Modify `src/popup/App.tsx`
3. **Background logic**: Update `src/background/background.ts`

---

## 📊 Roadmap

### v1.1 - Enhanced Detection
- [ ] ML-based text classification
- [ ] Support for more languages
- [ ] Email renewal scanner (Gmail integration)

### v1.2 - Cross-Platform
- [ ] Firefox support
- [ ] Edge support
- [ ] Safari support

### v1.3 - Advanced Features
- [ ] Cancellation link extractor
- [ ] Price history tracking
- [ ] Spending insights and analytics
- [ ] Export data to CSV

### v2.0 - Smart Features
- [ ] Auto-cancellation assistant
- [ ] Subscription recommendations
- [ ] Alternative service suggestions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Muhammad Tahir** - *Initial work* - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Inspired by the need for consumer protection in the subscription economy
- Built for the [Hackathon Name] hackathon
- Thanks to all contributors and testers

---


---

## 🎯 For Hackathon Judges

### Innovation
Real-time browser-level subscription intelligence — a preventive approach, not reactive tracking.

### Technical Complexity
- NLP-based detection algorithms
- Chrome extension architecture (Manifest V3)
- React-based dashboard with real-time updates
- Intelligent notification scheduling system

### Impact
Solves a real financial problem affecting millions. Can save users hundreds of dollars annually.

### Presentation
- Live demo with test pages
- Clean, professional UI
- Clear value proposition
- Scalable architecture

---

**Built with ❤️ to help people save money and avoid subscription traps**

---

## 📈 Statistics

*If you have usage data:*
- Subscriptions tracked: X
- Money saved: $X
- Users protected: X
- Active installations: X
