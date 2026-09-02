'use client';

import {useState, type FormEvent, type ReactNode} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {useComments, useCreateComment} from '@/services/tasks';
import {useAuth} from '@/lib/auth-provider';

export default function TaskComments({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const {user} = useAuth();
  const {data: comments = []} = useComments(workspaceId, projectId, taskId);
  const createComment = useCreateComment(workspaceId, projectId, taskId);
  const [body, setBody] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await createComment.mutateAsync({body: body.trim()});
      setBody('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Comments</h4>

      <ul className="space-y-2">
        {comments.map(c => {
          const isMentioned =
            !!user && c.mentions.some(m => m.toLowerCase() === user.name.toLowerCase());
          return (
            <li key={c.id} className="text-sm bg-gray-50 rounded p-2">
              <span className="font-medium">{c.author?.name ?? 'Someone'}</span>{' '}
              <span className="text-gray-400 text-xs">
                {new Date(c.createdAt).toLocaleString()}
              </span>
              <p className="mt-1 text-gray-700">
                {highlightMentions(c.body, isMentioned)}
              </p>
            </li>
          );
        })}
        {comments.length === 0 && (
          <li className="text-xs text-gray-400">No comments yet.</li>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment… use @name to mention someone"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <Button
          className="cursor-pointer"
          size="sm"
          type="submit"
          disabled={!body.trim() || createComment.isPending}>
          {createComment.isPending ? 'Posting…' : 'Comment'}
        </Button>
      </form>
    </div>
  );
}

function highlightMentions(body: string, highlight: boolean): ReactNode {
  if (!highlight) return body;
  return body.split(/(@\w+)/g).map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-blue-600 font-medium">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
