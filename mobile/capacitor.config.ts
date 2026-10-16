import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.aijobhunter',
  appName: 'AI Job Hunter',
  webDir: 'dist',
  // Routes fetch() through native HTTP on Android so third-party APIs are not blocked by webview CORS.
  plugins: { CapacitorHttp: { enabled: true } },
};

export default config;
