MASTER PROMPT: IBVAP-Lite Presentation Website

ROLE: Act as a professional web designer and frontend engineer. Build
a complete, multi-page marketing/presentation website for IBVAP-Lite
(Intelligent Border Video Analytics Platform), a Smart India Hackathon
project. This site is how we PRESENT the project to judges — instead
of a PPT, judges browse this website. It explains the project fully
through text, diagrams, and real screenshots from our working
prototype. It does NOT reuse our dark tactical dashboard UI — this is
a separate, light, approachable, professional site.

═══════════════════════════════════════
BRAND & VISUAL IDENTITY
═══════════════════════════════════════

Color palette (light theme):
- Background: #FFFFFF primary, #F7F8FA secondary sections
- Text: #111827 headings, #4B5563 body, #9CA3AF muted/captions
- Primary accent (bright green): #22C55E — used for CTAs, key stats,
  "Live"/"Free"/positive-outcome highlights, active nav states
- Secondary accent (blue): #3B82F6 — used for links, technical
  callouts, secondary buttons
- Dividers/borders: #E5E7EB
- Alert-red (#EF4444) and amber (#F59E0B) reserved ONLY for the
  Threat Log page, to visually echo the actual prototype's alert tiers

Typography:
- Inter for all text — 700 weight for large headlines, 600 for
  subheads, 400 for body
- JetBrains Mono reserved for: code blocks, technical specs, live
  counters/stats, architecture diagram labels
- Large bold headlines for section openers (cost/time savings,
  product name), smaller lighter text for supporting detail — clear
  two-level hierarchy throughout

Component consistency:
- One button style system: primary (solid green), secondary (outline
  gray), used identically across every page
- One card style: white background, 1px #E5E7EB border, 12px radius,
  consistent padding — used for feature cards, stat cards, and
  architecture component cards alike

═══════════════════════════════════════
SITE STRUCTURE (multi-page, hyperlinked nav)
═══════════════════════════════════════

Persistent top nav (sticky on scroll): Logo/name | Overview |
Architecture | Threat Log | Features & Roadmap | Get Started (CTA
button, always visible, links to install docs)

PAGE 1 — Overview / Home
- Hero: headline stating the core problem + solution in one line,
  subhead with 2-3 line description, primary CTA "See the
  Architecture" and secondary CTA "View on GitHub"
- Problem section: side-by-side comparison table, styled like a
  pricing-comparison card — "Manual Monitoring" vs "IBVAP-Lite"
  (attention span, hardware cost, alert volume, response time)
- Animated counters section (count up on scroll into view): e.g.
  "25-45+ FPS on CPU", "3-tier confidence system", "<1s alert
  dispatch" — real technical stats, not fake social-proof numbers
- How it works: 5-step visual flow (Ingestion → Detection → Face
  Match → Liveness Check → Alert & Log), each step reveals on scroll
- Footer CTA band: "Ready to see it run?" → links to docs

PAGE 2 — Architecture
- Full system architecture diagram (reuse/adapt the existing IBVAP
  diagram — Edge Sensor → Ingestion Engine → YOLOv8n → InsightFace →
  Liveness Gate → FastAPI Core → Command Center / Telegram Bot)
- Each architecture component gets a card below the diagram: name,
  one-line role, key tech (e.g. "InsightFace — MobileFaceNet
  buffalo_sc, 512-D embedding, cosine similarity match")
- Tech stack table: component | technology | why we chose it
  (pull directly from the project brief's stack table)
- Data flow explanation in plain language, not just the diagram

PAGE 3 — Threat Log / Detections
- A real (or realistic sample) feed of actual detection events from
  the prototype: timestamp, camera zone, confidence tier (High/
  Possible/Unidentified, using the red/amber/gray badge system from
  our actual dashboard), matched identity or "Unidentified", evidence
  thumbnail
- Explain the tiered confidence system and cooldown/dedup logic here,
  with a short example walkthrough
- This page should feel like an audit trail / proof-of-function
  showcase, not a marketing page — more restrained, more data-dense
  than the rest of the site

PAGE 4 — Features & Roadmap
- Current features: grouped cards (Detection, Biometric Matching,
  Alerting, Audit Trail), pulled from what's actually built
- "Coming soon" section, clearly separated and labeled, for planned
  additions (liveness detection, appearance-based re-ID fallback,
  multi-camera scaling, Telegram integration) — this section should
  be easy for us to edit/update later as features ship
- Each feature card: icon, name, one-sentence description, status
  badge (Live / In Progress / Planned)

PAGE 5 — Get Started / Docs
- Real terminal block showing the actual install sequence, styled
  as a live-typing terminal window (git clone → pip install →
  configure → uvicorn run) — this should look like a genuine
  terminal, not a generic code snippet box
- Prerequisites list, required inputs (camera source URL, watchlist
  photos), and links to the actual GitHub dependencies (Ultralytics,
  InsightFace, ONNX Runtime, FastAPI)

═══════════════════════════════════════
ANIMATION SPEC
═══════════════════════════════════════

- Reveal-on-scroll: text blocks, cards, and diagram components
  fade in and slide up slightly as they enter the viewport (stagger
  children by ~80ms within a section)
- Sticky top nav, sticky "Get Started" CTA button always reachable
- Animated counters: numbers count up from 0 when their section
  enters the viewport, once only
- Subtle parallax on hero background layer only (not used elsewhere)
- Architecture diagram: each pipeline stage highlights in sequence
  on first scroll-into-view, showing data flow left to right
- Terminal block on the Get Started page: types out the install
  commands character-by-character on scroll-into-view, once
- No hover animations beyond a simple color/border transition on
  buttons and cards — keep interaction feedback subtle

═══════════════════════════════════════
UX / ACCESSIBILITY REQUIREMENTS
═══════════════════════════════════════

- Fully responsive: sections stack cleanly on mobile, nav collapses
  to a hamburger menu with the same page links
- High contrast text, visible keyboard focus states on all
  interactive elements, ARIA labels on nav and buttons
- Fast initial load — animations should never block content from
  being readable if JS is slow/disabled
- Every internal link (nav, CTAs, footer) must route to the correct
  page/section — this site is the primary navigation surface for
  judges, so broken links are not acceptable

═══════════════════════════════════════
CONTENT NOTES
═══════════════════════════════════════

- Use real project content throughout (from our brief): problem
  statement, tech stack, architecture, confidence tiers, alert flow
- Features & Roadmap page must be easy to edit later — structure it
  as a simple data array/list a non-designer can update as new
  features ship
- Tone: confident, plain-language, judge-and-technical-reader
  friendly — explain what it does before how it works