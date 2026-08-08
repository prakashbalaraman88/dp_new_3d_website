import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm, type FieldErrors } from 'react-hook-form';
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

const COUNTRY_CODES = [
  'IN', 'AE', 'AU', 'BH', 'BD', 'CA', 'FR', 'DE', 'IE', 'IT', 'KW', 'MY',
  'NP', 'NL', 'NZ', 'OM', 'QA', 'SA', 'SG', 'ZA', 'ES', 'LK', 'CH', 'GB', 'US',
] as const;
type CountryCode = (typeof COUNTRY_CODES)[number];

type CountryOption = {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
};

const COUNTRY_OPTIONS: readonly CountryOption[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

const DEFAULT_COUNTRY: CountryCode = 'IN';
const DRAFT_STORAGE_KEY = 'dezignpool:lead-form-draft:v1';
const CONTACT_STORAGE_KEY = 'dezignpool:remembered-contact:v1';

const getCountry = (code: CountryCode) => (
  COUNTRY_OPTIONS.find((country) => country.code === code) ?? COUNTRY_OPTIONS[0]
);

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const getNationalNumberLimit = (country: CountryOption) => (
  country.code === 'IN' ? 10 : 15 - digitsOnly(country.dialCode).length
);

const normaliseNationalNumber = (value: string, country: CountryOption) => {
  const dialDigits = digitsOnly(country.dialCode);
  const nationalLimit = getNationalNumberLimit(country);
  const prefixed = value.trim().startsWith('+') || value.trim().startsWith('00');
  let digits = digitsOnly(value);

  if (value.trim().startsWith('00')) digits = digits.slice(2);
  if ((prefixed || digits.length > nationalLimit) && digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  return digits.slice(0, nationalLimit);
};

const leadSchema = z.object({
  formType: z.enum(FORM_TYPES),
  apartmentOrVilla: z.enum(APARTMENT_OPTIONS).optional(),
  budget: z.enum(BUDGET_OPTIONS).optional(),
  timeline: z.enum(TIMELINE_OPTIONS).optional(),
  constructionTimeline: z.enum(CONSTRUCTION_TIMELINE_OPTIONS).optional(),
  priority: z.enum(PRIORITY_OPTIONS).optional(),
  plotLocation: z.string().trim().max(160, 'Keep the plot location under 160 characters').optional(),
  name: z.string().trim().min(2, 'Enter your full name'),
  countryCode: z.enum(COUNTRY_CODES),
  phone: z.string().trim(),
  email: z.string().trim().email('Enter a valid email address'),
}).superRefine((data, context) => {
  const phoneDigits = digitsOnly(data.phone);
  const country = getCountry(data.countryCode);

  if (data.countryCode === 'IN' && !/^[6-9]\d{9}$/.test(phoneDigits)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Enter a valid 10-digit Indian mobile number' });
  } else if (data.countryCode !== 'IN' && (phoneDigits.length < 6 || phoneDigits.length > getNationalNumberLimit(country))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: `Enter a valid number for ${country.name}` });
  }

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

const readStoredValues = (storage: 'sessionStorage' | 'localStorage', key: string): Partial<LeadFormData> => {
  if (typeof window === 'undefined') return {};

  try {
    const value = window[storage].getItem(key);
    return value ? JSON.parse(value) as Partial<LeadFormData> : {};
  } catch {
    return {};
  }
};

const getInitialValues = (): Partial<LeadFormData> => {
  const remembered = readStoredValues('localStorage', CONTACT_STORAGE_KEY);
  const draft = readStoredValues('sessionStorage', DRAFT_STORAGE_KEY);
  const combined = { ...remembered, ...draft };
  const countryCode = COUNTRY_CODES.includes(combined.countryCode as CountryCode)
    ? combined.countryCode as CountryCode
    : DEFAULT_COUNTRY;

  return {
    formType: FORM_TYPES.includes(combined.formType as FormType) ? combined.formType as FormType : 'interiors',
    name: typeof combined.name === 'string' ? combined.name : '',
    phone: typeof combined.phone === 'string' ? combined.phone : '',
    email: typeof combined.email === 'string' ? combined.email : '',
    countryCode,
    apartmentOrVilla: combined.apartmentOrVilla,
    budget: combined.budget,
    timeline: combined.timeline,
    constructionTimeline: combined.constructionTimeline,
    priority: combined.priority,
    plotLocation: typeof combined.plotLocation === 'string' ? combined.plotLocation : '',
  };
};

function ChoicePills<T extends string>({
  fieldName,
  legend,
  options,
  value,
  error,
  onChange,
}: {
  fieldName: keyof LeadFormData;
  legend: string;
  options: readonly T[];
  value?: T;
  error?: string;
  onChange: (option: T) => void;
}) {
  return (
    <fieldset className="dp-lead__question" data-lead-field={fieldName} aria-invalid={Boolean(error)}>
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
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [rememberDetails, setRememberDetails] = useState(() => (
    Object.keys(readStoredValues('localStorage', CONTACT_STORAGE_KEY)).length > 0
  ));
  const initialValues = useMemo(getInitialValues, []);
  const whatsappHref = useMemo(() => whatsappLink(answers), [answers]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, touchedFields },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    shouldUnregister: true,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialValues,
  });

  const formType = watch('formType');
  const apartmentOrVilla = watch('apartmentOrVilla');
  const budget = watch('budget');
  const timeline = watch('timeline');
  const constructionTimeline = watch('constructionTimeline');
  const priority = watch('priority');
  const countryCode = watch('countryCode') || DEFAULT_COUNTRY;
  const name = watch('name') || '';
  const phone = watch('phone') || '';
  const email = watch('email') || '';
  const selectedCountry = getCountry(countryCode);

  useEffect(() => {
    const subscription = watch((values) => {
      try {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      } catch {
        // The form still works when storage is disabled or full.
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!rememberDetails) return;

    try {
      window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify({
        name,
        phone,
        email,
        countryCode,
      }));
    } catch {
      // Native browser autofill remains available when storage is disabled.
    }
  }, [countryCode, email, name, phone, rememberDetails]);

  const chooseFormType = (nextType: FormType) => {
    setValue('formType', nextType, { shouldDirty: true });
    clearErrors();
    if (status === 'error') setStatus('idle');
  };

  const onInvalid = (formErrors: FieldErrors<LeadFormData>) => {
    const projectFields: Array<keyof LeadFormData> = formType === 'interiors'
      ? ['apartmentOrVilla', 'budget', 'timeline']
      : ['constructionTimeline', 'priority', 'plotLocation'];
    const firstInvalid = [...projectFields, 'name', 'phone', 'email']
      .find((field) => formErrors[field]);

    if (!firstInvalid) return;

    window.requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>(`[data-lead-field="${firstInvalid}"]`);
      if (!field) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      field.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      field.querySelector<HTMLElement>('input:not([type="hidden"]), select, button')?.focus({ preventScroll: true });
    });
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberDetails(checked);
    if (!checked) {
      try {
        window.localStorage.removeItem(CONTACT_STORAGE_KEY);
      } catch {
        // Ignore storage restrictions; the preference remains off in this tab.
      }
    }
  };

  const onSubmit = async (data: LeadFormData) => {
    setStatus('submitting');
    const phoneCountry = getCountry(data.countryCode);
    const nationalNumber = normaliseNationalNumber(data.phone, phoneCountry);
    const fullPhone = `${phoneCountry.dialCode} ${nationalNumber}`;
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
      `Phone: ${fullPhone}`,
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
          phone: fullPhone,
          phone_country: phoneCountry.name,
          phone_country_code: phoneCountry.dialCode,
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
      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Submission succeeded; an unavailable storage API needs no recovery.
      }
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
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              autoComplete="on"
              noValidate
            >
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
                    fieldName="apartmentOrVilla"
                    legend="Apartment or Villa Type"
                    options={APARTMENT_OPTIONS}
                    value={apartmentOrVilla}
                    error={errors.apartmentOrVilla?.message}
                    onChange={(option) => setValue('apartmentOrVilla', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    fieldName="budget"
                    legend="What is your approximate interior design budget?"
                    options={BUDGET_OPTIONS}
                    value={budget}
                    error={errors.budget?.message}
                    onChange={(option) => setValue('budget', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    fieldName="timeline"
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
                    fieldName="constructionTimeline"
                    legend="When are you planning to start construction?"
                    options={CONSTRUCTION_TIMELINE_OPTIONS}
                    value={constructionTimeline}
                    error={errors.constructionTimeline?.message}
                    onChange={(option) => setValue('constructionTimeline', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ChoicePills
                    fieldName="priority"
                    legend="What is your top priority?"
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    error={errors.priority?.message}
                    onChange={(option) => setValue('priority', option, { shouldDirty: true, shouldValidate: true })}
                  />
                  <label className="dp-lead__plot" data-lead-field="plotLocation" htmlFor="lead-plot-location">
                    <span>Where is your plot?</span>
                    <input
                      id="lead-plot-location"
                      type="text"
                      autoComplete="street-address"
                      enterKeyHint="next"
                      aria-invalid={Boolean(errors.plotLocation)}
                      aria-describedby={errors.plotLocation ? 'lead-plot-location-error' : undefined}
                      placeholder="City, area or site location (optional)"
                      {...register('plotLocation')}
                    />
                    {errors.plotLocation && <small id="lead-plot-location-error">{errors.plotLocation.message}</small>}
                  </label>
                </>
              )}

              <div className="dp-lead__fields">
                <label data-lead-field="name" htmlFor="lead-full-name">
                  <span>Full name</span>
                  <span className="dp-lead__input-shell">
                    <input
                      id="lead-full-name"
                      type="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'lead-full-name-error' : undefined}
                      placeholder="Your full name"
                      {...register('name')}
                    />
                    {touchedFields.name && !errors.name && name.trim().length >= 2 && (
                      <CheckCircle2 className="dp-lead__valid" size={17} strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </span>
                  {errors.name && <small id="lead-full-name-error">{errors.name.message}</small>}
                </label>

                <div className="dp-lead__phone-field" data-lead-field="phone">
                  <label htmlFor="lead-phone">Phone</label>
                  <div className="dp-lead__phone-control">
                    <select
                      aria-label="Country and calling code"
                      autoComplete="country"
                      {...register('countryCode', {
                        onChange: (event) => {
                          const nextCountry = getCountry(event.target.value as CountryCode);
                          setValue('phone', normaliseNationalNumber(phone, nextCountry), {
                            shouldDirty: true,
                            shouldValidate: Boolean(touchedFields.phone),
                          });
                        },
                      })}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.dialCode} · {country.name}
                        </option>
                      ))}
                    </select>
                    <span className="dp-lead__input-shell">
                      <input
                        id="lead-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        enterKeyHint="next"
                        maxLength={18}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'lead-phone-error' : undefined}
                        placeholder={countryCode === 'IN' ? '10-digit mobile number' : 'Mobile number'}
                        {...register('phone', {
                          onChange: (event) => {
                            const normalised = normaliseNationalNumber(event.target.value, selectedCountry);
                            if (event.target.value !== normalised) {
                              event.target.value = normalised;
                              setValue('phone', normalised, {
                                shouldDirty: true,
                                shouldValidate: Boolean(touchedFields.phone),
                              });
                            }
                          },
                        })}
                      />
                      {touchedFields.phone && !errors.phone && phone.length > 0 && (
                        <CheckCircle2 className="dp-lead__valid" size={17} strokeWidth={1.6} aria-hidden="true" />
                      )}
                    </span>
                  </div>
                  <small className="dp-lead__phone-hint">
                    {selectedCountry.name} {selectedCountry.dialCode} is selected
                  </small>
                  {errors.phone && <small id="lead-phone-error" className="dp-lead__field-error">{errors.phone.message}</small>}
                </div>

                <label className="dp-lead__email" data-lead-field="email" htmlFor="lead-email">
                  <span>Email</span>
                  <span className="dp-lead__input-shell">
                    <input
                      id="lead-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      enterKeyHint="done"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'lead-email-error' : undefined}
                      placeholder="you@example.com"
                      {...register('email')}
                    />
                    {touchedFields.email && !errors.email && email.length > 0 && (
                      <CheckCircle2 className="dp-lead__valid" size={17} strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </span>
                  {errors.email && <small id="lead-email-error">{errors.email.message}</small>}
                </label>
              </div>

              <label className="dp-lead__remember">
                <input
                  type="checkbox"
                  checked={rememberDetails}
                  onChange={(event) => handleRememberChange(event.target.checked)}
                />
                <span>
                  Remember my contact details on this device
                  <small>Stored only in this browser for your next enquiry.</small>
                </span>
              </label>

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
