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
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-center text-secondary tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-2">Here’s what we learned about you</p>
      <h2 className="text-center font-serif font-light text-2xl sm:text-4xl md:text-5xl text-white mb-2">
        <KineticText text={report.label} trigger="inView" stagger={0.05} />
      </h2>
      {report.tagline && <p className="text-center text-white/70 text-sm sm:text-base mb-6 sm:mb-7 px-2">{report.tagline}</p>}

      {report.picks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {report.picks.map((p) => (
            <div key={p.room} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center sm:text-left">
              <p className="text-accent text-[10px] sm:text-[11px] tracking-[0.2em] uppercase mb-1">{p.room}</p>
              <p className="font-serif text-white text-lg">{p.philosophy}</p>
              <p className="text-white/55 text-xs mt-1">{p.title}</p>
            </div>
          ))}
        </div>
      )}

      {report.materials.length > 0 && (
        <p className="text-center text-white/55 text-xs sm:text-sm mb-6 max-w-md mx-auto">
          Based on your picks, your designer will lean into {report.materials.slice(0, 4).join(' · ')}.
        </p>
      )}

      {report.details.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-7 sm:mb-8">
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
