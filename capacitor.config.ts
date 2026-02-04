import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bat816.steady-steps',
  appName: 'SteadySteps',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
