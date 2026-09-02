'use client';

import {useParams} from 'next/navigation';
import TaskList from '@/components/specific/TaskList';
import {useWorkspaces} from '@/services/workspaces';
import {useProjects} from '@/services/projects';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const {data: workspaces} = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id ?? '';
  const {data: projects} = useProjects(workspaceId || null);
  const project = projects?.find(p => p.id === projectId);

  if (!projectId) {
    return <div className="text-center mt-10">Project ID not found.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
        {project?.title ?? 'Project'}
      </h1>
      <TaskList workspaceId={workspaceId} projectId={projectId} />
    </div>
  );
}
