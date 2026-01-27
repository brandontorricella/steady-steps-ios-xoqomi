import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cf8d011b3f2d49b98ab68efda11067b2',
  appName: 'steadysteps',
  webDir: 'dist',
  server: {
    url: 'https://cf8d011b-3f2d-49b9-8ab6-8efda11067b2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    App: {
      // Deep link configuration for returning from Stripe
      // This allows steadysteps:// URLs to open the app
    }
  },
  ios: {
    // Enable associated domains for universal links
    // You'll need to configure this in Xcode as well
    scheme: 'steadysteps'
  },
  android: {
    // Android deep link scheme
    // This allows steadysteps:// URLs to open the app
  }
};

export default config;
