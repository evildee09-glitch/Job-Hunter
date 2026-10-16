import { useQuery } from '@tanstack/react-query';
import { apiFetch, getBackend, type ApplicationRec } from '../data/api';

export function useApplications() {
  return useQuery({ queryKey: ['applications'], queryFn: () => apiFetch<ApplicationRec[]>('/applications'), enabled: !!getBackend(), retry: false });
}
