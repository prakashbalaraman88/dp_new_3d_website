# The Bangalore Edit — operating system

## Recommendation

The journal is the right SEO move only when it publishes evidence-led Bangalore material that the main service pages cannot answer in depth. A daily commission is useful. A daily unreviewed AI publication is not: it creates the exact scaled, low-value pattern Google warns publishers to avoid.

For the first 90 days, commission one topic every day and publish **three to five excellent articles per week**. Move to daily publication only after the team can sustain the gates below without lowering originality.

## What is automated in this repository

- At 09:00 IST, GitHub Actions opens one deduplicated issue containing the day's Bangalore topic, research requirements, outline and Higgsfield image commission.
- Every content pull request runs the blog validator and the complete production build.
- Published JSON posts automatically become index/detail pages, route-specific raw HTML, `BlogPosting` schema, sitemap entries and RSS items.
- Render, Netlify and Vercel use a wildcard rewrite for future `/blog/<slug>` pages, so a new post does not require another hosting-rule edit.

The scheduled workflow becomes active only after this branch is committed to the repository's default branch and GitHub Actions is enabled.

## What is deliberately not automated

- The reminder does not browse, write or publish by itself.
- Higgsfield generation is not run inside GitHub Actions. The connected MCP session is interactive and workspace/credit state can change.
- A post cannot bypass source checking, first-party DezignPool evidence, image inspection or named editorial approval.
- The website is not deployed from this local worktree.

This boundary prevents a bad article or malformed generated image from reaching the public site unattended.

## Content states

- `draft`: research or copy incomplete; never visible.
- `approved`: editorially complete and ready for a controlled publication step; not visible.
- `published`: included in the site, sitemap, RSS and structured data if its date is not in the future.

Posts live in `src/content/blog/posts/`. Use one JSON file per post and keep every referenced image local under `public/images/blog/<slug>/` or in the owned DezignPool project archive.

## Required gates

1. At least 1,500 useful words for a researched feature; length is a coverage floor, not a ranking target.
2. At least three sources, with two primary sources.
3. A visible author and transparent creation method.
4. At least one first-party signal: project detail, site observation, measured drawing, original photograph or designer note.
5. At least five relevant images with local files, dimensions, descriptive alt text, captions and credits.
6. Two or more contextual internal links to projects plus a relevant service, calculator or enquiry path.
7. Desktop and mobile preview, then `npm run blog:validate` and `npm run build`.

## Higgsfield image workflow

1. Complete the article angle and research first.
2. Use the daily issue's five-image commission. Keep the set visually distinct: hero, context, technical detail, comparison and human-scale benefit.
3. Generate through the connected Higgsfield image tool only after confirming the selected workspace and model availability. Prefer GPT Image 2 for controlled editorial stills and Soul Location for pure interior environments.
4. Inspect every image for architectural errors, copied branding, malformed joinery, impossible lighting and a generic non-Bangalore look.
5. Convert the approved image to WebP, record its generation credit, and store it locally. Never hotlink an online image.

Online sourcing is acceptable only when the licence permits website use and the file, creator, source URL and required attribution are recorded. Owned DezignPool photography is the strongest default.

## Search distribution

- Submit `https://www.dezignpool.com/sitemap.xml` once in Google Search Console and Bing Webmaster Tools; the file then updates with every production build.
- Keep the sitemap line in `robots.txt` and expose `/feed.xml` for feed readers and discovery services.
- Do not use Google's Indexing API for blog posts; Google restricts it to qualifying job-posting and livestream pages.
- IndexNow can be added for Bing and participating engines after the production domain is verified and an IndexNow key is available.
- Track indexed pages, non-brand impressions, clicks into project/service pages, enquiry starts and qualified CRM leads. Do not judge the journal by raw pageviews alone.

## 90-day editorial pillars

1. Bangalore climate and maintenance.
2. Apartment planning by orientation, floor and life stage.
3. Material and execution intelligence.
4. Community handover and renovation field guides.
5. Vastu reconciled with light, air and circulation.
6. Transparent budgets and specification decisions.
7. Case notes from real DezignPool residences.

Refresh successful evergreen articles when the underlying guidance changes or when the studio can add better first-party evidence. Do not change dates merely to simulate freshness.
