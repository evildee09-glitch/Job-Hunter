import { useQuery } from '@tanstack/react-query';
import { apiFetch, getBackend, type ProfileFull } from '../data/api';
import { matchJob } from '../domain/matching';
import type { Job } from '../domain/types';

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: () => apiFetch<ProfileFull>('/profile'), enabled: !!getBackend(), retry: false });
}

/** Matching uses ONLY verified skills and verified job titles. */
export function useMatcher() {
  const { data } = useProfile();
  const skills = data?.skills.filter((s) => s.verification === 'verified').map((s) => String(s.name)) ?? [];
  const titles = data?.employment.filter((e) => e.verification === 'verified').map((e) => String(e.title)).filter(Boolean) ?? [];
  return { ready: skills.length > 0, hasBackend: !!getBackend(), match: (job: Job) => matchJob(job, skills, titles) };
}
