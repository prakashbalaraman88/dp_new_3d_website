import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const outputArg = args.indexOf('--output');
const dateArg = args.indexOf('--date');
const outputPath = outputArg >= 0 && args[outputArg + 1]
  ? path.resolve(projectRoot, args[outputArg + 1])
  : path.join(projectRoot, 'tmp/blog-daily-brief.md');

const todayInIndia = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const requestedDate = dateArg >= 0 ? args[dateArg + 1] : undefined;
const isCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
};

if (requestedDate !== undefined && !isCalendarDate(requestedDate)) {
  throw new Error('--date must be a real calendar date in YYYY-MM-DD format.');
}

const indiaDate = requestedDate ?? todayInIndia;

const topics = [
  ['West-facing apartments in Bangalore', 'How to control glare and heat without turning the living room dark', 'Whitefield, Sarjapur Road and Hebbal high-rises'],
  ['Bangalore monsoon material guide', 'Where moisture failures actually begin in kitchens, wardrobes and entries', 'Apartments across East and South Bangalore'],
  ['A better 2BHK storage plan', 'Storage density, airflow and maintenance access in compact homes', 'Electronic City and HSR Layout'],
  ['Natural light in Bangalore apartments', 'Room-by-room daylight planning without screen glare or overheated corners', 'Indiranagar and Koramangala'],
  ['The climate-ready modular kitchen', 'Ventilation, wet-zone detailing, service access and durable finishes', 'Whitefield and Sarjapur Road'],
  ['Designing for Bangalore hard water', 'What homeowners should plan around sinks, fixtures, utility zones and maintenance', 'Apartment communities across Bangalore'],
  ['A monsoon-ready entrance', 'The two-metre threshold that keeps rain, shoes and delivery clutter out of the living room', 'High-rise apartments citywide'],
  ['Balcony design after the first rain', 'Drainage, planters, outdoor finishes and furniture that can be maintained', 'Wind-exposed Bangalore towers'],
  ['Vastu and climate in the same plan', 'How to discuss cultural priorities alongside daylight, airflow and actual site constraints', 'Bangalore 2BHK and 3BHK homes'],
  ['Renovating a ten-year-old apartment', 'What to inspect before new joinery hides old leaks, wiring and wall damage', 'Established communities in JP Nagar and Yelahanka'],
  ['A child’s room that can grow', 'Adaptable storage, daylight, study ergonomics and low-maintenance finishes', 'Bangalore family apartments'],
  ['The quieter Bangalore home office', 'Glare, acoustics, background composition and airflow for hybrid work', 'Tech-corridor homes'],
  ['Wardrobes against external walls', 'How to assess damp risk, access and ventilation before full-height joinery', 'Ground and lower-floor apartments'],
  ['What premium plywood really means', 'A specification-led guide to grade, balancing, edges, hardware and execution', 'Bangalore interior quotations'],
  ['The case for fewer downlights', 'A layered lighting plan for mild evenings, work, rest and art', 'Contemporary Bangalore homes'],
  ['Courtyards for modern Bangalore homes', 'Light, air and privacy lessons for villas and deep apartment plans', 'Sarjapur Road and North Bangalore villas'],
  ['Designing around a Bangalore tree canopy', 'How views, shade and seasonal light should influence furniture and colour', 'Leafy neighbourhood homes'],
  ['The first interior site walk', 'What a designer should record before presenting a moodboard', 'A homeowner field guide'],
  ['A useful 3BHK handover checklist', 'Measure, photograph and test before the interior drawings are frozen', 'New Bangalore apartment handovers'],
  ['Kitchen chimney versus natural ventilation', 'A practical decision framework for cooking habits, layout and air quality', 'Bangalore family kitchens'],
  ['Stone and tile for Bangalore homes', 'Comfort, slip, staining, maintenance and where each finish belongs', 'Indoor and balcony applications'],
  ['A calmer pooja room', 'Light, ventilation, storage and ritual without over-decoration', 'Contemporary Bangalore apartments'],
  ['Pet-ready interiors for wet weather', 'Entries, fabrics, flooring and storage for Bangalore dog families', 'Apartment and villa homes'],
  ['The real cost of custom storage', 'How design detail, hardware and serviceability change the quote', 'Bangalore 2BHK and 3BHK budgets'],
  ['Small bathrooms after monsoon', 'Exhaust, drying, grout, storage and lighting in compact wet rooms', 'Bangalore apartments'],
  ['When an open kitchen should stay open', 'Air, cooking style, privacy and flexible separation', 'Modern Bangalore apartments'],
  ['Designing for grandparents', 'Lighting, circulation, seating and bathroom decisions that feel residential', 'Multi-generational Bangalore homes'],
  ['The annual home maintenance map', 'A room-by-room calendar for joinery, sealants, drains, fabrics and hardware', 'Bangalore climate cycle'],
];

