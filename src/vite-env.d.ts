/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';

type ImportMetaEnv = {
  readonly VITE_MENU_BLOB_SAS_URL?: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
