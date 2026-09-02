import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiFetch} from '@/lib/api-client';
import type {
  Invitation,
  CreateInvitationInput,
} from '@prioritree/shared';

export function useInvitations(workspaceId: string | null) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'invitations'],
    queryFn: () =>
      apiFetch<{invitations: Invitation[]}>(
        `/workspaces/${workspaceId}/invitations`,
      ).then(r => r.invitations),
    enabled: !!workspaceId,
  });
}

export function useCreateInvitation(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvitationInput) =>
      apiFetch<{invitation: Invitation}>(
        `/workspaces/${workspaceId}/invitations`,
        {method: 'POST', body: JSON.stringify(input)},
      ).then(r => r.invitation),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'invitations']}),
  });
}

export function useRevokeInvitation(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiFetch(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['workspaces', workspaceId, 'invitations']}),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch<{workspace: {id: string; name: string; slug: string}}>(
        `/invitations/${token}/accept`,
        {method: 'POST'},
      ),
    onSuccess: () => qc.invalidateQueries({queryKey: ['workspaces']}),
  });
}
