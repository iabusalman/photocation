/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APPLE_CLIENT_ID: string;
  readonly VITE_APPLE_REDIRECT_URI: string;
  readonly VITE_MOYASAR_PUBLISHABLE_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
    Moyasar?: any;
  }
}

export {};
