interface Environment {
  CLAUDE_API_KEY: string;
}

interface EmailjsEnvironment {
  PUBLIC_KEY: string;
  SERVICE_ID: string;
  TEMPLATE_ID: string;
}

function requiredValue(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      'Please check your .env file and ensure all required variables are set.',
    );
  }
  return value;
}

// Keep unrelated keys lazy: importing EmailJS config on the public homepage must
// not require the project-management Claude key to be present.
export const env: Environment = {
  get CLAUDE_API_KEY() {
    return requiredValue('VITE_CLAUDE_API_KEY');
  },
};

export const emailjsEnv: EmailjsEnvironment = {
  PUBLIC_KEY: requiredValue('VITE_EMAILJS_PUBLIC_KEY'),
  SERVICE_ID: requiredValue('VITE_EMAILJS_SERVICE_ID'),
  TEMPLATE_ID: requiredValue('VITE_EMAILJS_TEMPLATE_ID'),
};
