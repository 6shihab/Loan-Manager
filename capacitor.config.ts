import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.borrowmanager.app',
  appName: 'Borrow Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0a0a1a',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1024520202880-imueoaoe0qgrlcsllvr5sc7vvs35vlhl.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
