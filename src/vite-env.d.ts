/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_MENU_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
