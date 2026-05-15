/**
 * Development Welcome Message
 * Displays helpful information for developers during local development
 */

interface EnvironmentInfo {
  apiUrl: string;
  appName: string;
  nodeEnv: string;
  buildMode: string;
}

const getEnvironmentInfo = (): EnvironmentInfo => ({
  apiUrl: import.meta.env.VITE_API_URL || 'Not set',
  appName: import.meta.env.VITE_APP_NAME || 'Timely Mate',
  nodeEnv: import.meta.env.NODE_ENV || 'development',
  buildMode: import.meta.env.MODE || 'development',
});

export const showDevelopmentWelcome = (): void => {
  if (import.meta.env.PROD) return; // Only show in development

  const styles = {
    title: 'color: #2196F3; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);',
    subtitle: 'color: #4CAF50; font-size: 16px; font-weight: bold;',
    info: 'color: #333; font-size: 14px;',
    warning: 'color: #FF9800; font-size: 14px; font-weight: bold;',
    success: 'color: #4CAF50; font-size: 14px; font-weight: bold;',
    section: 'color: #673AB7; font-size: 16px; font-weight: bold; margin-top: 10px;'
  };

  const env = getEnvironmentInfo();

  console.log('%c🚀 Timely Mate - Development Mode', styles.title);
  console.log('%c───────────────────────────────────', styles.subtitle);
  
  console.log('%c📊 Environment Information:', styles.section);
  console.log('%c   API URL: ' + env.apiUrl, styles.info);
  console.log('%c   App Name: ' + env.appName, styles.info);
  console.log('%c   Node Env: ' + env.nodeEnv, styles.info);
  console.log('%c   Build Mode: ' + env.buildMode, styles.info);
  
  console.log('%c🔧 Development Features:', styles.section);
  console.log('%c   ✅ Hot Module Replacement', styles.success);
  console.log('%c   ✅ Source Maps', styles.success);
  console.log('%c   ✅ Development Logging', styles.success);
  console.log('%c   ✅ Redux DevTools', styles.success);
  
  console.log('%c📚 Useful Commands:', styles.section);
  console.log('%c   npm run dev     - Start development server', styles.info);
  console.log('%c   npm run build   - Build for production', styles.info);
  console.log('%c   npm run preview - Preview production build', styles.info);
  console.log('%c   npm run lint    - Run linting', styles.info);
  
  console.log('%c🎯 Getting Started:', styles.section);
  console.log('%c   1. Make sure your backend is running', styles.info);
  console.log('%c   2. Check the Network tab for API calls', styles.info);
  console.log('%c   3. Use React DevTools for debugging', styles.info);
  console.log('%c   4. Check Redux store in DevTools', styles.info);
  
  if (env.apiUrl === 'Not set' || env.apiUrl.includes('localhost')) {
    console.log('%c⚠️  API URL Notice:', styles.warning);
    console.log('%c   Make sure your backend server is running on ' + env.apiUrl, styles.warning);
  }
  
  console.log('%c───────────────────────────────────', styles.subtitle);
  console.log('%c🎉 Happy Coding!', styles.title);
};

// Auto-run in development
if (import.meta.env.DEV) {
  showDevelopmentWelcome();
} 