import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;
const webDir = process.env.CAP_WEB_DIR || 'dist';

const config: CapacitorConfig = {
  appId: 'com.buildsync.app',
  appName: 'BuildSyncApp',
  webDir,
  bundledWebRuntime: false,
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
      }
    : undefined,
};

export default config;
