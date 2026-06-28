interface Environment {
  CLAUDE_API_KEY: string;
}

function validateEnvironment(): Environment {
  const requiredVars = ['VITE_CLAUDE_API_KEY'];
  const missingVars = requiredVars.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return {
    CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY
  };
}

export const env = validateEnvironment();