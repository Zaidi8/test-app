import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiFetch} from '@/lib/api-client';
import type {
  Task,
  CommentWithAuthor,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCommentInput,
} from '@prioritree/shared';

// ─── Tasks ──────────────────────────────────────────────

export function useTasks(workspaceId: string | null, projectId: string | null) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'projects', projectId, 'tasks'],
    queryFn: () =>
      apiFetch<{tasks: Task[]}>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      ).then(r => r.tasks),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateTask(workspaceId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiFetch<{task: Task}>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        {method: 'POST', body: JSON.stringify(input)},
      ).then(r => r.task),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'tasks'],
      }),
  });
}

export function useUpdateTask(workspaceId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({taskId, data}: {taskId: string; data: UpdateTaskInput}) =>
      apiFetch<{task: Task}>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        {method: 'PATCH', body: JSON.stringify(data)},
      ).then(r => r.task),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'tasks'],
      }),
  });
}

export function useUpdateTaskStatus(workspaceId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({taskId, status}: {taskId: string; status: string}) =>
      apiFetch<{task: Task}>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/status`,
        {method: 'PATCH', body: JSON.stringify({status})},
      ).then(r => r.task),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'tasks'],
      }),
  });
}

export function useDeleteTask(workspaceId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      apiFetch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        {method: 'DELETE'},
      ),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'projects', projectId, 'tasks'],
      }),
  });
}

// ─── Comments ───────────────────────────────────────────

export function useComments(
  workspaceId: string,
  projectId: string,
  taskId: string | null,
) {
  return useQuery({
    queryKey: [
      'workspaces', workspaceId, 'projects', projectId, 'tasks', taskId, 'comments',
    ],
    queryFn: () =>
      apiFetch<{comments: CommentWithAuthor[]}>(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
      ).then(r => r.comments),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
}

export function useCreateComment(
  workspaceId: string,
  projectId: string,
  taskId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiFetch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
        {method: 'POST', body: JSON.stringify(input)},
      ),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [
          'workspaces', workspaceId, 'projects', projectId, 'tasks', taskId, 'comments',
        ],
      }),
  });
}
