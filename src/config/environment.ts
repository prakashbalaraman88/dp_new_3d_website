interface EmailjsEnvironment {
  PUBLIC_KEY: string;
  SERVICE_ID: string;
  TEMPLATE_ID: string;
}

interface CrmLeadEnvironment {
  ENDPOINT: string;
  TURNSTILE_SITE_KEY: string;
  configured: boolean;
}

function requiredValue(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      'Please check your .env file and ensure all required variables are set.',
    );
  }
  return value;
}

export const emailjsEnv: EmailjsEnvironment = {
  PUBLIC_KEY: requiredValue('VITE_EMAILJS_PUBLIC_KEY', import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
  SERVICE_ID: requiredValue('VITE_EMAILJS_SERVICE_ID', import.meta.env.VITE_EMAILJS_SERVICE_ID),
  TEMPLATE_ID: requiredValue('VITE_EMAILJS_TEMPLATE_ID', import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
};

const crmLeadEndpoint = (import.meta.env.VITE_CRM_LEAD_ENDPOINT ?? '').trim();
const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim();

export const crmLeadEnv: CrmLeadEnvironment = {
  ENDPOINT: crmLeadEndpoint,
  TURNSTILE_SITE_KEY: turnstileSiteKey,
  configured: Boolean(crmLeadEndpoint && turnstileSiteKey),
};
