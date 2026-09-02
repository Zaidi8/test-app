import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiFetch} from '@/lib/api-client';
import type {
  Workspace,
  Member,
  CreateWorkspaceInput,
  AddMemberInput,
  UpdateMemberInput,
} from '@prioritree/shared';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () =>
      apiFetch<{workspaces: Workspace[]}>('/workspaces').then(r => r.workspaces),
  });
}

export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspaces', workspaceId],
    queryFn: () =>
      apiFetch<{workspace: Workspace}>(`/workspaces/${workspaceId}`).then(
        r => r.workspace,
      ),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) =>
      apiFetch<{workspace: Workspace}>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(input),
      }).then(r => r.workspace),
    onSuccess: () => qc.invalidateQueries({queryKey: ['workspaces']}),
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {name?: string}) =>
      apiFetch<{workspace: Workspace}>(`/workspaces/${workspaceId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }).then(r => r.workspace),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['workspaces']});
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId]});
    },
  });
}

export function useDeleteWorkspace(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/workspaces/${workspaceId}`, {method: 'DELETE'}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['workspaces']}),
  });
}

export function useMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () =>
      apiFetch<{members: Member[]}>(`/workspaces/${workspaceId}/members`).then(
        r => r.members,
      ),
    enabled: !!workspaceId,
  });
}

export function useAddMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMemberInput) =>
      apiFetch<{member: Member}>(`/workspaces/${workspaceId}/members`, {
        method: 'POST',
        body: JSON.stringify(input),
      }).then(r => r.member),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'members']}),
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({userId, data}: {userId: string; data: UpdateMemberInput}) =>
      apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'members']}),
  });
}

export function useRemoveMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'members']}),
  });
}
