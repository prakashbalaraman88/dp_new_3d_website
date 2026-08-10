# DezignPool website audit

Date: 10 August 2026
Scope: conversion, visual/SXO, accessibility spot checks, code architecture, performance, security, SEO/GEO, and CRM/Baileys readiness.

## Executive outcome

The site has a strong premium visual identity, real project photography, a useful style-discovery idea, and a credible form foundation. Its biggest business weakness was structural: the lead form came after nearly the entire page. Its biggest technical risks were a browser-exposed AI credential, a second environment helper that serialized unintended `VITE_*` values, an oversized static-media estate, weak search delivery for a quiz-gated SPA, and no safe CRM intake route.

This pass fixes the reversible high-confidence items without sending a test lead, deploying, or touching CRM production:

- lead form now appears immediately after the quiz/result and before the gallery;
- a once-per-session reminder opens after the testimonial section when no lead was submitted;
- mobile and desktop Enquire links target the one canonical form;
- explicit phone/WhatsApp contact consent is required and recorded;
- two testimonial videos no longer auto-load about 169.47 MB of media;
- the browser AI-key path is removed and the build-time environment leak is fixed;
- production dependency findings fall from 11 (2 critical, 7 high, 2 moderate) to 2 moderate;
- artificial 2.5-second loading delay is removed from internal routes;
- route-aware metadata, 11 route-specific static HTML documents, accurate business schema, crawler rules, sitemap, crawlable links, safer caching, and staged security headers are added;
- a consent-gated Meta Pixel, linked privacy notice, and explicit analytics choice are added;
- the CRM now has a locally implemented public website-intake route with Turnstile, strict validation, rate limiting, idempotency, reinquiry handling, consent audit, and Baileys handoff;
- the production build and affected browser flows pass.

The code connection is implemented but **not yet live**. Migration `0012_add_website_lead_intakes.sql`, CRM and website environment values, a Turnstile widget, deployment, and one explicitly approved controlled lead are still required. EmailJS remains the fallback while the CRM endpoint/site key are not configured.

## Method and evidence boundary

- Source and dependency inspection across the routed application, inactive server code, configuration, and deploy manifests.
- Current public-site HTTP checks for page, sitemap, robots, and security-header behavior before these local changes are deployed.
- Desktop and 390 px mobile browser checks of hero, form order, validation, reminder, focus behavior, navigation, metadata, calculators, and secure guide.
- Production `tsc && vite build && node scripts/prerender-seo.mjs`, bundle/string scans, npm production audit, local production preview, static-route document validation, robots/XML parse, and public-asset inventory.
- No Lighthouse field data, Search Console, Bing Webmaster, analytics account, production CRM database, production deployment, real lead, email, or WhatsApp message was used. Local timing is not a substitute for real-user Core Web Vitals.

## Conversion and visual audit

### What is strong

- Premium art direction: typography, restrained gold palette, dark editorial treatment, strong residential imagery, and coherent motion.
- Clear differentiation through the style quiz and personalised report.
- Project pages use real photography, descriptive alt text, design notes, and a coherent case-study structure.
- The revised mobile hero keeps the core headline legible and exposes Enquire without opening the menu.
- The revised form preserves country-aware phone handling, `+91` defaults, browser autofill, validation, remembered-contact opt-in, and session draft recovery.

### What was fixed

1. Form is the first main section after a completed or skipped quiz; gallery follows it.
2. Reminder appears only after visitors reach the post-testimonial trigger, only once per session, and never after a successful submission.
3. Reminder uses the original form rather than duplicating fields. Close, overlay click, Escape, focus trap, focus restoration, and CTA-to-form behavior are verified.
4. Mobile hero heading no longer clips; direct Enquire CTA is usable and keyboard/DOM addressable.
5. Empty optional select values now reach conditional validation, producing friendly messages instead of raw enum errors.
6. Consent is required for phone/WhatsApp follow-up.

### Remaining conversion/SXO improvements

| Priority | Finding | Recommendation |
|---|---|---|
| P1 | A visitor who skips the quiz sees a detailed form before any compact trust proof. | Add a small, factual trust strip beside/above the form: real years, homes, locations, warranty/process facts, or verified ratings only. |
| P1 | Page, quiz-complete, and successful-lead events exist, but they do not establish the full funnel baseline. | Add quiz start/step/skip, form view/start/validation error, reminder view/CTA/dismiss, WhatsApp click, and booking click. Do not record PII in analytics. |
| P1 | Tone on legacy About/Services/classic sections is frequently jokey or exaggerated (for example neighbour envy, selling a kidney, amateur-hour comparisons). | Rewrite for calm expertise, material/process proof, and specific outcomes. Remove unverifiable superlatives and fake-sounding award language. |
| P2 | Form is necessarily detailed but visually long on mobile. | After measuring abandonment, test a two-step layout: project essentials first, contact/consent second. Keep all validation and draft behavior. |
| P2 | Reminder wording is appropriate but untested. | A/B test one variable at a time: headline, proof line, or CTA. Keep once-per-session frequency and suppression after submission. |

