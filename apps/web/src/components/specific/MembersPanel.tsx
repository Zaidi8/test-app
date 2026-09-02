'use client';

import {toast} from 'sonner';
import {useAuth} from '@/lib/auth-provider';
import {Button} from '@/components/ui/button';
import InviteMemberForm from './InviteMemberForm';
import MembersList from './MembersList';
import {useInvitations, useRevokeInvitation} from '@/services/invitations';
import {useMembers} from '@/services/workspaces';

export default function MembersPanel({workspaceId}: {workspaceId: string}) {
  const {user} = useAuth();
  const {data: members = []} = useMembers(workspaceId || null);
  const {data: invitations = []} = useInvitations(workspaceId || null);
  const revoke = useRevokeInvitation(workspaceId);

  const current = members.find(m => m.id === user?.id);
  const canInvite = current?.role === 'owner' || current?.role === 'admin';

  if (!workspaceId) return null;

  return (
    <div className="space-y-4">
      <MembersList workspaceId={workspaceId} />

      {canInvite && (
        <div className="border-t pt-4 space-y-3">
          <InviteMemberForm workspaceId={workspaceId} />

          {invitations.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-500">Pending invites</h4>
              <ul className="space-y-1">
                {invitations.map(inv => (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{inv.email}</span>
                    <Button
                      className="h-6 px-2 text-xs cursor-pointer"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await revoke.mutateAsync(inv.id);
                          toast.success('Invitation revoked');
                        } catch {
                          toast.error('Failed to revoke');
                        }
                      }}>
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
