import {useQuery} from '@tanstack/react-query';
import {apiFetch} from '@/lib/api-client';
import type {ActivityWithActor} from '@prioritree/shared';

interface ActivitiesResponse {
  activities: ActivityWithActor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useActivities(
  workspaceId: string | null,
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'activities', page, limit],
    queryFn: () =>
      apiFetch<ActivitiesResponse>(
        `/workspaces/${workspaceId}/activities?page=${page}&limit=${limit}`,
      ),
    enabled: !!workspaceId,
  });
}
