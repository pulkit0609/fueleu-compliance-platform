// src/shared/config.ts

const metaEnv = (import.meta as any).env ?? {};

export const API_BASE_URL: string =
  (metaEnv.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";
