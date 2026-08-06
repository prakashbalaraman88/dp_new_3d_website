import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import KineticText from '../components/KineticText';
import { buildReport, submitDiscovery, uploadFloorPlan, type Answers, type Contact } from './report';

export default function ContactSection({
  answers,
  floorPlan,
  notes,
  onExplore,
}: {
  answers: Answers;
  floorPlan: File | null;
  notes: string;
  onExplore?: () => void;
}) {
  const floorNote = floorPlan ? `${floorPlan.name} (${Math.round(floorPlan.size / 1024)} KB)` : 'not provided';
  const report = useMemo(() => buildReport(answers, { notes }, floorNote), [answers, notes, floorNote]);
  const [contact, setContact] = useState<Contact>({ name: '', email: '', phone: '', notes });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'sent'>('idle');
  const [err, setErr] = useState('');

  const valid = contact.name.trim().length > 1 && /\S+@\S+\.\S+/.test(contact.email) && contact.phone.trim().length >= 8;

  const submit = async () => {
    if (!valid) {
      setErr('Please add your name, a valid email, and a phone number.');
      return;
    }
    setStatus('sending');
    setErr('');
    try {
      const url = floorPlan ? await uploadFloorPlan(floorPlan) : null;
      await submitDiscovery(buildReport(answers, { ...contact }, floorNote), contact, url);
      setStatus('sent');
    } catch (e) {
      console.error('Discovery submit failed:', e);
      setStatus('error');
      setErr('Couldn’t send just now — please try again, or skip below.');
    }
  };

  const field =
    'rounded-lg bg-white/5 border border-white/15 px-3.5 py-3 text-base text-white placeholder-white/40 focus:border-secondary/60 outline-none transition-colors';

  if (status === 'sent') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl mx-auto text-center">
        <p className="text-secondary tracking-[0.3em] uppercase text-sm mb-4">Sent</p>
        <h2 className="font-serif font-light text-3xl sm:text-5xl mb-4 text-white">Your designer is on it.</h2>
        <p className="text-white/70">We’ve captured your style and your space. Expect a first concept and a conversation — soon.</p>
        {onExplore && (
          <button
            onClick={onExplore}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-3.5 font-medium text-main transition-transform active:scale-95 hover:scale-105"
          >
            Explore our work &rarr;
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="mb-2 text-center text-[11px] uppercase tracking-[0.25em] text-secondary sm:text-xs">Your style profile</p>
      <h2 className="mb-2 text-center font-serif text-3xl font-light text-white sm:text-5xl md:text-6xl">
        <KineticText text={report.label} trigger="inView" stagger={0.05} />
      </h2>
      {report.tagline && <p className="mx-auto mb-5 max-w-2xl px-2 text-center text-sm leading-relaxed text-white/70 sm:text-base">{report.tagline}</p>}

      <div className="mb-4 flex items-center justify-center gap-2" aria-label={`${report.primaryStyle.label} palette`}>
        {report.primaryStyle.palette.map((color) => (
          <span
            key={color}
            title={color}
            className="h-7 w-12 rounded-full border border-white/15 shadow-sm sm:h-8 sm:w-16"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {report.primaryStyle.montage.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 sm:gap-2 sm:p-2">
          {report.primaryStyle.montage.slice(0, 6).map((image, imageIndex) => (
            <div key={`${image}-${imageIndex}`} className="aspect-[4/3] overflow-hidden rounded-lg bg-white/5 sm:aspect-[3/2]">
              <img
                src={image}
                alt={`${report.primaryStyle.label} interior ${imageIndex + 1}`}
                loading={imageIndex < 3 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-accent">Secondary signal</p>
          <p className="font-serif text-xl text-white">{report.secondaryStyle.label}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{report.secondaryStyle.essence}</p>
          <div className="mt-3 flex gap-1.5" aria-label={`${report.secondaryStyle.label} palette`}>
            {report.secondaryStyle.palette.slice(0, 5).map((color) => (
              <span key={color} title={color} className="h-4 flex-1 rounded-full border border-white/10" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-secondary/15 bg-secondary/[0.035] p-4">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-secondary">Your material language</p>
          <p className="text-xs leading-relaxed text-white/60 sm:text-sm">
            {report.materials.length > 0
              ? `Your picks repeatedly returned to ${report.materials.slice(0, 4).join(', ')}.`
              : 'Your designer will refine the material story with you.'}
            {report.motifs.length > 0 ? ` Look for ${report.motifs.slice(0, 3).join(', ')} in the concept.` : ''}
          </p>
        </div>
      </div>

      {report.details.length > 0 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {report.details.map((d) => (
            <span key={d.label} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-white/75">
              <span className="text-white/40">{d.label}:</span> {d.value}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-secondary/20 bg-secondary/[0.04] p-5 sm:p-6">
        <p className="text-white/80 mb-4 text-sm">Leave your details and your designer will reach out with a first concept.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Name" autoComplete="name" className={field} />
          <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email" type="email" inputMode="email" autoComplete="email" className={field} />
          <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Phone" type="tel" inputMode="tel" autoComplete="tel" className={field} />
        </div>
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        <button
          onClick={submit}
          disabled={status === 'sending'}
          className="mt-5 w-full px-8 py-4 rounded-full bg-secondary text-main font-medium active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending to your designer…' : 'Send to my designer'}
        </button>
        {onExplore && (
          <button
            onClick={onExplore}
            className="mt-4 w-full text-center text-xs tracking-wide text-white/45 transition-colors hover:text-white/80"
          >
            Skip for now — explore our work &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
