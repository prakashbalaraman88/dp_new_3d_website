import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RotatingBrandMark from './RotatingBrandMark';
import './Footer.css';

const MASTER_EASE: [number, number, number, number] = [0.625, 0.05, 0, 1];

const footerLinks = [
  { index: '01', label: 'Projects', to: '/projects' },
  { index: '02', label: 'Services', to: '/services' },
  { index: '03', label: 'About', to: '/about' },
  { index: '04', label: 'Journal', to: '/blog' },
  { index: '05', label: 'Enquire', to: '/#contact' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/dezignpool', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/dezignpool', icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com/@dezignpool', icon: Youtube },
];

const whatsappHref = `https://wa.me/917892434663?text=${encodeURIComponent(
  "Hello DezignPool, I'd like to discuss a design project.",
)}`;

export default function Footer() {
  const reducedMotion = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="dp-footer">
      <div className="dp-footer__ambient" aria-hidden="true" />

      <div className="dp-footer__shell">
        <motion.section
          className="dp-footer__statement"
          aria-labelledby="footer-statement-title"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: MASTER_EASE }}
        >
          <div className="dp-footer__statement-copy">
            <p>Architecture · Interiors · Bangalore</p>
            <h2 id="footer-statement-title">
              Let&rsquo;s make room for<br /> something <em>unforgettable.</em>
            </h2>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="dp-footer__conversation"
            aria-label="Start a conversation with DezignPool on WhatsApp"
          >
            <span>
              <MessageCircle aria-hidden="true" />
              Start a conversation
            </span>
            <i aria-hidden="true"><ArrowUpRight /></i>
          </a>

          <span className="dp-footer__statement-number" aria-hidden="true">DP</span>
          <span className="dp-footer__statement-orbit" aria-hidden="true" />
        </motion.section>

        <div className="dp-footer__directory">
          <motion.div
            className="dp-footer__brand"
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: MASTER_EASE }}
          >
            <RotatingBrandMark className="dp-footer__mark" alt="DezignPool" />
            <div>
              <p>Designing homes with clarity,<br />character and quiet confidence.</p>
              <span>Est. Bangalore</span>
            </div>
          </motion.div>

          <motion.nav
            className="dp-footer__nav"
            aria-label="Footer navigation"
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.08, ease: MASTER_EASE }}
          >
            <p className="dp-footer__label">Explore</p>
            <div>
              {footerLinks.map((link) => (
                <Link key={link.label} to={link.to}>
                  <span>{link.index}</span>
                  <strong>{link.label}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </motion.nav>

          <motion.address
            className="dp-footer__contact"
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.16, ease: MASTER_EASE }}
          >
            <p className="dp-footer__label">Come find us</p>
            <a
              href="https://maps.google.com/?q=Goodu+No+1+Greenvalley+Cleartitle+Mylasandra+Bangalore+560100"
              target="_blank"
              rel="noopener noreferrer"
              className="dp-footer__contact-row dp-footer__contact-row--address"
            >
              <span><MapPin aria-hidden="true" /></span>
              <strong>Goodu. No 1, Greenvalley Cleartitle,<br /> Mylasandra, Bangalore 560100</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="tel:+917892434663" className="dp-footer__contact-row">
              <span><Phone aria-hidden="true" /></span>
              <strong>+91 78924 34663</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="mailto:info@dezignpool.com" className="dp-footer__contact-row">
              <span><Mail aria-hidden="true" /></span>
              <strong>info@dezignpool.com</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </motion.address>
        </div>

        <div className="dp-footer__wordmark" aria-hidden="true">DEZIGNPOOL</div>

        <div className="dp-footer__base">
          <div className="dp-footer__socials" aria-label="DezignPool social links">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </div>
          <p>&copy; {year} DezignPool <span>·</span> <Link to="/privacy">Privacy</Link></p>
          <a href="#" className="dp-footer__top">Back to top <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
