import { clearAnalyticsConsent, getAnalyticsConsent } from '../utils/analytics';
import './Privacy.css';

export default function Privacy() {
  const reopenChoice = () => {
    clearAnalyticsConsent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="dp-privacy">
      <header>
        <p>Privacy &amp; data use</p>
        <h1>Clear choices.<br /><em>No hidden follow-up.</em></h1>
        <span>Last updated 10 August 2026</span>
      </header>

      <div className="dp-privacy__body">
        <section>
          <h2>What we collect</h2>
          <p>
            When you send an enquiry, DezignPool receives the contact and project details you enter,
            your style-quiz result, the page and campaign that brought you to us, and a record of your
            phone and WhatsApp consent. Cloudflare Turnstile also processes limited device and network
            information to protect the form from automated abuse.
          </p>
        </section>

        <section>
          <h2>Why we use it</h2>
          <p>
            We use enquiry information to respond, prepare for a consultation, manage the opportunity
            in the DezignPool CRM, and continue the project conversation by phone or WhatsApp. We use
            campaign information to understand which marketing brought a genuine enquiry.
          </p>
        </section>

        <section>
          <h2>Optional analytics</h2>
          <p>
            Meta Pixel remains off until you accept analytics. If accepted, it records page visits and
            conversion events for campaign measurement. Declining does not disable the style quiz,
            enquiry form, security verification, or direct contact options.
          </p>
          <button type="button" onClick={reopenChoice}>Review analytics choice</button>
          <small>Current choice: {getAnalyticsConsent() ?? 'not selected'}</small>
        </section>

        <section>
          <h2>Who processes it</h2>
          <p>
            Information may be processed by the services that run our website, CRM, spam protection,
            email fallback, analytics (only with consent), and WhatsApp communications. We do not put a
            CRM password or automation credential in the browser, and we do not sell enquiry details.
          </p>
        </section>

        <section>
          <h2>Retention and your choices</h2>
          <p>
            We retain records only for legitimate project, operational, and legal needs. You may ask us
            to correct or delete your contact information, withdraw future marketing follow-up, or ask
            what we hold about you. Some records may need to be retained where law or an active contract
            requires it.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Email <a href="mailto:info@dezignpool.com">info@dezignpool.com</a> or call{' '}
            <a href="tel:+917892434663">+91 78924 34663</a> for a privacy request.
          </p>
        </section>
      </div>
    </main>
  );
}