## Performance and code audit

### Current measured facts

- Production build passes with 2,993 transformed modules in 15.43 seconds, followed by successful validation of 11 route documents.
- Initial shell: about 264.57 KB main JS, 161.97 KB vendor, 141.02 KB UI, and 98.43 KB CSS before compression; build-reported combined gzip is about 198 KB before the immediately requested homepage journey chunk.
- Homepage journey chunk adds about 179.84 KB JS and 30.99 KB CSS before compression (about 61.56 KB gzip).
- Heavy lazy routes remain: Calculator about 651.26 KB (173.67 KB gzip) and 3D HeroExperience about 971.44 KB (263.26 KB gzip).
- `public/` contains 1,124 files totalling 792.32 MB.
- Largest files include 96.69 MB and 72.78 MB testimonial videos; unused/legacy project videos range up to 87.15 MB.
- Local production preview returned HTML in about 15 ms, which proves only the local server path—not internet or device performance.

### Improvements implemented

- Testimonial videos use `preload="none"` and never autoplay. Both had `readyState=0` while paused in browser verification.
- `xlsx` and nine dependent packages were removed because no source imports it.
- Chat no longer pulls the OpenAI SDK into its lazy chunk; the unused SDK dependency and dormant browser OpenAI/Claude client helpers were removed entirely.
- About, Services, Projects, and calculators no longer wait behind a fixed 2.5-second loading animation.
- HTML is revalidated while hashed build assets are immutable; the old configuration incorrectly made every SPA response immutable for a year.
- Vite now uses its default esbuild minifier with equivalent console/debugger stripping. This avoids a reproduced Terser/V8 allocation failure and reduced final build time while increasing gzip output slightly.

### Remaining performance work

| Priority | Finding | Recommendation / acceptance |
|---|---|---|
| P1 | 792.32 MB deploy artefact creates slow builds/uploads and cache churn. | Generate a usage manifest; delete only confirmed orphan media; keep source originals outside deploy. Target under 200 MB for the static artefact. |
| P1 | Multiple MP4s are 60-97 MB. | Transcode delivery derivatives to modern H.264/AV1/WebM, cap dimensions/bitrate, use posters, and verify byte-range support. Target testimonial files under 12 MB each. |
| P1 | Homepage business content is mounted only after hero/quiz state changes. Metadata is now statically generated, but substantial service/project/form copy is not. | Render a crawlable textual homepage shell at build time and progressively enhance the journey. |
| P1 | Calculator and 3D route chunks exceed 500 KB. | Profile imports; split calculator PDF/export tools behind action-triggered imports; split 3D helpers. Preserve route-level lazy loading. |
| P2 | Google Fonts stylesheet is render-blocking and third-party. | Self-host the exact used font files with subsets and `font-display: swap`, then remove unused weights. |
| P2 | Old routed and unrouted implementations coexist (`/classic`, inactive ProjectManagement, stale Express server, unused discovery form path). | Inventory dependencies and references, archive intentionally retained prototypes, then delete confirmed dead code in a separate reviewed change. |
| P2 | No automated test suite exists. | Add a small integration suite for route metadata, form validation/order, reminder suppression, and calculator PDF smoke tests. |

## Security audit

### Fixed now

