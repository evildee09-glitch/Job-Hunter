import { useSyncExternalStore } from 'react';
import type { Job } from '../domain/types';

export type FlagKind = 'saved' | 'shortlisted';
type Flags = Record<FlagKind, Job[]>;
const KEY = 'ajh.jobflags.v2'; // stores full job snapshots so saved jobs open offline

function load(): Flags {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (p) return { saved: Array.isArray(p.saved) ? p.saved : [], shortlisted: Array.isArray(p.shortlisted) ? p.shortlisted : [] };
  } catch { /* ignore */ }
  return { saved: [], shortlisted: [] };
}

let state: Flags = load();
const listeners = new Set<() => void>();

export const getFlags = () => state;
export const isFlagged = (f: Flags, kind: FlagKind, id: string) => f[kind].some((j) => j.id === id);

export function toggleFlag(kind: FlagKind, job: Job) {
  const has = isFlagged(state, kind, job.id);
  state = { ...state, [kind]: has ? state[kind].filter((j) => j.id !== job.id) : [...state[kind], job] };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota: in-memory only */ }
  listeners.forEach((l) => l());
}

export function useJobFlags(): Flags {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state
  );
}
