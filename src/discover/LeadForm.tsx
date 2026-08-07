import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { emailjsEnv } from '../config/environment';
import { sendEmail } from '../utils/emailjs';
import { buildReport, type Answer, type Answers } from './report';
import { whatsappLink } from './showcaseData';

const APARTMENT_OPTIONS = [
  '2 BHK Apartment',
  '3 BHK Apartment',
  '3+ BHK Apartment',
  'Independent Villa · Bungalow',
  'Renovation · Other',
] as const;

const BUDGET_OPTIONS = [
  '5–10 Lakh',
  '10–15 Lakh',
  '15–20 Lakh',
  '20 Lakh+',
] as const;

const TIMELINE_OPTIONS = [
  'Ready for Interiors',
  'Next 3 Months',
  'Next 6 Months',
  'More than 6 Months',
] as const;

type ApartmentOption = (typeof APARTMENT_OPTIONS)[number];
type BudgetOption = (typeof BUDGET_OPTIONS)[number];
type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

const leadSchema = z.object({
  apartmentOrVilla: z.enum(APARTMENT_OPTIONS, {
    required_error: 'Choose an apartment or villa type',
  }),
  budget: z.enum(BUDGET_OPTIONS, { required_error: 'Choose an approximate budget' }),
  timeline: z.enum(TIMELINE_OPTIONS, { required_error: 'Choose a preferred start time' }),
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  email: z.string().trim().email('Enter a valid email address'),
});

type LeadFormData = z.infer<typeof leadSchema>;

function stringAnswer(answer: Answer | undefined): string | undefined {
  return typeof answer === 'string' ? answer : undefined;
}

function apartmentPrefill(answers: Answers): ApartmentOption | undefined {
  const home = stringAnswer(answers.home);
  if (home === 'villa' || home === 'independent') return 'Independent Villa · Bungalow';
  if (home === 'builder') return 'Renovation · Other';

  const bhk = stringAnswer(answers.bhk);
  if (bhk === '2bhk') return '2 BHK Apartment';
  if (bhk === '3bhk') return '3 BHK Apartment';
  if (bhk === '4bhk') return '3+ BHK Apartment';
  if (bhk === '1bhk') return 'Renovation · Other';
  return undefined;
}

function budgetPrefill(answers: Answers): BudgetOption | undefined {
  const mapping: Record<string, BudgetOption> = {
    b1: '5–10 Lakh',
    b2: '10–15 Lakh',
    b3: '15–20 Lakh',
    b4: '20 Lakh+',
  };
  return mapping[stringAnswer(answers.budget) || ''];
}

function timelinePrefill(answers: Answers): TimelineOption | undefined {
  const mapping: Record<string, TimelineOption> = {
    t1: 'Ready for Interiors',
    t2: 'Next 3 Months',
    t3: 'Next 6 Months',
    t4: 'More than 6 Months',
  };
  return mapping[stringAnswer(answers.timeline) || ''];
}

function ChoicePills<T extends string>({
  legend,
  options,
  value,
  error,
  onChange,
}: {
  legend: string;
  options: readonly T[];
  value?: T;
  error?: string;
  onChange: (option: T) => void;
}) {
  return (
    <fieldset className="dp-lead__question">
      <legend>{legend}</legend>
      <div className="dp-lead__pills">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            className={value === option ? 'is-selected' : undefined}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="dp-lead__error">{error}</p>}
    </fieldset>
  );
}

