/**
 * Meta Pixel + campaign attribution.
 *
 * Paid traffic lands with utm_* on the URL. Those params survive exactly one
 * navigation, so they are captured on first load and kept in sessionStorage —
 * every later lead submission reads them back and reports which campaign paid
 * for it, both to the Pixel and into the enquiry email.
 */

// A Pixel ID is public, but tracking must still be an explicit deploy choice.
// No ID and no visitor consent means no Meta request, cookie, or event.
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() ?? '';
const UTM_STORAGE_KEY = 'dp_attribution';
export const ANALYTICS_CONSENT_KEY = 'dp_analytics_consent_v1';
export const ANALYTICS_CONSENT_EVENT = 'dp:analytics-consent-change';
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const hasWindow = () => typeof window !== 'undefined';

export type AnalyticsConsent = 'granted' | 'denied' | null;

export function getAnalyticsConsent(): AnalyticsConsent {
  if (!hasWindow()) return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, null>): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // The choice still applies to this page through the emitted event.
  }
  if (value === 'denied') {
    try {
      window.sessionStorage.removeItem(UTM_STORAGE_KEY);
      window.fbq?.('consent', 'revoke');
    } catch {
      // Storage and a previously loaded Pixel may both be unavailable.
    }
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: value }));
}

export function clearAnalyticsConsent(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  } catch {
    // The banner can still be reopened in this page.
  }
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: null }));
}

function attributionFromUrl(): Attribution {
  if (!hasWindow()) return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return UTM_KEYS.reduce<Attribution>((acc, key) => {
      const value = params.get(key);
      if (value) acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

/** Reads attribution from the URL, falling back to whatever an earlier page view stored. */
export function captureAttribution(): Attribution {
  if (!hasWindow()) return {};

  const stored = readStoredAttribution();

  const fromUrl = attributionFromUrl();

  // A fresh click always wins: the visitor may have arrived from a new campaign.
  const merged = Object.keys(fromUrl).length > 0 ? fromUrl : stored;

  if (Object.keys(fromUrl).length > 0 && getAnalyticsConsent() === 'granted') {
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      // Private browsing can refuse storage; in-memory attribution still works for this page.
    }
  }

  return merged;
}

function readStoredAttribution(): Attribution {
  if (!hasWindow()) return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

/** Attribution for the current session, for stamping onto an outgoing lead. */
export function getAttribution(): Attribution {
  const fromUrl = attributionFromUrl();
  return Object.keys(fromUrl).length > 0 ? fromUrl : readStoredAttribution();
}

/** Flattens attribution into the string fields an EmailJS template can render. */
export function attributionEmailFields(): Record<string, string> {
  const attribution = getAttribution();
  const hasAny = Object.keys(attribution).length > 0;

  return {
    utm_source: attribution.utm_source ?? '',
    utm_medium: attribution.utm_medium ?? '',
    utm_campaign: attribution.utm_campaign ?? '',
    utm_content: attribution.utm_content ?? '',
    utm_term: attribution.utm_term ?? '',
    fbclid: attribution.fbclid ?? '',
    gclid: attribution.gclid ?? '',
    lead_source: hasAny
      ? `${attribution.utm_source ?? 'unknown'} / ${attribution.utm_campaign ?? 'unknown'}`
      : 'Organic / Direct',
  };
}

/** Injects the Meta Pixel and fires PageView. Safe to call more than once. */
export function initPixel(): void {
  if (!hasWindow() || !PIXEL_ID || getAnalyticsConsent() !== 'granted') return;
  if (window.fbq) return;
  // Local dev shares the production pixel; firing from it would pollute real campaign data.
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return;

  const fbq: Fbq = function (...args: unknown[]) {
    // Before the remote script loads, calls are buffered and replayed by it.
    const self = window.fbq as Fbq & { callMethod?: (...a: unknown[]) => void };
    if (self.callMethod) self.callMethod.apply(self, args);
    else (self.queue = self.queue || []).push(args);
  };

  window.fbq = fbq;
  window._fbq = window._fbq || fbq;
  fbq.queue = [];
  fbq.loaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

function track(event: string, params?: Record<string, unknown>): void {
  if (!hasWindow() || !window.fbq) return;
  try {
    window.fbq('track', event, params);
  } catch (error) {
    // Analytics must never take the page down with it.
    console.warn(`Pixel event "${event}" failed.`, error);
  }
}

/** Fired on a successful enquiry submission, from any form on the site. */
export function trackLead(params?: Record<string, unknown>): void {
  track('Lead', { ...attributionEmailFields(), ...params });
}

/** Fired when a visitor finishes the style quiz — the site's mid-funnel signal. */
export function trackQuizComplete(params?: Record<string, unknown>): void {
  track('CompleteRegistration', {
    content_name: 'Discover My Style quiz',
    ...attributionEmailFields(),
    ...params,
  });
}
