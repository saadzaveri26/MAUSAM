# Skill: tasteskill_integration

## Purpose
Bring in the two tasteskill.dev skills that genuinely apply, routed to the correct surface. Note: tasteskill's own examples and docs are heavily Tailwind/shadcn-oriented, so this now fits MeghSetu's stack more naturally than it did on the prior vanilla-HTML build.

## Install
```
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "output-skill"
```

## Routing
**`output-skill` — apply across ALL FOUR pages.** Completion-discipline only, no genre restriction. Run it as part of the same pre-flight audit required by `dashboard_design_principles.md`.

**`design-taste-frontend` v2 — apply ONLY to the Landing Page** (`src/app/page.tsx`). Its own documentation excludes dashboards, data tables, and multi-step product UI — do not apply it, or its visual-style variants (minimalist-skill, soft-skill, brutalist-skill), to the Dashboard, Admin Portal, or Citizen Report Form.

Brief for the Landing Page:
```
I have loaded tasteskill v2 (experimental) as my only source of design rules 
for this page only.

Brief:
- Page kind: landing (public-facing, government/disaster-response context)
- Product: MeghSetu — citizen and social-media weather intelligence platform 
  for India (SIH 2026, PS26069, IMD/MoES)
- Stack: Next.js + Tailwind CSS, consuming the UX4G-translated tokens already 
  defined in tailwind.config.ts — use these tokens, don't invent a separate 
  palette for this page alone.
- Vibe words: restrained, official, trustworthy, calm — NOT startup-glossy
- Avoid: gradient glow, glassmorphism, grain overlays, consumer-SaaS aesthetic

Step 1. Declare your design read in one sentence and the three dial values 
with one-line reasoning each. Stop.
```

## Rules
- design-taste-frontend and its visual-style variants never touch the Dashboard, Admin Portal, or Citizen Report Form.
- The Landing Page still consumes the shared `tailwind.config.ts` tokens — tasteskill governs composition/layout/motion judgment, not a license to invent a separate color system.
- output-skill's checks are mandatory, not optional, on every surface.
