# Zero Hero

A simple static single-page app to help answer the question "what is a number with X zeros called?" — built to be mobile-first, fast, and intuitive for kids.

This repository contains a single static page (index.html) that can be served via GitHub Pages.

Features
- Responsive grid from 1–100 zeros (100 is a special "Googol" tile)
- Clear modal showing scientific notation, formatted number, and name
- Optional AI/TTS actions (Gemini) — disabled by default; see notes below
- Mobile-friendly UI and accessible controls

Local development
1. Clone the repo:
   git clone https://github.com/<your-username>/zero_hero.git
2. Serve locally (simple HTTP server):
   - Python 3: `python -m http.server 8000` and open http://localhost:8000
   - or use any static server (live-server, http-server, etc.)

Deploy to GitHub Pages
- Option A (recommended simple): Enable GitHub Pages in repository Settings → Pages → Branch: `main` (root).
- Option B: Use a `gh-pages` branch and a deploy action (not included by default).

API keys & AI/TTS
- The app includes client-side hooks for Gemini (AI/fun-fact) and a TTS endpoint, but you must not commit API keys to a public repo.
- Recommended approaches:
  1. Add a serverless function (Cloud Run, Cloud Functions, Vercel, Netlify functions) that keeps your API key secret and proxies requests.
  2. If you absolutely must call from the browser, keep the repo private and store the key in the hosting platform's secrets — but this is less secure.
- See the "fetchGeminiFact" and "fetchPronunciation" functions in `index.html` for the expected request format.

Customization ideas
- Add more illion names beyond Duotrigintillion if you want to extend > 100 zeros.
- Add a search box to jump to a specific zero count.
- Add a small quiz mode for learning.

License
- MIT (see LICENSE)