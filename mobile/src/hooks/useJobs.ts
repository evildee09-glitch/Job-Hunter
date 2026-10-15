import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { jobsRepo } from '../data/jobsRepo';
import type { JobSource } from '../domain/types';

export function useJobs(query: string, source: JobSource, philippinesOnly: boolean) {
  return useInfiniteQuery({
    queryKey: ['jobs', source, philippinesOnly, query],
    queryFn: ({ pageParam }) => jobsRepo.list({ query, cursor: pageParam, source, philippinesOnly }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useJob(id: string) {
  return useQuery({ queryKey: ['job', id], queryFn: () => jobsRepo.get(id) });
}
