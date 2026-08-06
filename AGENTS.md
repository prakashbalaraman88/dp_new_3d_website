# AGENTS.md — dp-website-main-BACKUP-20260401

Stack: Vite 5, React 18.3, TypeScript, Tailwind 3, gsap 3.15, lenis 1.3, framer-motion 11, react-router 6, three/@react-three/fiber (only `/experience` route).

Commands:
- dev: `npm run dev` (port 5180 via .claude/launch.json)
- build (acceptance gate): `npm run build`  (tsc && vite build)
- no test suite exists; do not add one unless SPEC says so

Conventions:
- Scroll scrubbing is HAND-ROLLED: Lenis raf + smoothstep/clamp helpers. See `src/experience/HeroScrub.tsx` — the canonical pattern (seek-throttled `video.currentTime` scrub, text "acts" driven by smoothstep opacity/translate).
- ScrollTrigger is NOT currently imported anywhere; gsap used for enter animations only.
- Homepage `/` = `src/discover/JourneyExperience.tsx`: 3 phases (hero → quiz → showcase) via useState + AnimatePresence.
- Quiz: `src/discover/DiscoverExperience.tsx` (deck driver), `QuizSection.tsx` (image cards), `ChoiceSection.tsx` (text buttons), `data.ts` (9 steps), `report.ts` (scoring).
- Honour `prefers-reduced-motion` in any new scroll experience (HeroScrub:25 shows the pattern).

Gotchas:
- `public/images/discover/*` referenced by quiz data does NOT exist — cards fall back to palette gradients.
- `public/` is 680MB already; do not bulk-copy the Pinterest library into it — only curated resized subsets.
- Pinterest library (READ-ONLY reference, outside repo): `D:\dezignpool\style-library\library\<style>\<room>\*.jpg`, 15 styles × 16 rooms, ~21.6k images. Metadata: `distill\style_specs.json` (per-style palette/materials/essence), `distill\captions\<style>__<room>.jsonl` (per-image VLM captions), `sheets\` (contact sheets + index JSONs).
- Windows: paths with spaces; use forward slashes in Node scripts.
