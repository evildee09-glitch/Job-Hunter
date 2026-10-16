/** Backend client. Single-user bearer token. Stage 12 moves the token to secure native storage. */
export type Verification = 'verified' | 'unverified' | 'ai_suggested';
export type Item = { id: number; verification: Verification } & Record<string, string | number>;

export interface ProfileFull {
  id: number; name: string; email: string; phone: string; location: string; summary: string;
  verification: Verification; version: number;
  employment: Item[]; skills: Item[]; education: Item[]; certifications: Item[]; projects: Item[];
  documents: Array<{ id: number; filename: string; size: number; created_at: string }>;
}

export interface BackendConfig { url: string; token: string }
const KEY = 'ajh.backend.v1';

export function getBackend(): BackendConfig | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (p && typeof p.url === 'string' && typeof p.token === 'string') return p;
  } catch { /* ignore */ }
  return null;
}

export function saveBackend(c: BackendConfig) {
  localStorage.setItem(KEY, JSON.stringify({ url: c.url.trim().replace(/\/+$/, ''), token: c.token.trim() }));
}

async function request<T>(url: string, init: RequestInit, token?: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
    });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).detail; } catch { /* not json */ }
      throw new Error(typeof detail === 'string' && detail ? detail : `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Timed out after 60 s. A free Render service can take about a minute to wake up; try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = getBackend();
  if (!cfg) return Promise.reject(new Error('Backend not configured'));
  return request<T>(cfg.url + path, init, cfg.token);
}

export const jsonInit = (method: string, body: unknown): RequestInit => ({
  method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

/** Checks reachability first, then that the token is accepted. */
export async function testBackend(url: string, token: string): Promise<string> {
  const base = url.trim().replace(/\/+$/, '');
  await request<{ status: string }>(`${base}/health`, {});
  await request<ProfileFull>(`${base}/profile`, {}, token.trim());
  return 'Connected. Token accepted.';
}

export interface InterviewRec { id: number; application_id: number; at: string; kind: string; notes: string }
export interface ApplicationRec {
  id: number; source: string; job_ref: string; title: string; company: string; url: string; location: string;
  status: string; match_score: number | null; notes: string; applied_on: string; follow_up_on: string;
  created_at: string; interviews: InterviewRec[];
}
