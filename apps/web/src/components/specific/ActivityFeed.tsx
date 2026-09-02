'use client';

import {useState} from 'react';
import {useActivities} from '@/services/activities';
import {useMembers} from '@/services/workspaces';
import type {ActivityWithActor, ActivityType} from '@prioritree/shared';

const TEXT: Record<ActivityType, (meta: Record<string, unknown>) => string> = {
  'task:created': meta => `created task ${String(meta?.title ?? '')}`.trim(),
  'task:updated': meta => `updated task ${String(meta?.title ?? '')}`.trim(),
  'task:deleted': () => 'deleted a task',
  'task:statusChanged': meta => `moved task to ${String(meta?.status ?? '')}`,
  'comment:created': () => 'commented on a task',
  'comment:updated': () => 'edited a comment',
  'comment:deleted': () => 'deleted a comment',
  'member:joined': () => 'joined the workspace',
  'member:roleChanged': meta => `changed a member's role to ${String(meta?.role ?? '')}`,
  'member:left': () => 'left the workspace',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}

export default function ActivityFeed({workspaceId}: {workspaceId: string}) {
  const [page, setPage] = useState(1);
  const {data, isLoading} = useActivities(workspaceId || null, page, 10);
  const {data: members = []} = useMembers(workspaceId || null);

  const nameById = new Map(members.map(m => [m.id, m.name]));

  if (!workspaceId) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Activity</h3>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : (
        <ul className="space-y-1.5">
          {data?.activities.map((a: ActivityWithActor) => (
            <li key={a.id} className="text-xs text-gray-600">
              <span className="font-medium text-gray-800">
                {a.actor?.name ?? nameById.get(a.actorId) ?? 'Someone'}
              </span>{' '}
              {TEXT[a.type]?.(a.metadata ?? {}) || 'did something'}
              <span className="text-gray-400"> · {formatTime(a.createdAt)}</span>
            </li>
          ))}
          {data && data.activities.length === 0 && (
            <li className="text-xs text-gray-400">No activity yet.</li>
          )}
        </ul>
      )}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <button
            className="cursor-pointer disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}>
            ← Prev
          </button>
          <span className="text-gray-400">
            {data.pagination.page}/{data.pagination.totalPages}
          </span>
          <button
            className="cursor-pointer disabled:opacity-40"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
