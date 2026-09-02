'use client';

import {useParams} from 'next/navigation';
import AddedTasks from '@/components/specific/AddedTasks';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) {
    return <div className="text-center mt-10">Project ID not found.</div>;
  }

  // TODO(T5): fetch the project title via the projects API. The Mongo data
  // layer is not wired up yet, so we show a generic heading for now.
  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Project</h1>
      <AddedTasks />
    </div>
  );
}
