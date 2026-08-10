import { crmLeadEnv } from '../config/environment';

export const WEBSITE_FORM_VERSION = '2026-08-10';

export interface CrmWebsiteLeadPayload {
  name: string;
  phone: string;
  email: string;
  enquiry: {
    service: 'interiors' | 'construction';
    homeType: string;
    budgetBand: string;
    timeline: string;
    plotLocation: string;
    priority: string;
    styleResult: string;
    notes: string;
  };
  attribution: {
    source: 'website';
    pageUrl: string;
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    utmTerm: string;
    fbclid: string;
    gclid: string;
  };
  consent: {
    phoneAndWhatsApp: true;
    capturedAt: string;
    copyVersion: 'phone-whatsapp-v1';
  };
  antiAbuse: {
    turnstileToken: string;
    honeypot: string;
    renderedAt: string;
  };
}

type AcceptedResponse = {
  status: 'accepted';
  requestId: string;
};

export class CrmLeadSubmissionError extends Error {
  constructor(readonly status: number | null) {
    super('The CRM could not confirm this enquiry.');
  }
}

export function createIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function submitCrmWebsiteLead(
  payload: CrmWebsiteLeadPayload,
  idempotencyKey: string,
): Promise<AcceptedResponse> {
  if (!crmLeadEnv.configured) throw new CrmLeadSubmissionError(null);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(crmLeadEnv.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'X-Website-Form-Version': WEBSITE_FORM_VERSION,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    if (!response.ok) throw new CrmLeadSubmissionError(response.status);
    const body = await response.json() as Partial<AcceptedResponse>;
    if (body.status !== 'accepted' || typeof body.requestId !== 'string') {
      throw new CrmLeadSubmissionError(response.status);
    }
    return body as AcceptedResponse;
  } catch (error) {
    if (error instanceof CrmLeadSubmissionError) throw error;
    throw new CrmLeadSubmissionError(null);
  } finally {
    window.clearTimeout(timeout);
  }
}
