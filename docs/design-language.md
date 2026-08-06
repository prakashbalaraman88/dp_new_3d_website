# DezignPool Journey — Design Language (derived from Solace/GRIGOLETTO study, 2026-08-06)

Source: figma-templates-en.vercel.app analysis (tokens pulled from live CSS + frame-sampled Solace demo).
Adapted to DezignPool brand: canonical bronze `#A98E5F` stays the accent (NOT Solace orange).

## Typography
- Display: high-contrast serif (existing site serif OK; DM Serif Display class), ALL CAPS for hero/act headlines, staggered line indents, ONE accent word per headline in bronze or italic.
- Body/UI: light grotesque (Inter-class), 14–16px, weight 300–400.
- Micro-labels: uppercase 12–14px, letter-spacing 1.4px.
- Type ramp: 12 / 14 / 16.5 / 18 / 22 / 28 / 38 / 54 / 66px.

## Color
- Base: near-black warm `#0b0b0c` → `#101012` → `#16161a`.
- Text: warm cream `#f2efe9`; muted = same at 62% / 42% alpha.
- Accent: bronze `#A98E5F` (brand). Secondary warmth (imagery-echo only): dusty rose/terracotta `#a86858` `#d8a898`, deep maroon `#683828`. Cool counter-note: slate `#383848`.
- Rule: every scene monochromatically warm + one cool note.

## Surfaces (glassmorphism)
- Glass fill `rgba(255,255,255,.06)` (hover `.09`), border `rgba(255,255,255,.10)` (hover `.16`), `backdrop-filter: blur(16px)`.
- Radii: 12 / 20 / 24 / 28px.
- Buttons: uppercase, 14px, weight 300, tracking 1.4px, pill; primary = cream pill with bronze circular arrow chip.

## Motion
- Master easing: `cubic-bezier(0.625, 0.05, 0, 1)` ("luxury snap"). Soft variant: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Reveals: opacity 0 + translateY(28px), 0.9s.
- Hovers: 0.4–0.8s transforms.
- Exactly one slow infinite "alive" element per screen (rotating circular scroll badge / pulsing dot, ~1.6s).

## Signature mechanic (Solace)
- One scroll gesture = one cinematic camera move: video plays from current hold to next hold (~1–1.5s scroll-driven travel), settles still, text state crossfades.
- Page counter `01 —— 0N` reflects current hold.
- UI cards may sit tilted in perspective, "inside" the scene.

## Imagery
- Golden-hour warmth, soft bloom (no grain), foreground bokeh layers in front of headlines for depth, frosted glass info cards over renders.
