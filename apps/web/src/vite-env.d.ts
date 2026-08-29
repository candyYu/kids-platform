/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_ID: string
  readonly VITE_KIDS_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
