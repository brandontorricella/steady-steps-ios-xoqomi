import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steadysteps.app',
  appName: 'SteadySteps',
  webDir: 'dist',
  server: {
    // Enable hot-reload for development from Lovable sandbox
    url: 'https://cf8d011b-3f2d-49b9-8ab6-8efda11067b2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
