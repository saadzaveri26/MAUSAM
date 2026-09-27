# MeghSetu — UX4G Token Translation Specification (Token Hybrid)

## Overview
This document defines the translated design tokens adapted from the **UX4G Design System 3.0** (Government of India, MIT License) for MeghSetu's Next.js and Tailwind CSS frontend rebuild.

In alignment with `ux4g_token_translation.md`, MeghSetu implements a **Token Hybrid** approach:
- Structural credibility (typography, spacing, corner radius scale, and elevation shadows) is derived from UX4G 3.0.
- The color palette preserves MeghSetu's operational severity/alert color system (IMD disaster management context) layered over dark monsoon-night navy surfaces.

---

## 1. Typography
- **Primary Body Font**: `Noto Sans` (via `next/font/google`), weights 400, 500, 600, 700
- **Display / Heading Font**: `Noto Sans Display` (via `next/font/google`), weights 500, 600, 700
- **Monospace / Metric Font**: `IBM Plex Mono`, weights 400, 500, 600
- **Accessibility & GIGW 3.0 Compliance**: Minimum body size: `12px` (default base: `14px`), line height: `1.5`, maximum reading line width: `720px` (`max-w-prose`).

---

## 2. Corner Radius Scale (UX4G Standard)
| Token | Value | Allowed Usage |
|---|---|---|
| `none` | `0px` | Full bleed banners, sharp panels |
| `xs` | `2px` | Micro-tags, input borders |
| `sm` | `4px` | Small buttons, compact badges |
| `md` | `8px` | Primary buttons, form inputs, tooltips |
| `lg` | `12px` | Cards, content containers, callout boxes |
| `xl` | `16px` | Modals, flyout panels |
| `2xl` | `24px` | **Badges, avatars, status pills only** (Never on primary action buttons or main cards) |
| `full` | `9999px` | Circular indicators, status pill badges only |

---

## 3. Elevation & Shadow System (Tinted Navy)
Shadows are tinted to the finalized brand navy background hue (`rgba(11, 42, 97, ...)`, corresponding to `#0B2A61`) rather than harsh pure black:
- **L0 (`none`)**: Flat/disabled state.
- **L1 (`boxShadow.l1`)**: `0px 1px 2px 0px rgba(11,42,97,0.06), 0px 1px 2px 0px rgba(11,42,97,0.06)` (Cards at rest).
- **L2 (`boxShadow.l2`)**: `0px 4px 8px 0px rgba(11,42,97,0.08), 0px 1px 2px 0px rgba(11,42,97,0.06)` (Hover states, dropdown menus).
- **L3 (`boxShadow.l3`)**: `0px 8px 16px 0px rgba(11,42,97,0.12), 0px 4px 8px 0px rgba(11,42,97,0.08)` (Popovers, slide-out menus).
- **L4 (`boxShadow.l4`)**: `0px 16px 32px 0px rgba(11,42,97,0.16), 0px 8px 16px 0px rgba(11,42,97,0.12)` (Dialogs and modal overlays).

---

## 4. Color System (Brand Identity & Operational Severity Palette)

### Brand Identity Tokens (Finalized Re-theming Pass)
- `--navy`: `#0B2A61` (Primary institutional navy — replaces placeholder dark navy)
- `--brand-blue`: `#0169DE` (Primary action buttons, links, core interactive controls)
- `--accent-blue`: `#0CAAEF` (Highlights, active navigation states, interactive hover states)
- `--surface-alt`: `#D1E2EE` (Card backgrounds, alternate light surfaces)
- `--bg`: `#F5F9FE` (Page background — lighter derived tint ensuring high body readability)

### Surface & Canvas Scale (Derived from #0B2A61)
- `navy-950`: `#07182e` (Deep canvas background)
- `navy-900`: `#0B2A61` (Institutional brand card & container base)
- `navy-800`: `#143875` (Elevated cards, inputs, secondary interactive surfaces)
- `slate-700`: `#1c488a` (Border hover, tertiary actions)
- `slate-600`: `#2b5f9e` (Divider lines, scrollbars)
- `line`: `rgba(209, 226, 238, 0.14)`
- `line-soft`: `rgba(209, 226, 238, 0.07)`
- `ink-0`: `#eef4f7` (Primary high-contrast text)
- `ink-1`: `#b9c9d3` (Secondary labels, muted text)
- `ink-2`: `#7f95a1` (Tertiary / placeholder / disabled text)

### Operational Severity & Alert Accents (STRICTLY UNTOUCHED)
*Critical rule: These tokens encode meteorological alert severity per IMD disaster management protocols and remain completely independent of brand styling.*
- **Normal / Verified / Low**: Teal `#2bb3a3` (dim: `rgba(43, 179, 163, 0.16)`)
- **Watch / Moderate / Advisory**: Amber `#f5a623` (dim: `rgba(245, 166, 35, 0.16)`)
- **Alert / Severe / Preparedness**: Orange `#f97316`
- **Warning / Danger / High / Rejected**: Red `#e5484d` (dim: `rgba(229, 72, 77, 0.16)`)
- **Info / Metadata / Secondary**: Blue `#0169DE` (dim: `rgba(1, 105, 222, 0.16)`)

---

## 5. Attribution
This product uses components and tokens from the UX4G Design System, developed by the Government of India (MIT License). Use of the UX4G Design System does not imply official endorsement, approval, or affiliation with the Government of India.
