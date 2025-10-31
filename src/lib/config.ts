interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
  };
  features: {
    chatbot: boolean;
    newsletter: boolean;
    volunteering: boolean;
    multiTenant: boolean;
  };
}

const validateEnvVar = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  supabase: {
    url: validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
    anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  },
  app: {
    name: 'Jamaica Hurricane Recovery Fund',
    version: '1.0.0',
    environment: (import.meta.env.MODE as Config['app']['environment']) || 'development',
  },
  features: {
    chatbot: true,
    newsletter: true,
    volunteering: true,
    multiTenant: true,
  },
};

export const isProduction = config.app.environment === 'production';
export const isDevelopment = config.app.environment === 'development';
