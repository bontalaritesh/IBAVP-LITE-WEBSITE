# IBVAP-Lite Command Platform

Functional extension of the IBVAP-Lite marketing site (Vite + React + Tailwind v4).
The marketing pages (Overview, How It Works, Architecture, Threat Log, Features, Get Started)
are untouched. The Command Platform lives under `/platform`.

## Identity rules (do not break)

- Light paper theme `#f2f2ee`, white cards, `#E5E7EB` borders, green-500 accent.
- Fonts: Space Grotesk (sans) + DM Mono (mono).
- NO military-terminal / CRT / scanline / cyberpunk styling.
- Sentinel contributes FUNCTIONALITY only — never its visual theme.

## Demo-data honesty (spec rules 14/15)

- ALL platform data is simulated. Pages must keep the DEMO / SIMULATION badges.
- Hashes are labeled "DEMO VALUE" — never imply real SHA-256 verification.
- Map is labeled "NOT GEOGRAPHIC DATA". Simulated feeds are labeled "SIM FEED".
- Status-transition buttons in Incidents are non-functional by design.

## Structure

```
src/platform/
  types.ts        # Camera, Incident, Detection, Target, Evidence, Alert, SystemMetric
  data.ts         # Centralized DEMO dataset (the only place with hardcoded records)
  services.ts     # Async mock service layer — swap internals for real API later
  ui.tsx          # Shared themed primitives (PageHeader, Panel, StatCard, badges, chips)
  BorderMapCanvas.tsx  # WebGL terrain (raw GL, no deps) + 2D overlay (FOV, trails, pulses)

src/pages/platform/
  PlatformLayout.tsx   # Sidebar shell + "SIMULATED ENVIRONMENT" top bar
  CommandCenter.tsx    # left camera rail / center map / right event feed / bottom metrics
  LiveSurveillance.tsx # camera selector + simulated feed tiles (ONLINE/WARNING/ALERT/OFFLINE)
  Incidents.tsx        # filters + search + sorting + detail panel
  BorderMap.tsx        # full-page interactive map + legend + selection panels
  TargetTracking.tsx   # track table + detail w/ Re-ID state + movement history
  Reconstruction.tsx   # camera hand-off chain + sighting timeline
  EvidenceVault.tsx    # evidence cards, demo SHA-256, chain-of-custody, verify (simulated)
  EvidenceClips.tsx    # player shell + clip list + hash check interface
  Analytics.tsx        # SVG line/bar/donut charts, themed
  SystemStatus.tsx     # gauges, model status, RTSP/network, storage
  Reports.tsx          # 5 report types, preview pane, export stub + browser print
  Settings.tsx         # 6 sections: cameras/detection/recognition/alerts/evidence/system
```

Routes are in `src/routes.tsx` under the `/platform` prefix. Marketing routes unchanged.

## Connecting real data later

Replace the bodies of `platformService.*` in `src/platform/services.ts` with calls to the
FastAPI backend (`/api/cameras`, `/api/alerts`, WebSocket `/ws/feed` …). Pages already
consume the service layer, so no page rewrites needed. Then flip page badges from
DEMO/SIMULATION to LIVE where data is genuinely real.

## Commands

```bash
pnpm install
pnpm dev        # local dev
pnpm build      # production build
npx tsc --noEmit
```
