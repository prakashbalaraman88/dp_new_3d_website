import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { emailjsEnv } from '../config/environment';
import { sendEmail } from '../utils/emailjs';
import { buildReport, type Answers } from './report';
import { whatsappLink } from './showcaseData';

const APARTMENT_OPTIONS = [
  '2 BHK Apartment',
  '3 BHK Apartment',
  '3+ BHK Apartment',
  'Independent Villa · Bungalow',
  'Renovation · Other',
] as const;

const BUDGET_OPTIONS = ['5–10 Lakh', '10–15 Lakh', '15–20 Lakh', '20 Lakh+'] as const;

const TIMELINE_OPTIONS = [
  'Ready for Interiors',
  'Next 3 Months',
  'Next 6 Months',
  'More than 6 Months',
] as const;

const CONSTRUCTION_TIMELINE_OPTIONS = [
  'Right Away',
  '3 to 6 Months',
  'More than 6 Months',
] as const;

const PRIORITY_OPTIONS = [
  'Luxury Architect Building',
  'Affordable Luxury',
  'Budget Friendly',
] as const;

const FORM_TYPES = ['interiors', 'construction'] as const;
type FormType = (typeof FORM_TYPES)[number];

const leadSchema = z.object({
  formType: z.enum(FORM_TYPES),
  apartmentOrVilla: z.enum(APARTMENT_OPTIONS).optional(),
  budget: z.enum(BUDGET_OPTIONS).optional(),
  timeline: z.enum(TIMELINE_OPTIONS).optional(),
  constructionTimeline: z.enum(CONSTRUCTION_TIMELINE_OPTIONS).optional(),
  priority: z.enum(PRIORITY_OPTIONS).optional(),
  plotLocation: z.string().trim().max(160, 'Keep the plot location under 160 characters').optional(),
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  email: z.string().trim().email('Enter a valid email address'),
}).superRefine((data, context) => {
  if (data.formType === 'interiors') {
    if (!data.apartmentOrVilla) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['apartmentOrVilla'], message: 'Choose an apartment or villa type' });
    }
    if (!data.budget) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['budget'], message: 'Choose an approximate budget' });
    }
    if (!data.timeline) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['timeline'], message: 'Choose a preferred start time' });
    }
  } else {
    if (!data.constructionTimeline) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['constructionTimeline'], message: 'Choose when construction should start' });
    }
    if (!data.priority) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['priority'], message: 'Choose your top priority' });
    }
  }
});

