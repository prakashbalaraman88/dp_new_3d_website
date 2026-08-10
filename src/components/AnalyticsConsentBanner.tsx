import { useEffect, useState } from 'react';
import {
  ANALYTICS_CONSENT_EVENT,
  captureAttribution,
  getAnalyticsConsent,
  initPixel,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from '../utils/analytics';
import './AnalyticsConsentBanner.css';

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent>(() => getAnalyticsConsent());

  useEffect(() => {
    const onChange = (event: Event) => {
      setConsent((event as CustomEvent<AnalyticsConsent>).detail);
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onChange);
  }, []);

  if (consent !== null) return null;

  const choose = (value: 'granted' | 'denied') => {
    setAnalyticsConsent(value);
    setConsent(value);
    if (value === 'granted') {
      captureAttribution();
      initPixel();
    }
  };

  return (
    <aside className="dp-consent" aria-label="Analytics cookie choice">
      <div>
        <strong>Your privacy, your choice</strong>
        <p>
          We use optional Meta analytics to understand campaign performance. It stays off unless you accept.
          Essential form and security features still work. <a href="/privacy">Privacy notice</a>
        </p>
      </div>
      <div className="dp-consent__actions">
        <button type="button" onClick={() => choose('denied')}>Decline</button>
        <button type="button" className="dp-consent__accept" onClick={() => choose('granted')}>Accept analytics</button>
      </div>
    </aside>
  );
}
