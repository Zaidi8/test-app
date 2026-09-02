'use client';

import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useCreateInvitation} from '@/services/invitations';

const ROLES = ['admin', 'member', 'viewer'] as const;
type InviteRole = (typeof ROLES)[number];

export default function InviteMemberForm({workspaceId}: {workspaceId: string}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('member');
  const createInvitation = useCreateInvitation(workspaceId);

  const handleInvite = async () => {
    if (!workspaceId || !email.trim()) return;
    try {
      await createInvitation.mutateAsync({email: email.trim(), role});
      toast.success(`Invitation sent to ${email.trim()}`);
      setEmail('');
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Invite member</h3>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="teammate@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value as InviteRole)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          {ROLES.map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button
          className="w-full cursor-pointer"
          onClick={handleInvite}
          disabled={!workspaceId || !email.trim() || createInvitation.isPending}>
          {createInvitation.isPending ? 'Sending...' : 'Send invite'}
        </Button>
      </div>
    </div>
  );
}
