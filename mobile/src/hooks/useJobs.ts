import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { jobsRepo } from '../data/mockRepos';

export function useJobs(query: string) {
  return useInfiniteQuery({
    queryKey: ['jobs', query],
    queryFn: ({ pageParam }) => jobsRepo.list({ query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useJob(id: string) {
  return useQuery({ queryKey: ['job', id], queryFn: () => jobsRepo.get(id) });
}