export default function LeadForm({ answers }: { answers: Answers }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const defaults = useMemo(
    () => ({
      apartmentOrVilla: apartmentPrefill(answers),
      budget: budgetPrefill(answers),
      timeline: timelinePrefill(answers),
      name: '',
      phone: '',
      email: '',
    }),
    [answers],
  );
  const whatsappHref = useMemo(() => whatsappLink(answers), [answers]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({ resolver: zodResolver(leadSchema), defaultValues: defaults });

  const apartmentOrVilla = watch('apartmentOrVilla');
  const budget = watch('budget');
  const timeline = watch('timeline');

  const onSubmit = async (data: LeadFormData) => {
    setStatus('submitting');
    const quizSummary = Object.values(answers).some(Boolean)
      ? buildReport(answers).emailText
      : 'Style quiz: skipped';
    const message = [
      `Apartment or Villa Type: ${data.apartmentOrVilla}`,
      `Approximate budget: ${data.budget}`,
      `Interiors start: ${data.timeline}`,
      '',
      quizSummary,
    ].join('\n');

    try {
      await sendEmail({
        template_id: emailjsEnv.TEMPLATE_ID,
        service_id: emailjsEnv.SERVICE_ID,
        user_id: emailjsEnv.PUBLIC_KEY,
        template_params: {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          message,
          to_name: 'DezignPool Team',
          reply_to: data.email,
          form_type: 'Website Lead Form',
          apartment_or_villa_type: data.apartmentOrVilla,
          budget: data.budget,
          timeline: data.timeline,
        },
      });
      setStatus('success');
    } catch (error) {
      console.error('Lead form submission failed.', error);
      setStatus('error');
    }
  };

  return (
    <section id="lead-form" className="dp-lead" aria-labelledby="lead-form-title">
      <div className="dp-lead__glow" aria-hidden="true" />
      <div className="dp-lead__inner">
        <div className="dp-lead__intro">
          <p className="dp-site__eyebrow">Begin a conversation</p>
          <h2 id="lead-form-title">
            Let&apos;s shape your <em>home</em>
          </h2>
          <p>
            Share the essentials. Our design team will call with a focused next step,
            already informed by your style choices.
          </p>
        </div>

        <div className="dp-lead__card">
          {status === 'success' ? (
            <div className="dp-lead__success" role="status">
              <CheckCircle2 size={42} strokeWidth={1.3} aria-hidden="true" />
              <p className="dp-site__eyebrow">Enquiry received</p>
              <h3>We&apos;ll be in touch shortly.</h3>
              <p>Your project details are with the DezignPool design team.</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Continue on WhatsApp
                <span aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={1.5} />
                </span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <input type="hidden" {...register('apartmentOrVilla')} />
              <input type="hidden" {...register('budget')} />
              <input type="hidden" {...register('timeline')} />

              <ChoicePills
                legend="Apartment or Villa Type"
                options={APARTMENT_OPTIONS}
                value={apartmentOrVilla}
                error={errors.apartmentOrVilla?.message}
                onChange={(option) =>
                  setValue('apartmentOrVilla', option, { shouldDirty: true, shouldValidate: true })
                }
              />

              <ChoicePills
                legend="What is your approximate interior design budget?"
                options={BUDGET_OPTIONS}
                value={budget}
                error={errors.budget?.message}
                onChange={(option) =>
                  setValue('budget', option, { shouldDirty: true, shouldValidate: true })
                }
              />

              <ChoicePills
                legend="When do you need interiors to start?"
                options={TIMELINE_OPTIONS}
                value={timeline}
                error={errors.timeline?.message}
                onChange={(option) =>
                  setValue('timeline', option, { shouldDirty: true, shouldValidate: true })
                }
              />

              <div className="dp-lead__fields">
                <label>
                  <span>Full name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    {...register('name')}
                  />
                  {errors.name && <small>{errors.name.message}</small>}
                </label>

                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    {...register('phone')}
                  />
                  {errors.phone && <small>{errors.phone.message}</small>}
                </label>

                <label className="dp-lead__email">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register('email')}
                  />
                  {errors.email && <small>{errors.email.message}</small>}
                </label>
              </div>

              <button
                type="submit"
                className="dp-lead__submit"
                disabled={status === 'submitting'}
              >
                <span>{status === 'submitting' ? 'Sending enquiry' : 'Request a consultation'}</span>
                <span aria-hidden="true">
                  {status === 'submitting' ? (
                    <Loader2 className="dp-lead__spinner" size={17} strokeWidth={1.5} />
                  ) : (
                    <ArrowRight size={17} strokeWidth={1.5} />
                  )}
                </span>
              </button>

              {status === 'error' && (
                <p className="dp-lead__submit-error" role="alert">
                  We couldn&apos;t send that enquiry. Please try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
