/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MENU_BLOB_SAS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
