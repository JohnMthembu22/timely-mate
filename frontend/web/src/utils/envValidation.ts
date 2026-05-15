/**
 * Environment Variable Validation
 * Validates required environment variables for different deployment environments
 */

interface EnvironmentConfig {
  apiUrl?: string;
  appName?: string;
  appUrl?: string;
  enableAnalytics?: boolean;
  enableErrorReporting?: boolean;
  enableNotifications?: boolean;
  enablePremiumFeatures?: boolean;
  enableRealTimeChat?: boolean;
  debugMode?: boolean;
  logLevel?: string;
}

interface EnvironmentInfo {
  environment: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
  hasAppSync: boolean;
  region?: string;
}

const validateEnvironmentVariables = (environment: 'development' | 'staging' | 'production'): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get environment variables
  const config: EnvironmentConfig = {
    apiUrl: import.meta.env.VITE_API_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appUrl: import.meta.env.VITE_APP_URL,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    enablePremiumFeatures: import.meta.env.VITE_ENABLE_PREMIUM_FEATURES === 'true',
    enableRealTimeChat: import.meta.env.VITE_ENABLE_REAL_TIME_CHAT === 'true',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL,
  };

  // Required variables for all environments
  if (!config.apiUrl) {
    errors.push('VITE_API_URL is required');
  }

  // Environment-specific validation
  switch (environment) {
    case 'production':
      if (!config.appUrl) {
        errors.push('VITE_APP_URL is required for production');
      }
      if (config.apiUrl?.includes('localhost')) {
        warnings.push('API URL points to localhost in production');
      }
      if (config.debugMode) {
        warnings.push('Debug mode is enabled in production');
      }
      break;

    case 'staging':
      if (!config.appUrl) {
        warnings.push('VITE_APP_URL should be set for staging');
      }
      break;

    case 'development':
      if (!config.debugMode) {
        warnings.push('Debug mode is disabled in development');
      }
      break;
  }

  // Feature validation
  if (config.enableRealTimeChat && !config.apiUrl) {
    warnings.push('Real-time chat is enabled but API URL is not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
};

export const getEnvironmentInfo = (): EnvironmentInfo => {
  const environment = (import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production';
  const validation = validateEnvironmentVariables(environment);
  
  return {
    environment,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    config: validation.config,
    hasAppSync: false, // Since we removed AWS AppSync
    region: undefined, // Since we removed AWS
  };
};

export const logEnvironmentStatus = (environment: 'development' | 'staging' | 'production'): void => {
  const validation = validateEnvironmentVariables(environment);
  
  console.group(`🔧 Environment Validation - ${environment.toUpperCase()}`);
  
  if (validation.isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error('❌ Environment validation failed');
    validation.errors.forEach(error => console.error(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  console.log('📋 Configuration:');
  Object.entries(validation.config).forEach(([key, value]) => {
    if (value !== undefined) {
      console.log(`   ${key}: ${value}`);
    }
  });
  
  console.groupEnd();
};

export default validateEnvironmentVariables; 