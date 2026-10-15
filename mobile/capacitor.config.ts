import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.aijobhunter',
  appName: 'AI Job Hunter',
  webDir: 'dist',
  // Routes fetch() through native HTTP on Android so third-party APIs are not blocked by webview CORS.
  plugins: { CapacitorHttp: { enabled: true } },
  // LAN development only: lets the app talk to your laptop backend over plain http://.
  // Remove (and use HTTPS) before any real deployment.
  server: { cleartext: true },
};

export default config;
