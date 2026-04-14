export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  MODE: import.meta.env.MODE as string,
  DEV: import.meta.env.DEV as boolean,
  PROD: import.meta.env.PROD as boolean,
} as const;
