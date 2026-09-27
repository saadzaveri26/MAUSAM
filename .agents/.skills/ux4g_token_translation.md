# Skill: ux4g_token_translation

## Purpose
Give MeghSetu's Next.js/Tailwind frontend the UX4G Design System 3.0's structural credibility (spacing, typography, elevation, radius) without importing its CSS bundle, which would conflict with Tailwind's own reset/specificity. This is the same Token Translation approach already validated on a prior project in this workflow — apply it directly rather than re-deriving it.

## Process
1. Do NOT run `npm install ux4g-web-components` or load the UX4G CDN CSS. Translate tokens into `tailwind.config.ts` instead.
2. Typography: base font `Noto Sans`, display font `Noto Sans Display`, both loaded via `next/font/google`. Weights 400/500/600/700. Minimum body size 12px (GIGW 3.0 compliance). Max line width ~720px / 65-75 characters for body text.
3. Corner radius scale (confirmed values):
   `none: 0px, xs: 2px, sm: 4px, md: 8px, lg: 12px, xl: 16px, 2xl: 24px, full: 9999px`.
   Apply `sm`-`lg` to primary buttons, cards, and containers. Reserve `2xl` and `full` for badges, avatars, and status pills only — never on primary action buttons or main containers (this was a corrected mistake on a prior project; do not repeat it).
4. Elevation (shadow tokens, tinted to the background hue, not pure black):
   - L0: `none` (flat/disabled)
   - L1: `0px 1px 2px 0px rgba(11,37,69,0.06), 0px 1px 2px 0px rgba(11,37,69,0.06)` (cards at rest)
   - L2: `0px 4px 8px 0px rgba(11,37,69,0.08), 0px 1px 2px 0px rgba(11,37,69,0.06)` (hover, dropdowns)
   - L3: `0px 8px 16px 0px rgba(11,37,69,0.12), 0px 4px 8px 0px rgba(11,37,69,0.08)` (popovers, menus)
   - L4: `0px 16px 32px 0px rgba(11,37,69,0.16), 0px 8px 16px 0px rgba(11,37,69,0.12)` (modals)
5. Spacing: base-4 rhythm — Tailwind's default scale already aligns with this; no remapping needed.
6. Color: keep MeghSetu's own severity-based palette (navy/sky/severity colors from `dashboard_design_principles.md`) as the primary system — do NOT adopt UX4G's default purple/saffron brand colors. This is a Token Hybrid, not full UX4G adoption, matching the same decision made on a prior project for the same reasoning: the severity-color system carries real meaning (alert levels) that a generic brand palette would dilute.
7. Attribution: add a comment block in `globals.css` and a line in `README.md` crediting UX4G Design System (Government of India, MIT License) — verify current exact license/attribution text on ux4g.gov.in before finalizing, don't assume it's unchanged from a prior check.

## Rules
- Never import UX4G's CSS bundle directly — Token Translation only.
- Never use `2xl`/`full` radius on primary buttons or containers.
- Never replace the severity-color palette with UX4G's default brand colors.
- Do this once, early, in `tailwind.config.ts` — every other page/component consumes these tokens, not re-derives them.
