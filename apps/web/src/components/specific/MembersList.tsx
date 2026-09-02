'use client';

import {toast} from 'sonner';
import {useAuth} from '@/lib/auth-provider';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useMembers, useRemoveMember, useUpdateMemberRole} from '@/services/workspaces';
import type {Member, WorkspaceRole} from '@prioritree/shared';

const ROLES: WorkspaceRole[] = ['owner', 'admin', 'member', 'viewer'];

const ROLE_BADGE: Record<WorkspaceRole, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  member: 'bg-gray-100 text-gray-700',
  viewer: 'bg-gray-100 text-gray-500',
};

export default function MembersList({workspaceId}: {workspaceId: string}) {
  const {user} = useAuth();
  const {data: members = []} = useMembers(workspaceId || null);
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const current = members.find(m => m.id === user?.id);
  const canManage = current?.role === 'owner' || current?.role === 'admin';

  if (!canManage) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Members</h3>
        <ul className="space-y-1">
          {members.map(m => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{m.name}</span>
              <Badge className={ROLE_BADGE[m.role]}>{m.role}</Badge>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleRoleChange = async (member: Member, role: WorkspaceRole) => {
    if (role === member.role) return;
    try {
      await updateRole.mutateAsync({userId: member.id, data: {role}});
      toast.success(`${member.name} is now ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (member: Member) => {
    try {
      await removeMember.mutateAsync(member.id);
      toast.success(`${member.name} removed`);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Members</h3>
      <ul className="space-y-1">
        {members.map(m => (
          <li key={m.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 truncate">{m.name}</span>
            <select
              value={m.role}
              disabled={m.role === 'owner'}
              onChange={e => handleRoleChange(m, e.target.value as WorkspaceRole)}
              className="h-7 rounded border border-input bg-transparent px-1 text-xs">
              {ROLES.filter(r => r !== 'owner').map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {m.role !== 'owner' && (
              <Button
                className="h-6 px-2 text-xs cursor-pointer"
                variant="ghost"
                onClick={() => handleRemove(m)}
                disabled={removeMember.isPending}>
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
