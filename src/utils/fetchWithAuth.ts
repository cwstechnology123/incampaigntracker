import { Session } from '@supabase/supabase-js';

function isTokenExpired(exp: number | null | undefined): boolean {
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp < now;
}

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  session?: Session | null // <- accept session here
) => {
  if (!session || isTokenExpired(session.expires_at)) {
    throw new Error('Session expired or missing. Please log in again.');
  }

  const token = session.access_token;
  if (!token) throw new Error('Access token missing from session');

  return fetch(url, {
    ...options,
    method: options.method || 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const fetchWithAuthJson = async <T = any>(
  url: string,
  options: RequestInit = {},
  session?: Session | null
): Promise<T> => {
  const baseUrl = import.meta.env.DEV
    ? 'http://localhost:5001'
    : import.meta.env.VITE_API_URL;

  const res = await fetchWithAuth(`${baseUrl}${url}`, options, session);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText || 'API error');
  }

  return res.json();
};