type LeadFormData = z.infer<typeof leadSchema>;

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
  const whatsappHref = useMemo(() => whatsappLink(answers), [answers]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    shouldUnregister: true,
    defaultValues: { formType: 'interiors', name: '', phone: '', email: '' },
  });

  const formType = watch('formType');
  const apartmentOrVilla = watch('apartmentOrVilla');
  const budget = watch('budget');
  const timeline = watch('timeline');
  const constructionTimeline = watch('constructionTimeline');
  const priority = watch('priority');

  const chooseFormType = (nextType: FormType) => {
    setValue('formType', nextType, { shouldDirty: true });
    clearErrors();
    if (status === 'error') setStatus('idle');
  };

  const onSubmit = async (data: LeadFormData) => {
    setStatus('submitting');
    const quizSummary = Object.values(answers).some(Boolean)
      ? buildReport(answers).emailText
      : 'Style quiz: skipped';
    const projectLines = data.formType === 'interiors'
      ? [
          `Apartment or Villa Type: ${data.apartmentOrVilla}`,
          `Approximate budget: ${data.budget}`,
          `Interiors start: ${data.timeline}`,
        ]
      : [
          `Construction start: ${data.constructionTimeline}`,
          `Top priority: ${data.priority}`,
          `Plot location: ${data.plotLocation?.trim() || 'Not provided'}`,
        ];
    const message = [
      'Contact details:',
      `Full name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      '',
      `Form type: ${data.formType}`,
      ...projectLines,
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
          formType: data.formType,
          apartment_or_villa_type: data.formType === 'interiors' ? data.apartmentOrVilla || '' : '',
          budget: data.formType === 'interiors' ? data.budget || '' : '',
          timeline: data.formType === 'interiors' ? data.timeline || '' : '',
          construction_start: data.formType === 'construction' ? data.constructionTimeline || '' : '',
          top_priority: data.formType === 'construction' ? data.priority || '' : '',
          plot_location: data.formType === 'construction' ? data.plotLocation?.trim() || '' : '',
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
            Let&apos;s shape your <em>vision</em>
          </h2>
          <p>
            Share the essentials. Our team will call with a focused next step,
            already informed by your style choices.
          </p>
        </div>

        <div className="dp-lead__card">
          {status === 'success' ? (
            <div className="dp-lead__success" role="status">
              <CheckCircle2 size={42} strokeWidth={1.3} aria-hidden="true" />
              <p className="dp-site__eyebrow">Enquiry received</p>
              <h3>We&apos;ll be in touch shortly.</h3>
              <p>Your project details are with the DezignPool team.</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Continue on WhatsApp
                <span aria-hidden="true"><ArrowRight size={16} strokeWidth={1.5} /></span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <input type="hidden" {...register('formType')} />
              <div className="dp-lead__toggle" role="group" aria-label="Choose enquiry type">
                {FORM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={formType === type}
                    className={formType === type ? 'is-active' : undefined}
                    onClick={() => chooseFormType(type)}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              {formType === 'interiors' ? (
                <>
                  <input type="hidden" {...register('apartmentOrVilla')} />
                  <input type="hidden" {...register('budget')} />
                  <input type="hidden" {...register('timeline')} />
                  <ChoicePills
                    legend="Apartment or Villa Type"
                    options={APARTMENT_OPTIONS}
                    value={apartmentOrVilla}
                    error={errors.apartmentOrVilla?.message}
                    onChange={(option) => setValue('apartmentOrVilla', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    legend="What is your approximate interior design budget?"
                    options={BUDGET_OPTIONS}
                    value={budget}
                    error={errors.budget?.message}
                    onChange={(option) => setValue('budget', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    legend="When do you need interiors to start?"
                    options={TIMELINE_OPTIONS}
                    value={timeline}
                    error={errors.timeline?.message}
                    onChange={(option) => setValue('timeline', option, { shouldDirty: true, shouldValidate: true })}
                  />
                </>
              ) : (
                <>
                  <input type="hidden" {...register('constructionTimeline')} />
                  <input type="hidden" {...register('priority')} />
                  <ChoicePills
                    legend="When are you planning to start construction?"
                    options={CONSTRUCTION_TIMELINE_OPTIONS}
                    value={constructionTimeline}
                    error={errors.constructionTimeline?.message}
                    onChange={(option) => setValue('constructionTimeline', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    legend="What is your top priority?"
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    error={errors.priority?.message}
                    onChange={(option) => setValue('priority', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <label className="dp-lead__plot">
                    <span>Where is your plot?</span>
                    <input
                      type="text"
                      autoComplete="street-address"
                      placeholder="City, area or site location (optional)"
                      {...register('plotLocation')}
                    />
                    {errors.plotLocation && <small>{errors.plotLocation.message}</small>}
                  </label>
                </>
              )}

              <div className="dp-lead__fields">
                <label>
                  <span>Full name</span>
                  <input type="text" autoComplete="name" placeholder="Your full name" {...register('name')} />
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
                  <input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <small>{errors.email.message}</small>}
                </label>
              </div>

              <button type="submit" className="dp-lead__submit" disabled={status === 'submitting'}>
                <span>{status === 'submitting' ? 'Sending enquiry' : 'Request a consultation'}</span>
                <span aria-hidden="true">
                  {status === 'submitting'
                    ? <Loader2 className="dp-lead__spinner" size={17} strokeWidth={1.5} />
                    : <ArrowRight size={17} strokeWidth={1.5} />}
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