1. Removed OpenRouter/OpenAI calls using `dangerouslyAllowBrowser`; the public help widget is deterministic and states that messages are not submitted.
2. Replaced dynamic `import.meta.env[key]`, which made Vite serialize every `VITE_*` variable, with explicit EmailJS variables only.
3. Production bundle scan finds no `openrouter.ai`, `VITE_OPENROUTER`, `VITE_OPENAI_API_KEY`, `VITE_CLAUDE_API_KEY`, `dangerouslyAllowBrowser`, or OpenRouter key prefix.
4. Removed unused vulnerable `xlsx`.
5. Upgraded jsPDF from 3.0.4 to 4.2.1, React Router from 6.22.2 to 6.30.4, and applied non-breaking transitive fixes for `cross-spawn`, DOMPurify, and protobufjs.
6. Production npm audit is now 2 moderate findings, both requiring React Router 7.18+; there are no critical/high production findings.
7. Added HSTS, nosniff, frame denial, referrer policy, permissions policy, COOP, correct HTML caching, and a CSP in Report-Only mode across deploy manifests.
8. Removed dormant, unreferenced ProjectManagement browser OpenAI/Claude client files and the unused OpenAI SDK dependency so unsafe credential patterns cannot be reactivated accidentally.
9. Removed the hard-coded Meta Pixel fallback; the Pixel now requires an explicit deploy ID and visitor consent. Declining was browser-verified to produce no Meta script or request.
10. Added a public privacy notice and a consent preference control; optional tracking remains off by default.
11. Added a narrow CRM public intake with exact-origin checks, 32 KB/body constraints, strict enums, E.164 validation, Turnstile hostname/action verification, honeypot/timing checks, per-IP and per-contact limits, HMAC identity/payload hashes, transaction-level deduplication, and no PII body logging.

### Open security risks

| Priority | Risk | Required action |
|---|---|---|
| P0 | The previously shipped OpenRouter credential may already be copied. Removing it from code does not revoke it. | Revoke/rotate it in OpenRouter immediately and remove the old local value. Review provider usage logs from first exposure to rotation. |
| P0 | The new CRM intake is local only: its migration/configuration has not been applied to production and no controlled lead has proven the deployed handoff. | Apply the migration, configure exact origins/service identity/HMAC/Turnstile, deploy disabled, run non-sending checks, then enable and perform one explicitly approved controlled lead. Never put a CRM token in the browser. |
| P1 | EmailJS public identifiers remain callable by anyone and multiple old forms use hard-coded service/template IDs. | Keep only as monitored fallback, add provider-side restrictions/quotas if supported, then remove after CRM cutover. Consolidate all legacy forms. |
| P1 | The inactive ProjectManagement UI is still unrouted, and stale `server/index.js` has permissive CORS, no schema/rate limit, and interpolates unescaped form input into HTML email. Its dormant browser AI credential helpers are now removed. | Keep both unreachable; remove/archive or rebuild behind authenticated server calls before reuse. Do not deploy the stale Express server. |
| P1 | CSP is Report-Only to avoid breaking production integrations. | Deploy, collect/report violations, tighten exact origins, then enforce. Remove `'unsafe-inline'` where feasible. |
| P1 | React Router 6 retains two moderate advisories. | Plan a React Router 7.18+ migration with navigation/redirect regression tests; do not use untrusted input in `navigate`/`Link` destinations meanwhile. |
| P1 | The CRM production dependency tree still reports 11 high and 14 moderate findings after safe transitive fixes reduced it from 15 high/15 moderate. Remaining findings are rooted in the Expo 54/Metro mobile build chain (`image-size`, PostCSS, and legacy `uuid` paths), and npm offers only a breaking Expo 57 remediation. | Keep Metro/dev tooling off the public server runtime, plan a tested Expo SDK upgrade, and consider separating server deployment dependencies from the mobile toolchain. Do not run `npm audit fix --force` on production. |
| P2 | Client-side session drafts contain enquiry/contact data; remembered contacts use localStorage only after user opt-in. | Document retention, keep draft session-only, clear on success, and avoid sensitive free-text fields. Current implementation already follows the latter three. |

## Technical SEO and GEO audit

### Fixed now

- One consistent `https://www.dezignpool.com` canonical family.
- Unique title, description, canonical, robots, Open Graph, Twitter, and WebPage schema for indexable routes and project details.
- `/discover`, `/classic`, `/experience`, `/experience-video`, and unknown routes resolve to `noindex,follow` with a self-referencing canonical.
- The build emits flat HTML files for all 11 sitemap routes with route-correct title, description, robots, canonical, Open Graph, Twitter, and WebPage JSON-LD before JavaScript runs.
- Explicit slashless rewrites are configured for Render (the current live origin identifies itself with `rndr-id`), Netlify, and Vercel, avoiding directory/trailing-slash canonical drift.
- Accurate studio telephone, email, address, and only verified visible social URLs in ProfessionalService/WebSite schema; placeholders and fabricated geo/opening-hours data removed.
- Exactly one canonical/description/robots/OG URL after hydration; one static organization graph and one page graph; no leftover `meta[property^="twitter:"]` tags.
- Root `public/robots.txt` returns 200 locally and advertises the sitemap. OAI-SearchBot, ChatGPT-User, and PerplexityBot are explicitly allowed.
- Sitemap contains 11 canonical URLs with defensible `lastmod` values and no ignored `priority`/`changefreq` hints.
- Hero/journey navigation now exposes real crawlable hrefs while preserving the interactive journey.
- Removed self-serving 5-star LocalBusiness review markup from testimonial videos.

