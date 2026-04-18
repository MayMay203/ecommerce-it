import type { AxiosError } from 'axios';

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axiosErr = err as AxiosError<{ error?: { message?: string | string[] } }>;
  const msg = axiosErr?.response?.data?.error?.message;
  if (!msg) return fallback;
  return Array.isArray(msg) ? msg.join(', ') : msg;
}
