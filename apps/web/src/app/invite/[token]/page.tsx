'use client';

import {useEffect, useRef} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {useAcceptInvitation} from '@/services/invitations';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const accept = useAcceptInvitation();
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    (async () => {
      try {
        await accept.mutateAsync(token);
        toast.success('Welcome to the workspace!');
        router.push('/dashboard/projects');
      } catch {
        toast.error('This invitation is invalid or has expired');
        router.push('/dashboard/projects');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        {accept.isPending ? 'Accepting invitation…' : 'Redirecting…'}
      </div>
    </div>
  );
}