### Remaining SEO/GEO work

| Priority | Finding | Recommendation |
|---|---|---|
| P1 | Route metadata is statically generated, but route body content still depends on JavaScript. | Extend prerendering to meaningful route H1/copy/internal links. After deployment, fetch each exact slashless sitemap URL and confirm HTTP 200 with its own canonical in the raw response. |
| P1 | Homepage initially exposes the cinematic hero, not the service/project/form content behind the quiz state. | Render a crawlable textual homepage shell at build time and progressively enhance the quiz. Avoid hidden keyword blocks. |
| P1 | Search accounts and index status were unavailable. | After deployment, verify ownership, submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools, inspect representative URLs, and monitor excluded/duplicate/soft-404 reports. |
| P1 | No automated URL change notification. | Add IndexNow to the release/content pipeline after a key is provisioned. Submit only created/updated/deleted canonical URLs. |
| P1 | Weak topical breadth for high-intent Bangalore searches. | Build expert, evidence-rich pages for service + location + property type, design process, cost factors, timelines, materials, case studies, and FAQs. Avoid thin location clones. |
| P1 | Local entity strength was not verified. | Audit Google Business Profile completeness, primary category, services, address/phone consistency, project photos, review response cadence, and landing URL. |
| P2 | Project structured data is only generic WebPage. | After SSG, add valid visual/project or VideoObject schema only where all required visible facts (thumbnail, upload date, duration, description) are available. |
| P2 | No `llms.txt`. | Do not treat it as a ranking requirement. Maintain clean crawl access, textual evidence, canonical pages, accurate schema, citations, and freshness first. Add an experimental file only if there is an owned maintenance process. |

Current guidance does not provide a special submission API or secret schema for Google AI features; normal crawl/index eligibility and people-first content remain the foundation. OpenAI documents OAI-SearchBot separately from GPTBot, and Perplexity publishes its crawler identifiers. Bing recommends IndexNow for timely update notification.

Official references:

- Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google AI search features: https://developers.google.com/search/docs/appearance/ai-features
- Google Search Console: https://developers.google.com/search/docs/monitor-debug/search-console-start
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Perplexity crawlers: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Bing URL submission/IndexNow: https://www.bing.com/webmasters/help/URL-Submission-62f2860b
- IndexNow protocol: https://www.indexnow.org/documentation

## CRM and Baileys audit

The local CRM now registers `POST /api/public/website-leads` before global authentication. It creates one audit/outbox row per accepted request, normalizes and deduplicates contacts in a transaction, re-surfaces repeat enquiries without restarting the bot, and hands only genuinely new consented website leads to the existing automation/Baileys entry point. Startup recovery now also recognises website leads with recorded WhatsApp consent and no inbound/sent message.

The website selects this transport only when both `VITE_CRM_LEAD_ENDPOINT` and `VITE_TURNSTILE_SITE_KEY` exist; otherwise it retains EmailJS. A stable idempotency key is reused for an unchanged retry, and an ambiguous CRM failure never falls through to EmailJS, preventing duplicate alerts. No CRM secret is sent to the browser.

CRM evidence: 112/112 tests pass, `npx tsc --noEmit` passes, and the server bundle builds after safe dependency lockfile updates. Production audit findings fell from 30 to 25 without a major upgrade. These are deterministic local checks; the migration was not run, Turnstile was not verified against production, and no CRM lead or WhatsApp message was created. Baileys is an unofficial WhatsApp Web integration, so account/terms/reliability risk remains. Its provider has no true external idempotency key, so the design is idempotent at intake and guarded at bot recovery, not mathematically exactly-once after every possible crash boundary. See the [implemented contract and deployment checklist](../../../integrations/crm-website-lead-contract.md).

## Release gate

Do not call the work production-complete until all of the following are true:

- OpenRouter key rotated and usage reviewed.
- Current frontend deployed to a preview and tested on real mobile/desktop networks.
- Every exact slashless sitemap URL returns HTTP 200 and its route-correct canonical in the raw deployed HTML.
- Report-Only CSP violations reviewed.
- CRM migration/config deployed with the public intake initially disabled, then enabled after non-sending checks.
- One explicitly approved controlled lead proves CRM capture and a single Baileys greeting in the tested flow.
- Search Console/Bing ownership verified; sitemap submitted after deployment.
- Monitoring and analytics contain no PII and establish funnel/error baselines.
