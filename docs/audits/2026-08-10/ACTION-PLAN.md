# DezignPool website action plan

## Release 1 — current frontend hardening

Owner: website/deployment
Target: first controlled preview

- Review the current diff and visual evidence.
- Fable final approval was explicitly waived by the user after its usage limit was exhausted; Codex verification is the active release evidence.
- Rotate the exposed OpenRouter key before deployment.
- Deploy to a preview URL; verify form placement, reminder, validation, mobile hero, calculators/PDF, route metadata, robots/sitemap, cache rules, and security headers.
- Fetch every exact slashless sitemap URL from the preview; require HTTP 200 without redirect and the matching canonical in the raw response.
- Review CSP Report-Only violations and correct missing origins.
- Review the published privacy copy with the business owner/legal adviser and insert any required retention period or entity details.
- Deploy production with rollback available.

Success: no console errors; no secret markers in built assets; form works without real production submission during smoke test; representative routes return correct metadata and headers.

## Release 2 — deploy the implemented CRM and Baileys connection

Owner: CRM backend + website
Dependency: controlled CRM deployment access, Turnstile keys, and an approved test number

- Apply `migrations/0012_add_website_lead_intakes.sql` to the controlled CRM database.
- Configure exact website/preview origins, a dedicated enabled CRM service user, a separate 32+ character HMAC secret, and Turnstile secret/hostnames while keeping intake disabled.
- Configure `VITE_CRM_LEAD_ENDPOINT` and `VITE_TURNSTILE_SITE_KEY` on the website preview, then deploy both sides.
- Verify CORS/preflight, bad origin, invalid Turnstile, replay, changed-payload conflict, reinquiry, and CRM audit state without enabling real outbound WhatsApp.
- Enable intake and retain EmailJS only as the unconfigured-deployment fallback; never fail over after an ambiguous CRM request.
- With explicit approval, submit one controlled test lead/number and confirm one CRM record, one activity, one bot enqueue, and no duplicate message.
- Remove EmailJS only after a monitored success window.

Success: idempotent lead intake, one greeting in the controlled flow, auditable consent, no browser secret, and a documented Baileys crash-boundary limitation.

## Release 3 — search delivery

Owner: website + marketing

- Route metadata prerender is implemented for all 13 sitemap URLs, including the journal and first article; verify the configured Render rewrites against raw preview responses after deployment.
- The blog routes now include meaningful raw H1/copy/internal links. Extend the same treatment to the remaining thin non-blog route documents where useful.
- Activate the daily 09:00 IST GitHub issue only after the workflow reaches the default branch, and retain the named editorial approval gate.
- Submit the deployed sitemap to Google Search Console and Bing Webmaster Tools.
- Add IndexNow to the release/content pipeline.
- Inspect homepage, services, projects, calculators, and one project URL.
- Audit Google Business Profile and NAP consistency.
- Build an evidence-based content calendar around high-intent Bangalore services, cost/process questions, and real project case studies.

Success: canonical routes are crawlable without JS; index coverage is monitored; no duplicate canonical family; published content has named expertise/evidence and internal links.

## Release 4 — performance and measurement

Owner: website

- Inventory and remove only confirmed orphan deploy media.
- Transcode oversized videos and validate mobile delivery/range requests.
- Defer calculator PDF/export libraries until the user requests an export.
- Split the 3D route bundle and self-host font subsets.
- Add privacy-safe funnel analytics and error monitoring.
- Establish real-user LCP, INP, CLS, conversion, and submission-error baselines.

Success: deploy artefact under 200 MB; testimonial video under 12 MB each; no artificial load delay; field Core Web Vitals and funnel metrics available.

## Controlled debt

- React Router 7.18+ migration for the two remaining moderate advisories.
- Tested Expo 54 to Expo 57 migration, or a separate server-only dependency manifest, for the CRM's remaining Expo/Metro advisories. Never use `npm audit fix --force` without the mobile upgrade plan.
- Remove/archive inactive ProjectManagement, stale Express server, unused discovery contact path, and legacy media after dependency/route confirmation.
- Move CSP from Report-Only to enforced after a clean observation period.
- Add integration tests for metadata, form/reminder, and PDF export.
