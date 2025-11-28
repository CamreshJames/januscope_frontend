export function getEnvConfig(): {
  companyName: string;
  appName: string;
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'staging';
} {
  const companyName = import.meta.env.VITE_COMPANY_NAME;
  const appName = import.meta.env.VITE_APP_NAME;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const environment = import.meta.env.MODE;

  const validatedCompanyName =
    typeof companyName === 'string' && companyName.trim() ? companyName.trim() : 'Sky World Limited';

  const validatedAppName =
    typeof appName === 'string' && appName.trim() ? appName.trim() : 'Januscope';

  const validatedApiBaseUrl =
    typeof apiBaseUrl === 'string' && apiBaseUrl.trim() ? apiBaseUrl.trim() : 'http://localhost:9876';

  const validatedEnvironment =
    environment === 'development' || environment === 'production' || environment === 'staging'
      ? environment
      : 'development';

  return {
    companyName: validatedCompanyName,
    appName: validatedAppName,
    apiBaseUrl: validatedApiBaseUrl,
    environment: validatedEnvironment,
  };
}

export function isDevelopment(): boolean {
  return getEnvConfig().environment === 'development';
}

export function isProduction(): boolean {
  return getEnvConfig().environment === 'production';
}
