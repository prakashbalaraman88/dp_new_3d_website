import { useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const REMINDER_SEEN_KEY = 'dezignpool:lead-reminder-seen:v4';

const rememberReminder = () => {
  try {
    window.sessionStorage.setItem(REMINDER_SEEN_KEY, 'true');
  } catch {
    // A private or full storage area should not prevent the reminder from working.
  }
};

const reminderWasSeen = () => {
  try {
    return window.sessionStorage.getItem(REMINDER_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

export default function LeadReminder({
  submitted,
  onGoToForm,
}: {
  submitted: boolean;
  onGoToForm: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const triggerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const triggeredRef = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (submitted || reminderWasSeen() || triggeredRef.current) return;

    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || triggeredRef.current) return;
      triggeredRef.current = true;
      rememberReminder();
      setOpen(true);
      observer.disconnect();
    }, { threshold: 0.5 });

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [submitted]);

  useEffect(() => {
    if (submitted) setOpen(false);
  }, [submitted]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const goToForm = () => {
    setOpen(false);
    onGoToForm();
  };

  return (
    <>
      <div ref={triggerRef} className="dp-lead-reminder-trigger" aria-hidden="true" />
      <AnimatePresence>
        {open && !submitted && (
          <motion.div
            className="dp-lead-reminder"
            role="presentation"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              ref={dialogRef}
              className="dp-lead-reminder__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-reminder-title"
              aria-describedby="lead-reminder-copy"
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.625, 0.05, 0, 1] }}
            >
              <button
                ref={closeRef}
                type="button"
                className="dp-lead-reminder__close"
                onClick={() => setOpen(false)}
                aria-label="Close enquiry reminder"
              >
                <X size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>

              <p className="dp-site__eyebrow">Your space, considered</p>
              <h2 id="lead-reminder-title">Ready for a focused next step?</h2>
              <p id="lead-reminder-copy">
                Share the essentials in about a minute. Our design team will review your brief before calling.
              </p>

              <div className="dp-lead-reminder__actions">
                <button type="button" className="dp-lead-reminder__primary" onClick={goToForm}>
                  Start my enquiry
                  <span aria-hidden="true"><ArrowRight size={17} strokeWidth={1.5} /></span>
                </button>
                <button type="button" className="dp-lead-reminder__later" onClick={() => setOpen(false)}>
                  Not now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
