# Website to DezignPool CRM lead-intake contract

Status: **implemented locally; deployment and controlled end-to-end proof pending**. The public route, audit table/migration, website transport, Turnstile widget, and Baileys eligibility safeguards now exist in code. This contract deliberately does not put a CRM credential in the browser.

## Endpoint

`POST /api/public/website-leads`

Required headers:

- `Content-Type: application/json`
- `Idempotency-Key: <UUID generated once per form submission attempt>`
- `X-Website-Form-Version: 2026-08-10`

The endpoint returns `202 Accepted` with a request identifier. It must not return an internal lead ID, assignment, bot state, or duplicate-match details to an unauthenticated caller.

```json
{
  "status": "accepted",
  "requestId": "public-safe-request-id"
}
```

## Strict request body

Unknown properties are rejected.

```json
{
  "name": "Client name",
  "phone": "+917892434663",
  "email": "client@example.com",
  "enquiry": {
    "service": "interiors",
    "homeType": "3 BHK Apartment",
    "budgetBand": "15–20 Lakh",
    "timeline": "Next 3 Months",
    "plotLocation": "",
    "priority": "",
    "styleResult": "Warm minimal",
    "notes": ""
  },
  "attribution": {
    "source": "website",
    "pageUrl": "https://www.dezignpool.com/",
    "referrer": "",
    "utmSource": "",
    "utmMedium": "",
    "utmCampaign": "",
    "utmContent": "",
    "utmTerm": "",
    "fbclid": "",
    "gclid": ""
  },
  "consent": {
    "phoneAndWhatsApp": true,
    "capturedAt": "2026-08-10T00:00:00.000Z",
    "copyVersion": "phone-whatsapp-v1"
  },
  "antiAbuse": {
    "turnstileToken": "server-verified-token",
    "honeypot": "",
    "renderedAt": "2026-08-10T00:00:00.000Z"
  }
}
```

The browser must never be allowed to choose a WhatsApp recipient, message/template, schedule, assigned CRM user, status, score, automation rule, or internal custom-field key.

## Server controls

1. Accept only `https://www.dezignpool.com` plus explicitly configured preview origins. CORS is not authentication; requests without a trusted origin still require all other controls.
2. Apply a dedicated public-intake rate limit before the general API limit: suggested starting point 5 attempts per IP per 15 minutes, 3 accepted enquiries per normalized phone per day, with monitoring and an operational override.
3. Verify Cloudflare Turnstile server-side, reject a populated honeypot, and reject implausibly fast submissions using `renderedAt`. Never trust a client-only CAPTCHA result.
4. Validate with a strict Zod schema, bounded string lengths, E.164 phone normalization, lowercase/trimmed email, allowed enums, and a maximum JSON body of 32 KB.
5. Persist the idempotency key and a canonical payload hash. Replaying the same key and body returns the same generic response; the same key with a different body is rejected.
6. Deduplicate by normalized phone first and email second. An existing contact becomes a reinquiry/activity update; it must not create a second lead or restart WhatsApp blindly.
7. Create or update the CRM lead inside one transaction with `source=website`, consent metadata, attribution, and an audit activity. Use a dedicated service identity for `createdBy` rather than impersonating a salesperson.
8. Persist post-accept dispatch state and run follow-up work only after the transaction commits. The current implementation marks `pending`, `dispatched`, or `failed`, calls the existing CRM automation/Baileys path, and relies on message-log/startup guards for unsent greetings. A fully durable general-purpose job worker remains a future hardening item.
9. Store an audit record containing request ID, outcome, normalized identity hash, consent version, and automation enqueue result. Do not log full form bodies, tokens, or raw phone/email values.
10. Keep outbound WhatsApp disabled/mocked in automated tests. Production verification requires explicit approval and a controlled test number; this audit did not send a message.

## CRM mapping

| Website value | CRM value |
|---|---|
| `name` | `leads.name` |
| normalized `phone` | `leads.phone` |
| normalized `email` | `leads.email` |
| constant `website` | `leads.source` |
| `enquiry.service` | `leads.projectType` |
| parsed budget lower/upper or `0` | `leads.budget` plus original band in `customFields` |
| `enquiry.plotLocation` | `leads.location` |
| style, timeline, home type, priority | allowlisted `customFields` |
| UTM/gclid | existing attribution fields/allowlisted `customFields` |
| consent object | immutable consent/audit metadata |

## Acceptance tests

- Valid request creates exactly one lead/activity and exactly one queued bot start.
- Replaying the same idempotency key creates nothing new and sends nothing new.
- Re-submitting the same phone with a new idempotency key records one reinquiry and does not double-send.
- Invalid Turnstile, honeypot, disallowed origin, oversized body, unknown field, invalid enum, malformed phone, or missing consent is rejected.
- Browser bundle contains no CRM secret or automation credential.
- A mocked Baileys adapter proves the expected payload without sending a real WhatsApp message.
- EmailJS remains the fallback until production CRM intake is deployed and monitored; remove it only after a controlled cutover.

## Implemented evidence

CRM repository:

- `migrations/0012_add_website_lead_intakes.sql` creates the idempotency/consent/dispatch audit table.
- `server/website-lead-intake.ts` registers the route before global authentication and enforces the public controls above.
- `server/website-lead-rules.ts` contains the strict schema and pure normalization/hash/mapping rules.
- Existing-contact submissions create a reinquiry activity and do not call `triggerBotForNewLead`.
- Startup greeting recovery now includes website leads only when `websiteContactConsent=true` and there is no inbound or sent outbound message.
- `npm test`: 112/112 pass; `npx tsc --noEmit`: pass; `npm run server:build`: pass.

Website repository:

- CRM transport activates only when both `VITE_CRM_LEAD_ENDPOINT` and `VITE_TURNSTILE_SITE_KEY` are present.
- An unchanged retry reuses its UUID; an ambiguous CRM error does not fall through to EmailJS.
- The browser sends no CRM secret and the form remains on EmailJS when the CRM transport is unconfigured.
- Production website build passes and generates 11 validated route documents.

Not yet proven: database migration on the deployed CRM, live Turnstile verification, production CORS/headers, a real CRM record, or a Baileys greeting. No test enquiry or WhatsApp message was sent.

## Deployment checklist

1. Apply migration `0012_add_website_lead_intakes.sql` in a controlled CRM environment.
2. Create/select a dedicated enabled CRM service user and set `WEBSITE_LEAD_SERVICE_USER_ID`.
3. Set a separate 32+ character `WEBSITE_LEAD_HASH_SECRET`, exact `WEBSITE_LEAD_ALLOWED_ORIGINS`, `TURNSTILE_SECRET_KEY`, and exact `WEBSITE_LEAD_TURNSTILE_HOSTNAMES`.
4. Keep `WEBSITE_LEAD_INTAKE_ENABLED=false` for the first server deploy and verify health/migration state.
5. Set the website endpoint/site key, deploy a preview, and test only rejection/replay controls without a real recipient.
6. Enable intake, then use one explicitly approved controlled number to prove one CRM lead/activity and one greeting.
7. Monitor `website_lead_intakes.automation_state`, CRM errors, Turnstile outcomes, and Baileys message logs during cutover.

Cloudflare Turnstile and Baileys do not provide one shared external idempotency primitive. The intake is transactional and idempotent, and the bot has delivery/startup guards, but no implementation should claim absolute exactly-once WhatsApp delivery across every process-crash boundary.
