import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiFetch} from '@/lib/api-client';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '@prioritree/shared';

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'projects'],
    queryFn: () =>
      apiFetch<{projects: Project[]}>(
        `/workspaces/${workspaceId}/projects`,
      ).then(r => r.projects),
    enabled: !!workspaceId,
  });
}

export function useCreateProject(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiFetch<{project: Project}>(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify(input),
      }).then(r => r.project),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'projects']}),
  });
}

export function useUpdateProject(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({projectId, data}: {projectId: string; data: UpdateProjectInput}) =>
      apiFetch<{project: Project}>(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        {method: 'PATCH', body: JSON.stringify(data)},
      ).then(r => r.project),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'projects']}),
  });
}

export function useDeleteProject(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      apiFetch(`/workspaces/${workspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'projects']}),
  });
}
