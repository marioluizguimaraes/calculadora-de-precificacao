/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_IBGE_API_URL: string;
  readonly VITE_MUNICIPALITIES_COORDS_URL: string;
  readonly VITE_ROUTING_API_URL: string;
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_STORAGE_KEY: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