const epoch = Date.UTC(2026, 7, 10);
const [currentYear, currentMonth, currentDay] = indiaDate.split('-').map(Number);
const current = Date.UTC(currentYear, currentMonth - 1, currentDay);
const dayIndex = Math.max(0, Math.floor((current - epoch) / 86_400_000));
const [topic, promise, localAngle] = topics[dayIndex % topics.length];

const brief = `# Daily blog commission — ${indiaDate}

## Editorial decision

**Working topic:** ${topic}
**Reader promise:** ${promise}
**Local lens:** ${localAngle}
**Target reader:** A Bangalore homeowner planning, renovating or maintaining a premium home.
**Search intent:** Practical research before hiring a designer or approving a specification.

## Non-negotiable research gate

- Start with at least three current sources; at least two must be primary sources such as IMD, BEE, BIS, BBMP/BWSSB, a builder handover manual, a manufacturer technical data sheet or a peer-reviewed paper.
- Record access dates and link every factual climate, code, health, product-performance or pricing claim.
- Add one first-party DezignPool signal: a named project detail, an original site observation, a measured drawing, a before/after decision or a designer note. If none is available, keep the article in draft.
- Do not invent search volume, client results, prices, quotes, credentials or reviews.
- Write for the homeowner first. A keyword is a retrieval cue, not a reason to repeat a phrase.

## Article shape

1. Answer the homeowner's question in the first 80 words.
2. Explain why the issue behaves differently in Bangalore.
3. Show the room-by-room or decision-by-decision response.
4. Include a compact checklist or comparison table.
5. Distinguish design guidance from work that needs a qualified site professional.
6. Link two relevant DezignPool projects and one service or calculator page.
7. Close with a useful consultation prompt, not a generic sales paragraph.

**Publication floor:** 1,500 useful words · 6+ sections · 5+ images · 3+ sources · visible author and method · unique 30–60 character SEO title · 120–160 character description.

## Higgsfield image commission

Create an editorial set, not five variations of one render. Save final owned/licensed files as WebP under \`public/images/blog/<slug>/\` with descriptive filenames and alt text. Use the connected Higgsfield image tool with GPT Image 2 for controlled general imagery or Soul Location for pure interior environments. Do not submit a generation until the article angle and references pass review.

**Shared visual language:** Premium Bangalore residence; contemporary Indian detailing; warm beige, putty, teak and muted stone; monsoon-soft daylight; credible apartment proportions; editorial architecture photography; no people unless the story requires them; no text, logos, watermarks or generic Western styling.

1. **Hero / 4:5:** One decisive room that communicates ${topic.toLowerCase()} through composition rather than labels.
2. **Wide context / 16:9:** A Bangalore apartment or villa condition showing the local constraint before intervention.
3. **Detail / 4:5:** A technically credible junction, material edge or service detail relevant to the article.
4. **Diagrammatic still / 3:2:** A restrained editorial comparison with objects or spaces, no embedded text.
5. **Human-scale close / 4:5:** A lived-in but uncluttered daily ritual that shows the benefit.

## Approval state

- [ ] Sources opened and claims checked
- [ ] DezignPool first-party evidence added
- [ ] Copy edited for specificity and repetition
- [ ] Images visually inspected and usage rights recorded
- [ ] Blog validator passes
- [ ] Mobile and desktop preview checked
- [ ] Approved for publication by a named reviewer

**Default:** Draft only. The daily reminder is allowed to commission work; it is not allowed to publish an unreviewed article.
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, brief, 'utf8');
console.log(`Daily blog brief: ${outputPath}`);
