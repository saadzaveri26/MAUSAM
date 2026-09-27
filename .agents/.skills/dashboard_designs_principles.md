# Skill: dashboard_design_principles

## Why This Skill Exists
Generic "anti-AI-slop" design skills (including tasteskill.dev's flagship skill) are explicitly scoped to landing pages, portfolios, and marketing redesigns — not dashboards, data tables, or multi-step product UI. This skill governs the three MeghSetu surfaces that fall outside that scope: the Analytics Dashboard, the Admin Portal, and the Citizen Report Form. The Landing Page is governed separately by `tasteskill_integration.md`.

## Process
1. Declare the design read before building each surface: who uses it, what are they trying to do, what's the one thing that matters most on it. Do this per surface — they have different jobs.
2. Build using Tailwind classes consuming the tokens from `ux4g_token_translation.md` — never hardcode a hex value or spacing number outside `tailwind.config.ts`.
3. Run the pre-flight audit before marking a surface done.

## Ground the Design in the Actual Genre
Reference real operational monitoring tools — flight-tracking dashboards, seismic monitoring, disaster-response command centers — not landing-page portfolios or generic admin-template kits.

## Per-Surface Direction
- **Citizen Report Form**: mobile-first, single column. GPS auto-capture with an explicit visible confirmation state. Category dropdown matching the real classifier categories. ML classification result shown in plain language immediately after submission, never raw JSON.
- **Analytics Dashboard**: map-dominant layout (Leaflet takes the majority of the viewport). KPI strip above it. Category/state/trend charts below. Severity colors double as the primary accent system.
- **Admin Portal**: dense, table-first (a verification queue is a workflow tool, not a card gallery). One-click verify/reject with a note field. Gated by `admin_auth.md` — no page renders admin data before the token check passes.

## Reject These Specific Patterns
- Gradient washes or glow as decoration
- Glassmorphism / `backdrop-filter: blur()` navigation
- Grain/noise overlays
- Uniform card-with-shadow treatment regardless of content type
- Scroll-triggered fade/slide animations, or hover transitions applied identically everywhere
- Tracked-out ALL-CAPS eyebrow labels
- Placeholder-shaped content (fake city names, round-number stats) — use real report data and real Indian place names
- Claiming "real-time" when the actual mechanism is polling — say "updates every 20 seconds"

## Pre-Flight Audit
- [ ] Genre-appropriate (monitoring tool), not marketing-page or generic-admin-template styled?
- [ ] Every stat/example is real data, not placeholder content?
- [ ] "Real-time" language matches the actual update mechanism?
- [ ] Severity colors used consistently with their meaning, never decoratively?
- [ ] Motion only responds to a real user action, no ambient/scroll animation?
- [ ] Uses tokens from `tailwind.config.ts`, no hardcoded values?
Any unchecked box blocks shipping.
